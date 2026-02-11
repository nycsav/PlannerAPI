import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '{{SITE_NAME}} | AI Marketing Intelligence for CMOs',
    template: '%s | {{SITE_NAME}}'
  },
  description: 'Daily curated insights from McKinsey, Forrester, Gartner on AI strategy, CX transformation, and marketing operations for CMOs and agency leaders.',
  keywords: 'AI marketing intelligence, marketing insights platform, CMO intelligence briefing, McKinsey marketing research, Forrester marketing insights, Gartner CMO research, generative engine optimization, answer engine optimization marketing, CMO AI strategy, marketing operations automation, CX transformation insights, agency leadership intelligence, daily marketing briefing, curated marketing research, marketing trend analysis, source-tiered marketing content, operator-focused marketing intelligence',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '{{SITE_URL}}',
    siteName: '{{SITE_NAME}}',
    title: 'AI Marketing Intelligence for CMOs',
    description: 'Tier-1 research insights on AI strategy, CX transformation, and marketing operations',
  },
  alternates: {
    canonical: '{{SITE_URL}}'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
