// src/app/components/offres-public/JobMap.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapPin, Maximize2, Minimize2, X, Building2, Briefcase, Euro } from 'lucide-react'
import Link from 'next/link'

// French city coordinates (major cities + variations)
const CITY_COORDINATES: Record<string, [number, number]> = {
  // Major cities
  'Paris': [48.8566, 2.3522],
  'Lyon': [45.7640, 4.8357],
  'Marseille': [43.2965, 5.3698],
  'Toulouse': [43.6047, 1.4442],
  'Bordeaux': [44.8378, -0.5792],
  'Nantes': [47.2184, -1.5536],
  'Lille': [50.6292, 3.0573],
  'Strasbourg': [48.5734, 7.7521],
  'Nice': [43.7102, 7.2620],
  'Montpellier': [43.6108, 3.8767],
  'Rennes': [48.1173, -1.6778],
  'Grenoble': [45.1885, 5.7245],
  'Rouen': [49.4432, 1.0999],
  'Toulon': [43.1242, 5.9280],
  'Clermont-Ferrand': [45.7772, 3.0870],
  'Le Havre': [49.4944, 0.1079],
  'Reims': [49.2583, 4.0317],
  'Saint-Étienne': [45.4397, 4.3872],
  'Angers': [47.4784, -0.5632],
  'Dijon': [47.3220, 5.0415],
  'Brest': [48.3904, -4.4861],
  'Le Mans': [48.0061, 0.1996],
  'Aix-en-Provence': [43.5297, 5.4474],
  'Amiens': [49.8941, 2.2958],
  'Tours': [47.3941, 0.6848],
  'Limoges': [45.8336, 1.2611],
  'Metz': [49.1193, 6.1757],
  'Besançon': [47.2378, 6.0241],
  'Orléans': [47.9029, 1.9039],
  'Caen': [49.1829, -0.3707],
  'Perpignan': [42.6887, 2.8948],
  'Nancy': [48.6921, 6.1844],
  // Île-de-France suburbs
  'Boulogne-Billancourt': [48.8352, 2.2410],
  'Saint-Denis': [48.9362, 2.3574],
  'Nanterre': [48.8924, 2.2072],
  'Versailles': [48.8014, 2.1301],
  'Courbevoie': [48.8966, 2.2566],
  'La Défense': [48.8918, 2.2386],
  'Issy-les-Moulineaux': [48.8242, 2.2700],
  'Levallois-Perret': [48.8933, 2.2883],
  // Remote/Hybrid
  'Remote': [46.6034, 2.3488],
  'Hybride': [46.6034, 2.3488],
  'Télétravail': [46.6034, 2.3488],
  'France': [46.6034, 2.3488]
}

// France center for default view
const FRANCE_CENTER: [number, number] = [46.6034, 2.3488]
const DEFAULT_ZOOM = 6

interface JobOffer {
  id: string
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  categorie: string
}

interface JobMapProps {
  offers: JobOffer[]
  onOfferClick?: (offer: JobOffer) => void
  className?: string
}

// Cluster offers by city
interface CityCluster {
  city: string
  coordinates: [number, number]
  offers: JobOffer[]
}

// City aliases for common variations
const CITY_ALIASES: Record<string, string> = {
  'aix': 'Aix-en-Provence',
  'st etienne': 'Saint-Étienne',
  'saint etienne': 'Saint-Étienne',
  'clermont': 'Clermont-Ferrand',
  'defense': 'La Défense',
  'la defense': 'La Défense',
  'boulogne': 'Boulogne-Billancourt',
  'issy': 'Issy-les-Moulineaux',
  'levallois': 'Levallois-Perret',
  'saint denis': 'Saint-Denis',
  'st denis': 'Saint-Denis',
  'le havre': 'Le Havre',
  'le mans': 'Le Mans',
}

// Find matching city from lieu string (handles "Paris, France", "AIX", "Lyon et Paris", etc.)
function findCityFromLieu(lieu: string): string | null {
  const lieuLower = lieu.toLowerCase().trim()

  // First check aliases for common short names
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (lieuLower.includes(alias)) {
      return city
    }
  }

  // Check each city in our coordinates map
  for (const city of Object.keys(CITY_COORDINATES)) {
    if (lieuLower.includes(city.toLowerCase())) {
      return city
    }
  }

  // No match found
  return null
}

