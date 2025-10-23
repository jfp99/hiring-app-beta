// app/confidentialite/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

export default function Confidentialite() {
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
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-200">
              Vos données personnelles sont protégées et traitées conformément au RGPD
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
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">1. Introduction</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Hi-ring s&apos;engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">2. Responsable du traitement</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Hi-ring</strong><br />
                  Cabinet de conseil en recrutement<br />
                  France & International<br />
                  Email : contact@hi-ring.fr<br />
                  Téléphone : Hugo - 06 66 74 76 18 | Izia - 06 09 11 15 98
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">3. Données collectées</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Nous collectons les données suivantes :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Données d&apos;identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                  <li><strong>Données professionnelles :</strong> CV, lettre de motivation, parcours professionnel, compétences</li>
                  <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, pages visitées</li>
                  <li><strong>Cookies :</strong> pour améliorer votre expérience utilisateur (voir notre politique cookies)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">4. Finalités du traitement</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Vos données sont utilisées pour :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Traiter vos candidatures et vous mettre en relation avec nos clients</li>
                  <li>Vous contacter concernant des opportunités d&apos;emploi</li>
                  <li>Améliorer nos services et personnaliser votre expérience</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                  <li>Répondre à vos demandes d&apos;information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">5. Base légale du traitement</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Le traitement de vos données repose sur :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Votre consentement :</strong> pour l&apos;envoi de communications marketing</li>
                  <li><strong>L&apos;exécution d&apos;un contrat :</strong> pour le traitement des candidatures</li>
                  <li><strong>Notre intérêt légitime :</strong> pour améliorer nos services</li>
                  <li><strong>Obligations légales :</strong> pour respecter la législation en vigueur</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">6. Durée de conservation</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Nous conservons vos données personnelles pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-4">
                  <li><strong>Candidatures :</strong> 2 ans à compter du dernier contact</li>
                  <li><strong>Clients :</strong> durée de la relation commerciale + 5 ans</li>
                  <li><strong>Données de connexion :</strong> 12 mois maximum</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">7. Destinataires des données</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Vos données peuvent être partagées avec :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Nos clients entreprises (uniquement pour les candidatures)</li>
                  <li>Nos prestataires techniques (hébergement, emailing)</li>
                  <li>Les autorités compétentes (sur demande légale)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">8. Vos droits</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Droit d&apos;accès :</strong> consulter vos données personnelles</li>
                  <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                  <li><strong>Droit à l&apos;effacement :</strong> supprimer vos données (droit à l&apos;oubli)</li>
                  <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                  <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
                  <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@hi-ring.fr" className="text-[#ffaf50ff] hover:underline">contact@hi-ring.fr</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">9. Sécurité des données</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l&apos;utilisation abusive, l&apos;accès non autorisé, la divulgation, l&apos;altération ou la destruction, notamment :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-4">
                  <li>Chiffrement SSL/TLS pour les transmissions</li>
                  <li>Contrôle d&apos;accès strict aux données</li>
                  <li>Sauvegardes régulières et sécurisées</li>
                  <li>Formation de notre personnel à la protection des données</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">10. Transferts internationaux</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Vos données sont hébergées en Europe. Si un transfert hors UE est nécessaire, nous garantissons un niveau de protection adéquat via des clauses contractuelles types approuvées par la Commission européenne.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">11. Modifications</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Cette politique de confidentialité peut être mise à jour. Nous vous informerons de toute modification substantielle par email ou via une notification sur notre site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">12. Réclamation</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) :
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>CNIL</strong><br />
                  3 Place de Fontenoy<br />
                  TSA 80715<br />
                  75334 PARIS CEDEX 07<br />
                  Téléphone : 01 53 73 22 22<br />
                  Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#ffaf50ff] hover:underline">www.cnil.fr</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">13. Contact</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité ou l&apos;exercice de vos droits :
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
