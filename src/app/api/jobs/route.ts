// app/api/jobs/route.ts
import { NextResponse } from 'next/server'

// Données 100% alignées avec votre frontend
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
  },
  {
    id: '2',
    titre: 'Chef de Projet Digital',
    entreprise: 'DigitalBoost',
    lieu: 'Lyon',
    typeContrat: 'CDI',
    salaire: '50K-60K €',
    description: 'Rejoignez notre équipe en tant que chef de projet digital pour piloter des projets innovants.',
    responsabilites: [
      'Gestion de projets digitaux de A à Z',
      'Coordination des équipes techniques et créatives',
      'Suivi budgétaire et reporting'
    ],
    qualifications: [
      '5 ans d\'expérience en gestion de projet',
      'Maîtrise des méthodologies Agile',
      'Excellentes compétences en communication'
    ],
    avantages: [
      'Formation continue',
      'Prime annuelle',
      'Horaires flexibles'
    ],
    datePublication: '2024-01-10',
    categorie: 'Management'
  },
  {
    id: '3',
    titre: 'Data Analyst',
    entreprise: 'DataCorp',
    lieu: 'Toulouse',
    typeContrat: 'CDI',
    salaire: '40K-50K €',
    description: 'Analyste de données pour transformer les données en insights actionnables.',
    responsabilites: [
      'Analyser et interpréter des données complexes',
      'Créer des dashboards et rapports',
      'Collaborer avec les équipes métier'
    ],
    qualifications: [
      'Maîtrise de SQL et Python',
      'Expérience avec Tableau ou Power BI',
      'Compétences en statistiques'
    ],
    avantages: [
      'Équipement fourni',
      'Congés supplémentaires',
      'Événements d\'entreprise'
    ],
    datePublication: '2024-01-08',
    categorie: 'Data'
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Paramètres alignés avec vos filtres frontend
    const categorie = searchParams.get('categorie')
    const lieu = searchParams.get('lieu')
    const typeContrat = searchParams.get('typeContrat')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    let offresFiltrees = [...offresEmploi]

    // Filtrage par recherche - aligné avec votre frontend
    if (search) {
      offresFiltrees = offresFiltrees.filter(offre =>
        offre.titre.toLowerCase().includes(search.toLowerCase()) ||
        offre.entreprise.toLowerCase().includes(search.toLowerCase()) ||
        offre.description.toLowerCase().includes(search.toLowerCase()) ||
        offre.categorie.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtres alignés avec vos selects frontend
    if (categorie && categorie !== 'toutes') {
      offresFiltrees = offresFiltrees.filter(offre => 
        offre.categorie === categorie
      )
    }

    if (lieu && lieu !== 'tous') {
      offresFiltrees = offresFiltrees.filter(offre => 
        offre.lieu === lieu
      )
    }

    if (typeContrat && typeContrat !== 'tous') {
      offresFiltrees = offresFiltrees.filter(offre => 
        offre.typeContrat === typeContrat
      )
    }

    // Pagination pour le chargement progressif
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const offresPaginees = offresFiltrees.slice(startIndex, endIndex)

    // Métadonnées pour votre frontend
    const total = offresFiltrees.length
    const totalPages = Math.ceil(total / limit)

    console.log(`📊 API Jobs - ${offresFiltrees.length} offres trouvées`)

    return NextResponse.json({
      offres: offresPaginees,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filtres: {
        search,
        categorie,
        lieu,
        typeContrat
      }
    })

  } catch (error) {
    console.error('❌ Erreur API jobs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des offres' },
      { status: 500 }
    )
  }
}

// Créer une nouvelle offre (pour l'admin)
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validation alignée avec votre structure de données
    const champsObligatoires = ['titre', 'entreprise', 'lieu', 'typeContrat', 'description']
    for (const champ of champsObligatoires) {
      if (!data[champ]) {
        return NextResponse.json(
          { error: `Le champ ${champ} est obligatoire` },
          { status: 400 }
        )
      }
    }

    const nouvelleOffre = {
      id: (offresEmploi.length + 1).toString(),
      ...data,
      datePublication: new Date().toISOString().split('T')[0],
      salaire: data.salaire || 'À négocier',
      categorie: data.categorie || 'Général',
      responsabilites: data.responsabilites || [],
      qualifications: data.qualifications || [],
      avantages: data.avantages || []
    }

    console.log('🆕 Nouvelle offre créée:', nouvelleOffre.titre)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Offre publiée avec succès',
        offre: nouvelleOffre 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ Erreur création offre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'offre' },
      { status: 500 }
    )
  }
}