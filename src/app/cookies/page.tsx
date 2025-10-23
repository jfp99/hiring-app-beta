// app/cookies/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

export default function Cookies() {
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
              Politique de Cookies
            </h1>
            <p className="text-xl text-gray-200">
              Comment nous utilisons les cookies sur Hi-ring
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
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d&apos;un site web. Il permet au site de mémoriser des informations sur votre visite, comme votre langue préférée et d&apos;autres paramètres, afin de faciliter votre prochaine visite et de rendre le site plus utile.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">2. Types de cookies utilisés</h2>

                <div className="space-y-6 mt-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3">
                      🔧 Cookies strictement nécessaires
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                      <li><strong>Cookies de session :</strong> pour maintenir votre session active</li>
                      <li><strong>Cookies de sécurité :</strong> pour prévenir les fraudes et protéger vos données</li>
                      <li><strong>Cookies d&apos;authentification :</strong> pour vous identifier lors de votre connexion</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <strong>Durée de conservation :</strong> Session ou 30 jours maximum
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3">
                      📊 Cookies de performance
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      Ces cookies nous permettent de mesurer et d&apos;améliorer les performances du site.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                      <li><strong>Cookies analytiques :</strong> pour comprendre comment vous utilisez le site</li>
                      <li><strong>Cookies de statistiques :</strong> pour mesurer l&apos;audience et les visites</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <strong>Durée de conservation :</strong> 13 mois<br />
                      <strong>Votre consentement est requis</strong>
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3">
                      🎯 Cookies de fonctionnalité
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      Ces cookies permettent d&apos;améliorer votre expérience utilisateur.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                      <li><strong>Préférences utilisateur :</strong> langue, thème (clair/sombre)</li>
                      <li><strong>Cookies de personnalisation :</strong> pour adapter le contenu à vos intérêts</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <strong>Durée de conservation :</strong> 12 mois<br />
                      <strong>Votre consentement est requis</strong>
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3">
                      🎪 Cookies publicitaires
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      <strong>Nous n&apos;utilisons pas de cookies publicitaires ou de cookies tiers à des fins marketing.</strong>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">3. Cookies utilisés par Hi-ring</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Durée</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Finalité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">next-auth.session-token</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Nécessaire</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">30 jours</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Authentification utilisateur</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">theme</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Fonctionnel</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">12 mois</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Préférence thème (clair/sombre)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">_ga</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Analytique</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">13 mois</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Google Analytics (si consenti)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">4. Gestion de vos préférences</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Vous pouvez à tout moment modifier vos préférences concernant les cookies :
                </p>

                <div className="bg-gradient-to-r from-[#3b5335ff]/10 to-[#ffaf50ff]/10 p-6 rounded-xl border-l-4 border-[#ffaf50ff]">
                  <h3 className="text-lg font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3">
                    💡 Via votre navigateur
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Vous pouvez configurer votre navigateur pour accepter, refuser ou être averti lorsqu&apos;un cookie est déposé :
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                    <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies et données de sites</li>
                    <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                    <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">5. Conséquences du refus des cookies</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Le refus des cookies peut impacter votre expérience sur le site :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-4">
                  <li><strong>Cookies nécessaires :</strong> leur refus peut empêcher l&apos;accès à certaines fonctionnalités (connexion, formulaires)</li>
                  <li><strong>Cookies de performance :</strong> leur refus n&apos;impacte pas la navigation mais nous empêche d&apos;améliorer le site</li>
                  <li><strong>Cookies de fonctionnalité :</strong> leur refus peut nécessiter de ressaisir vos préférences à chaque visite</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">6. Cookies tiers</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Certains cookies peuvent être déposés par des services tiers que nous utilisons :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-4">
                  <li><strong>Google Analytics :</strong> pour les statistiques de visite (uniquement avec votre consentement)</li>
                  <li><strong>Vercel :</strong> pour l&apos;hébergement et les performances du site</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Ces services tiers ont leurs propres politiques de confidentialité que nous vous encourageons à consulter.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">7. Durée de conservation du consentement</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Votre choix concernant les cookies est conservé pendant <strong>13 mois</strong>. À l&apos;expiration de ce délai, nous vous demanderons à nouveau votre consentement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">8. Mise à jour de la politique</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Cette politique de cookies peut être modifiée à tout moment. Nous vous informerons de toute modification substantielle et vous demanderons votre consentement si nécessaire.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">9. Plus d&apos;informations</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Pour en savoir plus sur les cookies et la protection de vos données :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs" target="_blank" rel="noopener noreferrer" className="text-[#ffaf50ff] hover:underline">CNIL - Cookies et traceurs</a></li>
                  <li><a href="https://www.youronlinechoices.com/fr/" target="_blank" rel="noopener noreferrer" className="text-[#ffaf50ff] hover:underline">Your Online Choices</a></li>
                  <li><a href="/confidentialite" className="text-[#ffaf50ff] hover:underline">Notre Politique de Confidentialité</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">10. Contact</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Pour toute question concernant notre utilisation des cookies :
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