function clusterOffersByCity(offers: JobOffer[]): CityCluster[] {
  const clusters: Record<string, CityCluster> = {}

  offers.forEach(offer => {
    const matchedCity = findCityFromLieu(offer.lieu)

    if (matchedCity) {
      const coords = CITY_COORDINATES[matchedCity]
      if (!clusters[matchedCity]) {
        clusters[matchedCity] = {
          city: matchedCity,
          coordinates: coords,
          offers: []
        }
      }
      clusters[matchedCity].offers.push(offer)
    }
  })

  return Object.values(clusters)
}

// The actual map component (loaded dynamically)
function MapContent({ offers, onOfferClick }: JobMapProps) {
  const [MapContainer, setMapContainer] = useState<typeof import('react-leaflet').MapContainer | null>(null)
  const [TileLayer, setTileLayer] = useState<typeof import('react-leaflet').TileLayer | null>(null)
  const [Marker, setMarker] = useState<typeof import('react-leaflet').Marker | null>(null)
  const [Popup, setPopup] = useState<typeof import('react-leaflet').Popup | null>(null)
  const [L, setL] = useState<typeof import('leaflet') | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<CityCluster | null>(null)

  useEffect(() => {
    // Dynamic import of Leaflet and react-leaflet
    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([reactLeaflet, leaflet]) => {
      setMapContainer(() => reactLeaflet.MapContainer)
      setTileLayer(() => reactLeaflet.TileLayer)
      setMarker(() => reactLeaflet.Marker)
      setPopup(() => reactLeaflet.Popup)
      setL(() => leaflet.default)

      // Fix Leaflet default icon issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    })
  }, [])

  const clusters = useMemo(() => clusterOffersByCity(offers), [offers])

  // Create custom icon based on cluster size
  const createClusterIcon = (count: number) => {
    if (!L) return undefined

    const size = count >= 10 ? 50 : count >= 5 ? 40 : 30
    const color = count >= 10 ? '#dc2626' : count >= 5 ? '#f59e0b' : '#22c55e'

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size / 3}px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        ">${count}</div>
      `,
      className: 'custom-cluster-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
  }

  if (!MapContainer || !TileLayer || !Marker || !Popup || !L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <MapPin className="w-8 h-8 animate-pulse" />
          <span>Chargement de la carte...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <MapContainer
        center={FRANCE_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster) => (
          <Marker
            key={cluster.city}
            position={cluster.coordinates}
            icon={createClusterIcon(cluster.offers.length)}
            eventHandlers={{
              click: () => setSelectedCluster(cluster)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  {cluster.city}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {cluster.offers.length} offre{cluster.offers.length > 1 ? 's' : ''} disponible{cluster.offers.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => setSelectedCluster(cluster)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Voir les offres
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Cluster detail panel */}
      {selectedCluster && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-xl z-[1000] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                {selectedCluster.city}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedCluster.offers.length} offre{selectedCluster.offers.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setSelectedCluster(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedCluster.offers.map((offer) => (
              <Link
                key={offer.id}
                href={`/offres-emploi/${offer.id}`}
                onClick={() => onOfferClick?.(offer)}
                className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {offer.titre}
                </h4>
                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{offer.entreprise}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{offer.typeContrat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-3.5 h-3.5" />
                    <span>{offer.salaire}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                    {offer.categorie}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Wrapper component with expand/collapse functionality
export default function JobMap({ offers, onOfferClick, className = '' }: JobMapProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render on server
  if (!isMounted) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <MapPin className="w-8 h-8" />
            <span>Chargement...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
        <div className="absolute top-4 right-4 z-[1001]">
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Réduire</span>
          </button>
        </div>
        <MapContent offers={offers} onOfferClick={onOfferClick} />
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
        <div className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            Carte des offres
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Agrandir</span>
        </button>
      </div>

      {/* Map */}
      <div className="h-64 sm:h-80">
        <MapContent offers={offers} onOfferClick={onOfferClick} />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg z-[1000]">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">1-4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600 dark:text-gray-400">5-9</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">10+</span>
          </div>
        </div>
      </div>
    </div>
  )
}
