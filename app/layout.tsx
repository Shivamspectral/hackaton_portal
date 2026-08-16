import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HyperStack — Siddhant College of Engineering Hackathon',
  description:
    'BUILD. BREAK. INNOVATE. A 36-hour internal hackathon at Siddhant College of Engineering (SCOE). Browse problem statements, register your team, and compete for the top of the leaderboard.',
  generator: 'v0.app',
  keywords: [
    'hackathon',
    'SCOE',
    'Siddhant College of Engineering',
    'coding competition',
    'problem statements',
    'student developer event',
  ],
  openGraph: {
    title: 'HyperStack — Siddhant College of Engineering Hackathon',
    description:
      'BUILD. BREAK. INNOVATE. A 36-hour internal hackathon at Siddhant College of Engineering.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b120e',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
