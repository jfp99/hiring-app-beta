// src/app/auth/signin/page.tsx
import { redirect } from 'next/navigation'

export default function SignInRedirect() {
  // Redirect to the custom login page
  redirect('/auth/login')
}
