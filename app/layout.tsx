import './globals.css'
import { createClient } from '@/lib/supabase'
import { SupabaseProvider } from '@/components/supabase-provider'


export const metadata = {
  title: 'Keytune',
  description: 'Secure music link sharing',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body>
        <SupabaseProvider session={session}>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
