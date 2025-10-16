// src/app/privacy/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Hi-ring',
  description: 'Politique de confidentialité et protection des données personnelles de Hi-ring.'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-[#3b5335ff] mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600 text-lg">
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Hi-ring s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations personnelles.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              2. Collecte des Données
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous collectons les types de données suivants:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Données d'identification:</strong> nom, prénom, email, téléphone</li>
              <li><strong>Données professionnelles:</strong> CV, expérience, compétences</li>
              <li><strong>Données de connexion:</strong> adresse IP, cookies, logs de connexion</li>
              <li><strong>Données d'utilisation:</strong> pages visitées, actions effectuées</li>
            </ul>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              3. Utilisation des Données
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données sont utilisées pour:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Fournir nos services de recrutement</li>
              <li>Mettre en relation candidats et entreprises</li>
              <li>Améliorer notre plateforme</li>
              <li>Communiquer avec vous sur nos services</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              4. Protection des Données
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Chiffrement des données sensibles (HTTPS, SSL/TLS)</li>
              <li>Accès limité aux données (authentification requise)</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Surveillance de la sécurité 24/7</li>
              <li>Conformité RGPD</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              5. Vos Droits (RGPD)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Droit d'accès:</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification:</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement:</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité:</strong> recevoir vos données dans un format exploitable</li>
              <li><strong>Droit d'opposition:</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de limitation:</strong> limiter le traitement de vos données</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Pour exercer vos droits, contactez-nous à:{' '}
              <a href="mailto:privacy@hi-ring.com" className="text-[#ffaf50ff] hover:text-[#ff9500ff] font-medium">
                privacy@hi-ring.com
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              6. Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous utilisons des cookies pour améliorer votre expérience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Cookies essentiels:</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies d'analyse:</strong> pour comprendre l'utilisation du site (Vercel Analytics)</li>
              <li><strong>Cookies de session:</strong> pour maintenir votre connexion</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              7. Conservation des Données
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées, conformément à la législation en vigueur:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li><strong>Candidatures actives:</strong> tant que vous êtes actif sur la plateforme</li>
              <li><strong>Candidatures archivées:</strong> 2 ans après la dernière activité</li>
              <li><strong>Données de connexion:</strong> 12 mois maximum</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              8. Partage des Données
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous ne vendons jamais vos données. Nous pouvons les partager uniquement avec:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Les entreprises clientes (avec votre consentement explicite)</li>
              <li>Nos prestataires de services (hébergement, email)</li>
              <li>Les autorités légales (si requis par la loi)</li>
            </ul>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              9. Modifications
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité. Les modifications seront publiées sur cette page avec une date de mise à jour actualisée. Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
              10. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@hi-ring.com" className="text-[#ffaf50ff] hover:text-[#ff9500ff]">
                  privacy@hi-ring.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Téléphone:</strong> +33 1 23 45 67 89
              </p>
              <p className="text-gray-700">
                <strong>Adresse:</strong> 123 Avenue des Recruteurs, 75001 Paris, France
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center gap-6">
          <Link href="/" className="text-[#3b5335ff] hover:text-[#ffaf50ff] font-medium">
            Retour à l'accueil
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/contact" className="text-[#3b5335ff] hover:text-[#ffaf50ff] font-medium">
            Nous contacter
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/auth/login" className="text-[#3b5335ff] hover:text-[#ffaf50ff] font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
