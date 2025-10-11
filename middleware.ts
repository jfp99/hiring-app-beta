// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserRole } from './src/app/types/auth'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Define role-based access control
    const roleAccess: Record<string, UserRole[]> = {
      '/admin': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      '/recruiter': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECRUITER],
      '/client': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT],
      '/hiring-manager': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HIRING_MANAGER],
      '/candidate': [UserRole.CANDIDATE],
      '/dashboard': Object.values(UserRole), // All authenticated users
      '/api/users': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      '/api/admin': [UserRole.SUPER_ADMIN, UserRole.ADMIN]
    }

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(roleAccess)) {
      if (path.startsWith(route)) {
        const userRole = token?.role as UserRole

        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard based on role
          const redirectUrl = new URL('/dashboard', req.url)
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes
        const publicRoutes = [
          '/',
          '/offres-emploi',
          '/vision',
          '/contact',
          '/auth/login',
          '/auth/register',
          '/auth/forgot-password',
          '/api/jobs', // Public job listings
          '/api/newsletters' // Newsletter subscription
        ]

        // Check if route is public
        const isPublicRoute = publicRoutes.some(route =>
          path === route || path.startsWith(`${route}/`)
        )

        if (isPublicRoute) {
          return true
        }

        // All other routes require authentication
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that should be public
     */
    '/((?!_next/static|_next/image|favicon.ico|logo-hiring.png|api/auth).*)',
  ]
}