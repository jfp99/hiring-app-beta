// app/cgu/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

export default function CGU() {
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
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-xl text-gray-200">
              Les règles d&apos;utilisation de la plateforme Hi-ring
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">1. Objet</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet de définir les modalités et conditions d&apos;utilisation du site web et des services proposés par Hi-ring, cabinet de conseil en recrutement.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  En accédant et en utilisant ce site, vous acceptez sans réserve les présentes CGU.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">2. Mentions légales</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Éditeur du site :</strong><br />
                  Hi-ring<br />
                  Cabinet de conseil en recrutement<br />
                  France & International<br />
                  Email : contact@hi-ring.fr<br />
                  Téléphone : Hugo - 06 66 74 76 18 | Izia - 06 09 11 15 98
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>Hébergeur :</strong><br />
                  Vercel Inc.<br />
                  340 S Lemon Ave #4133<br />
                  Walnut, CA 91789, USA
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">3. Accès au site</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès Internet. Tous les frais liés à l&apos;accès au site (matériel informatique, connexion Internet) sont à la charge de l&apos;utilisateur.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Hi-ring met en œuvre tous les moyens raisonnables pour assurer un accès de qualité au site, mais n&apos;est tenu à aucune obligation d&apos;y parvenir. Hi-ring se réserve le droit d&apos;interrompre, suspendre momentanément ou modifier l&apos;accès au site sans préavis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">4. Services proposés</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Hi-ring propose les services suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Consultation des offres d&apos;emploi</li>
                  <li>Dépôt de candidatures en ligne</li>
                  <li>Mise en relation entre candidats et entreprises</li>
                  <li>Accompagnement personnalisé dans la recherche d&apos;emploi</li>
                  <li>Conseil en recrutement pour les entreprises</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">5. Inscription et compte utilisateur</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  L&apos;utilisation de certains services peut nécessiter la création d&apos;un compte utilisateur. Vous vous engagez à fournir des informations exactes et à jour, et à maintenir la confidentialité de vos identifiants de connexion.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Vous êtes responsable de toutes les activités effectuées via votre compte. En cas d&apos;utilisation frauduleuse, vous devez immédiatement nous en informer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">6. Obligations de l&apos;utilisateur</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  En utilisant ce site, vous vous engagez à :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Respecter les lois et règlements en vigueur</li>
                  <li>Fournir des informations exactes et sincères</li>
                  <li>Ne pas usurper l&apos;identité d&apos;une autre personne</li>
                  <li>Ne pas diffuser de contenu illégal, offensant ou discriminatoire</li>
                  <li>Ne pas tenter de contourner les mesures de sécurité du site</li>
                  <li>Ne pas utiliser le site à des fins commerciales sans autorisation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">7. Propriété intellectuelle</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  L&apos;ensemble du contenu du site (textes, images, logos, graphiques, vidéos, base de données) est protégé par le droit d&apos;auteur et appartient à Hi-ring ou à ses partenaires.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de Hi-ring.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">8. Protection des données personnelles</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le traitement de vos données personnelles est effectué conformément au RGPD et à notre <a href="/confidentialite" className="text-[#ffaf50ff] hover:underline">Politique de Confidentialité</a>.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition concernant vos données personnelles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">9. Cookies</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le site utilise des cookies pour améliorer votre expérience utilisateur. Pour plus d&apos;informations, consultez notre <a href="/cookies" className="text-[#ffaf50ff] hover:underline">Politique de Cookies</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">10. Responsabilité</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Hi-ring s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur le site, mais ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Hi-ring ne saurait être tenu responsable :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-4">
                  <li>Des dommages directs ou indirects causés au matériel de l&apos;utilisateur</li>
                  <li>De l&apos;indisponibilité temporaire ou totale du site</li>
                  <li>De l&apos;utilisation frauduleuse ou abusive du site par un tiers</li>
                  <li>Des contenus publiés par les utilisateurs</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">11. Liens hypertextes</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le site peut contenir des liens vers d&apos;autres sites web. Hi-ring n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">12. Modification des CGU</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Hi-ring se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles conditions seront applicables dès leur mise en ligne. Il est conseillé de consulter régulièrement cette page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">13. Droit applicable et juridiction</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Les présentes CGU sont régies par le droit français. En cas de litige, et après tentative de recherche d&apos;une solution amiable, les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">14. Contact</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Pour toute question concernant les présentes CGU :
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>Email :</strong> <a href="mailto:contact@hi-ring.fr" className="text-[#ffaf50ff] hover:underline">contact@hi-ring.fr</a><br />
                  <strong>Téléphone :</strong> Hugo - 06 66 74 76 18 | Izia - 06 09 11 15 98
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
