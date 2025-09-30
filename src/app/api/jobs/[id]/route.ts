// app/api/jobs/[id]/route.ts
import { NextResponse } from 'next/server'

const offresEmploi = [
  {
    id: '1',
    titre: 'Développeur Full Stack',
    entreprise: 'TechInnov',
    lieu: 'Paris',
    typeContrat: 'CDI',
    salaire: '45K-55K €',
    description: 'Nous recherchons un développeur full stack passionné pour rejoindre notre équipe dynamique.',
    responsabilites: [
      'Développer des applications web modernes',
      'Collaborer avec les équipes produit et design',
      'Maintenir et améliorer le code existant'
    ],
    qualifications: [
      '3+ ans d\'expérience en développement',
      'Maîtrise de React et Node.js',
      'Expérience avec les bases de données SQL'
    ],
    avantages: [
      'Télétravail partiel',
      'Mutuelle entreprise',
      'Tickets restaurant'
    ],
    datePublication: '2024-01-15',
    categorie: 'Technologie'
  }
]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const offre = offresEmploi.find(o => o.id === params.id)

    if (!offre) {
      return NextResponse.json(
        { error: 'Offre d\'emploi non trouvée' },
        { status: 404 }
      )
    }

    console.log(`📄 Consultation offre: ${offre.titre}`)

    return NextResponse.json({ 
      offre,
      meta: {
        consultéeLe: new Date().toISOString(),
        entreprise: offre.entreprise,
        localisation: offre.lieu
      }
    })

  } catch (error) {
    console.error('❌ Erreur API détail offre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'offre' },
      { status: 500 }
    )
  }
}