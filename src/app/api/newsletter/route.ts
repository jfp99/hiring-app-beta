// app/api/newsletter/route.ts
import { NextResponse } from 'next/server'

// Simulation base de données
let abonnes: Array<{ email: string; dateInscription: string; statut: string }> = []

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'L\'adresse email est obligatoire' },
        { status: 400 }
      )
    }

    // Validation email
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Vérifier si déjà inscrit
    const dejaInscrit = abonnes.find(abonne => abonne.email === email)
    if (dejaInscrit) {
      return NextResponse.json(
        { error: 'Cette adresse email est déjà inscrite à notre newsletter' },
        { status: 409 }
      )
    }

    // Ajouter l'abonné
    const nouvelAbonne = {
      email,
      dateInscription: new Date().toISOString(),
      statut: 'actif'
    }
    
    abonnes.push(nouvelAbonne)

    console.log('📧 Nouvel abonné newsletter:', email)

    // Simulation envoi email de bienvenue
    console.log('✉️ Email de bienvenue envoyé à:', email)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Félicitations ! Vous êtes maintenant inscrit à notre newsletter.',
        email,
        dateInscription: nouvelAbonne.dateInscription
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Erreur API newsletter:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription à la newsletter' },
      { status: 500 }
    )
  }
}

// Stats newsletter (pour dashboard)
export async function GET() {
  return NextResponse.json({
    totalAbonnes: abonnes.length,
    abonnesActifs: abonnes.filter(a => a.statut === 'actif').length,
    derniersAbonnes: abonnes.slice(-5),
    message: 'Newsletter HiringSimple - OK'
  })
}