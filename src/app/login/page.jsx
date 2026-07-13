'use client'

import { createClient } from '@/app/api/utils/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Ini harus mengarah ke Route Handler callback yang kita buat di Langkah C
        redirectTo: `${window.location.origin}api/auth/callback`,
      },
    })

    if (error) {
      console.error('Error login:', error.message)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <button 
        onClick={handleGoogleLogin}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Sign in with Google
      </button>
    </div>
  )
}