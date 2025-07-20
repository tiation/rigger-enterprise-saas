import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import WorkerSidebar from './components/WorkerSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RiggerHub Worker Intranet',
  description: 'Private construction worker management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <WorkerSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}