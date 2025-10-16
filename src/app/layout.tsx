import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { appConfig } from '@/config/app.config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <a href="/" className="text-2xl font-bold text-primary-600">
                    {appConfig.name}
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/" className="text-gray-700 hover:text-primary-600">
                    ホーム
                  </a>
                  <a href="/map" className="text-gray-700 hover:text-primary-600">
                    地図
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
