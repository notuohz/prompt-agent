import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prompt Architect — Elite Web Design Prompts',
  description: 'Generate expert-level web design prompts based on the 7 Levels of Elite Website Building framework.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
