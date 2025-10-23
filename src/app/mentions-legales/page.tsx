// app/mentions-legales/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

export default function MentionsLegales() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Mentions Légales
            </h1>
            <p className="text-xl text-gray-200">
              Informations légales concernant Hi-ring
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l&apos;économie numérique, il est précisé aux utilisateurs du site Hi-ring l&apos;identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">1. Éditeur du site</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Raison sociale :</strong> Hi-ring<br />
                  <strong>Activité :</strong> Cabinet de conseil en recrutement<br />
                  <strong>Siège social :</strong> France<br />
                  <strong>Email :</strong> <a href="mailto:contact@hi-ring.fr" className="text-[#ffaf50ff] hover:underline">contact@hi-ring.fr</a><br />
                  <strong>Téléphone :</strong><br />
                  - Hugo Mathieu : <a href="tel:+33666747618" className="text-[#ffaf50ff] hover:underline">06 66 74 76 18</a><br />
                  - Izia Grazilly : <a href="tel:+33609111598" className="text-[#ffaf50ff] hover:underline">06 09 11 15 98</a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>Directeur de la publication :</strong> Hugo Mathieu & Izia Grazilly
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">2. Hébergement</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le site est hébergé par :<br />
                  <strong>Vercel Inc.</strong><br />
                  340 S Lemon Ave #4133<br />
                  Walnut, CA 91789, USA<br />
                  Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#ffaf50ff] hover:underline">www.vercel.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">3. Propriété intellectuelle</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le site Hi-ring et l&apos;ensemble de son contenu (structure, textes, logos, images, vidéos, graphismes, données) sont la propriété exclusive de Hi-ring ou de ses partenaires.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l&apos;autorisation écrite préalable de Hi-ring.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">4. Données personnelles</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Hi-ring accorde une grande importance à la protection de vos données personnelles et s&apos;engage à les traiter conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Pour plus d&apos;informations sur le traitement de vos données personnelles, veuillez consulter notre <a href="/confidentialite" className="text-[#ffaf50ff] hover:underline">Politique de Confidentialité</a>.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>Responsable du traitement :</strong> Hi-ring<br />
                  <strong>Délégué à la protection des données (DPO) :</strong> contact@hi-ring.fr
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">5. Cookies</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le site utilise des cookies pour améliorer l&apos;expérience utilisateur et réaliser des statistiques de visites.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Pour plus d&apos;informations sur l&apos;utilisation des cookies, consultez notre <a href="/cookies" className="text-[#ffaf50ff] hover:underline">Politique de Cookies</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">6. Conditions d&apos;utilisation</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  L&apos;utilisation du site implique l&apos;acceptation pleine et entière des <a href="/cgu" className="text-[#ffaf50ff] hover:underline">Conditions Générales d&apos;Utilisation</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">7. Limitation de responsabilité</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Hi-ring s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Hi-ring ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition sur ce site.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Hi-ring ne saurait être tenu responsable :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-4">
                  <li>Des interruptions ou indisponibilités du site</li>
                  <li>Des dommages directs ou indirects résultant de l&apos;utilisation du site</li>
                  <li>Du contenu des sites externes vers lesquels le site renvoie</li>
                  <li>De l&apos;utilisation frauduleuse ou abusive du site par un tiers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">8. Droit applicable</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d&apos;accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">9. Crédits</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Conception et développement :</strong> Hi-ring<br />
                  <strong>Hébergement :</strong> Vercel Inc.<br />
                  <strong>Photos :</strong> Unsplash & Photos personnelles<br />
                  <strong>Icônes :</strong> Lucide React
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">10. Médiation</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Conformément à l&apos;article L.616-1 du Code de la consommation, nous vous informons de la possibilité de recourir à une médiation conventionnelle en cas de litige.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>Plateforme de résolution des litiges en ligne :</strong><br />
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#ffaf50ff] hover:underline">https://ec.europa.eu/consumers/odr</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">11. Contact</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Pour toute question concernant les mentions légales ou le site en général :
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>Email :</strong> <a href="mailto:contact@hi-ring.fr" className="text-[#ffaf50ff] hover:underline">contact@hi-ring.fr</a><br />
                  <strong>Téléphone :</strong><br />
                  - Hugo Mathieu : <a href="tel:+33666747618" className="text-[#ffaf50ff] hover:underline">06 66 74 76 18</a><br />
                  - Izia Grazilly : <a href="tel:+33609111598" className="text-[#ffaf50ff] hover:underline">06 09 11 15 98</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
