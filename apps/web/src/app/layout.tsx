import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif-display',
  subsets: ['latin'],
  weight: ['400'],
})

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://pipsapp.com'),
  title: {
    template: '%s | PIPS — Process Improvement & Problem Solving',
    default: 'PIPS — Process Improvement & Problem Solving',
  },
  description:
    'PIPS guides teams through 6 proven steps to identify problems, analyze root causes, and implement lasting process improvements.',
  keywords: [
    'process improvement',
    'problem solving',
    'continuous improvement',
    'project management',
    'root cause analysis',
    'fishbone diagram',
    'PDCA',
    'lean',
    'six sigma',
    'PIPS methodology',
    'team collaboration',
    'SaaS',
  ],
  openGraph: {
    title: 'PIPS — Process Improvement & Problem Solving',
    description:
      'PIPS guides teams through 6 proven steps to identify problems, analyze root causes, and implement lasting process improvements.',
    siteName: 'PIPS',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIPS — Process Improvement & Problem Solving',
    description:
      'PIPS guides teams through 6 proven steps to identify problems, analyze root causes, and implement lasting process improvements.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pips-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

export default RootLayout
