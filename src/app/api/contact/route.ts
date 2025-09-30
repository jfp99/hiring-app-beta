// app/api/contact/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { nom, email, telephone, sujet, message, type } = await request.json()

    // Validation alignée avec votre frontend
    if (!nom?.trim() || !email?.trim() || !sujet?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation email simple
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Simulation d'envoi d'email - adapté à votre logique métier
    console.log('🎯 Nouveau message HiringSimple:', {
      type: type || 'candidat',
      nom,
      email,
      telephone: telephone || 'Non renseigné',
      sujet,
      message,
      date: new Date().toLocaleDateString('fr-FR'),
      heure: new Date().toLocaleTimeString('fr-FR')
    })

    // Simulation de sauvegarde en base de données
    const contactRecord = {
      id: Date.now().toString(),
      nom,
      email,
      telephone,
      sujet,
      message,
      type: type || 'candidat',
      statut: 'nouveau',
      dateCreation: new Date().toISOString()
    }

    console.log('💾 Contact sauvegardé:', contactRecord)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Votre message a été envoyé avec succès ! Nous vous recontacterons dans les plus brefs délais.',
        data: {
          id: contactRecord.id,
          type: contactRecord.type
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Erreur API contact:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

// Optionnel : récupérer les contacts (pour dashboard admin)
export async function GET() {
  // En production, récupérer depuis la base de données
  return NextResponse.json({
    message: 'API Contact HiringSimple - OK',
    version: '1.0'
  })
}