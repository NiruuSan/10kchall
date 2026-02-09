import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: '10K Challenge',
  description: 'Track the race to 10,000 TikTok followers',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
