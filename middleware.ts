// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Le middleware vérifie automatiquement l'authentification
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protéger toutes les routes /admin
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token
        }
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/admin/:path*']
}