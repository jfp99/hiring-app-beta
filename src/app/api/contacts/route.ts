// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId, sanitizeObject } from '@/app/lib/security';
import { auth } from '@/app/lib/auth-helpers';
import { contactSchema } from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for contacts GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    logger.debug('Fetching contacts from database');

    const { db } = await connectToDatabase();

    // Récupérer les contacts depuis les collections candidats et entreprises
    const [candidats, entreprises] = await Promise.all([
      db.collection('candidats').find({}).sort({ date: -1 }).toArray(),
      db.collection('entreprises').find({}).sort({ date: -1 }).toArray()
    ]);

    // Combiner et formater les données
    const contacts = [
      ...candidats.map(c => ({
        id: c._id.toString(),
        nom: c.nom || '',
        email: c.email || '',
        telephone: c.telephone || '',
        message: c.message || '',
        type: 'candidat' as const,
        date: c.date || c.createdAt || new Date().toISOString()
      })),
      ...entreprises.map(e => ({
        id: e._id.toString(),
        nom: e.nom || e.entreprise || '',
        email: e.email || '',
        telephone: e.telephone || '',
        message: e.message || e.besoins || '',
        type: 'entreprise' as const,
        date: e.date || e.createdAt || new Date().toISOString()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    logger.info('Contacts fetched successfully', {
      candidats: candidats.length,
      entreprises: entreprises.length,
      total: contacts.length
    });

    return NextResponse.json({ contacts });

  } catch (error: unknown) {
    logger.error('Failed to fetch contacts', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: (error instanceof Error ? error.message : 'Erreur inconnue') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for contacts POST', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    logger.debug('Creating new contact', { type: body.type });

    // Validate input with Zod schema
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Contact validation failed', { errors: validation.error.issues });
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de validation',
          details: validation.error.issues.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    // Sanitize data
    const sanitizedData = sanitizeObject(validation.data);

    const { db } = await connectToDatabase();

    // Determine collection based on type
    const collection = sanitizedData.type === 'candidat' ? 'candidats' : 'entreprises';

    // Add metadata
    const contactData = {
      ...sanitizedData,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    const result = await db.collection(collection).insertOne(contactData);

    logger.info('Contact created successfully', {
      id: result.insertedId.toString(),
      type: sanitizedData.type,
      collection
    });

    // Send email notifications (team + confirmation to sender)
    const emailStatus = { teamSent: false, confirmationSent: false, errors: [] as string[] };
    try {
      const { getEmailService } = await import('@/app/lib/email');
      const emailService = getEmailService();

      const notificationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d5016; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #fff; margin: 0;">Nouveau message de contact</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p><strong>Type :</strong> ${sanitizedData.type === 'candidat' ? 'Candidat' : 'Entreprise'}</p>
            <p><strong>Nom :</strong> ${sanitizedData.nom}</p>
            <p><strong>Email :</strong> <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></p>
            <p><strong>Telephone :</strong> ${sanitizedData.telephone || 'Non renseigne'}</p>
            <p><strong>Sujet :</strong> ${sanitizedData.sujet}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb;"/>
            <p><strong>Message :</strong></p>
            <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
              <p style="white-space: pre-wrap; margin: 0;">${sanitizedData.message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb;"/>
            <p style="color: #666; font-size: 12px;">
              Recu le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      `;

      const notificationText = [
        `Nouveau message de contact`,
        `Type : ${sanitizedData.type}`,
        `Nom : ${sanitizedData.nom}`,
        `Email : ${sanitizedData.email}`,
        `Telephone : ${sanitizedData.telephone || 'Non renseigne'}`,
        `Sujet : ${sanitizedData.sujet}`,
        `---`,
        `Message : ${sanitizedData.message}`
      ].join('\n');

      // Recipients from env var with fallback to hardcoded list
      const envRecipients = process.env.CONTACT_RECIPIENTS;
      const recipients = envRecipients
        ? envRecipients.split(',').map(e => e.trim()).filter(Boolean)
        : ['hugo@hi-ring.fr', 'izia@hi-ring.fr', 'jfpruvost99@gmail.com'];

      // Send to all team members with retry
      const teamResults = await Promise.allSettled(
        recipients.map(recipient =>
          emailService.sendEmailWithRetry({
            to: recipient,
            subject: `[Hi-Ring Contact] ${sanitizedData.sujet}`,
            text: notificationText,
            html: notificationHtml
          }, 2, 1500)
        )
      );

      const teamSuccesses = teamResults.filter(
        (r): r is PromiseFulfilledResult<import('@/app/lib/email').EmailResult> =>
          r.status === 'fulfilled' && r.value.success
      );
      const teamFailures = teamResults.filter(
        r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
      );

      emailStatus.teamSent = teamSuccesses.length > 0;

      if (teamFailures.length > 0) {
        const failureDetails = teamFailures.map((r, i) => {
          if (r.status === 'rejected') return `${recipients[i]}: ${r.reason}`;
          if (r.status === 'fulfilled' && !r.value.success) return `${recipients[i]}: ${r.value.error}`;
          return '';
        });
        emailStatus.errors.push(...failureDetails.filter(Boolean));
        logger.warn('Some team notification emails failed', { failures: failureDetails });
      }

      logger.info('Contact notification emails processed', {
        recipients,
        sent: teamSuccesses.length,
        failed: teamFailures.length
      });

      // Send confirmation email to the sender (accusé de réception)
      try {
        const confirmationHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2d5016; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #fff; margin: 0;">Hi-Ring - Confirmation de reception</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Bonjour ${sanitizedData.nom},</p>
              <p>Nous avons bien recu votre message concernant : <strong>${sanitizedData.sujet}</strong></p>
              <p>Notre equipe reviendra vers vous dans les plus brefs delais (sous 24h ouvrees).</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb;"/>
              <p style="color: #666; font-size: 12px;">
                Cet email est un accuse de reception automatique. Merci de ne pas y repondre directement.<br/>
                Pour toute question urgente, contactez-nous au 06 66 74 76 18.
              </p>
            </div>
          </div>
        `;

        const confirmResult = await emailService.sendEmailWithRetry({
          to: sanitizedData.email,
          subject: `Hi-Ring - Nous avons bien recu votre message`,
          text: `Bonjour ${sanitizedData.nom},\n\nNous avons bien recu votre message concernant : ${sanitizedData.sujet}\n\nNotre equipe reviendra vers vous dans les plus brefs delais.\n\nCordialement,\nL'equipe Hi-Ring`,
          html: confirmationHtml
        }, 2, 1500);

        emailStatus.confirmationSent = confirmResult.success;
        if (!confirmResult.success) {
          emailStatus.errors.push(`Confirmation to ${sanitizedData.email}: ${confirmResult.error}`);
          logger.warn('Failed to send confirmation email', { error: confirmResult.error });
        }
      } catch (confirmError) {
        logger.warn('Failed to send confirmation email', {
          error: confirmError instanceof Error ? confirmError.message : 'Unknown error'
        });
      }
    } catch (emailError) {
      const errorMsg = emailError instanceof Error ? emailError.message : 'Unknown error';
      emailStatus.errors.push(errorMsg);
      logger.error('Critical email sending failure', { error: errorMsg });
    }

    // Build response message based on email status
    let responseMessage = 'Votre message a été enregistré avec succès.';
    if (emailStatus.teamSent) {
      responseMessage = 'Votre message a été envoyé avec succès. Nous vous recontacterons dans les plus brefs délais.';
    } else {
      responseMessage = 'Votre message a été enregistré. Notre équipe le traitera rapidement.';
      logger.error('NO team emails were sent successfully', { errors: emailStatus.errors });
    }

    if (emailStatus.confirmationSent) {
      responseMessage += ' Un accusé de réception vous a été envoyé par email.';
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      id: result.insertedId.toString(),
      emailSent: emailStatus.teamSent,
      confirmationSent: emailStatus.confirmationSent
    });

  } catch (error: unknown) {
    logger.error('Failed to create contact', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for contacts DELETE', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  // Check authentication - only authenticated users can delete contacts
  const session = await auth();
  if (!session || !session.user) {
    logger.warn('Unauthorized contact deletion attempt', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Authentication required'
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      logger.warn('Contact deletion failed: missing ID or type');
      return NextResponse.json(
        {
          success: false,
          error: 'ID and type are required'
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      logger.warn('Contact deletion failed: invalid ObjectId', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contact ID format'
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Déterminer la collection en fonction du type
    const collection = type === 'candidat' ? 'candidats' : 'entreprises';

    logger.debug('Deleting contact', { collection, id });

    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      logger.warn('Contact not found for deletion', { id, collection });
      return NextResponse.json(
        {
          success: false,
          error: 'Contact not found'
        },
        { status: 404 }
      );
    }

    logger.info('Contact deleted successfully', {
      id,
      collection,
      type,
      deletedBy: session.user.email || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });

  } catch (error: unknown) {
    logger.error('Failed to delete contact', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete contact'
      },
      { status: 500 }
    );
  }
}
