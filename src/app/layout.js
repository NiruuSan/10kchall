import './globals.css'

export const metadata = {
  title: '10K Challenge',
  description: 'Track the race to 10,000 TikTok followers',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
