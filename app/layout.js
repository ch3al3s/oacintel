import './globals.css'

export const metadata = {
  title: 'OACIntel — Know What\'s Next',
  description: 'Intelligence for those who move first. Real-time market signals before they become news.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'OACIntel — Know What\'s Next',
    description: 'Intelligence for those who move first.',
    url: 'https://oacintel.com',
    siteName: 'OACIntel',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
