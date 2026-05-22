// 앱 전체 루트 레이아웃
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '매물관리 - 공인중개사 업무 도우미',
  description: '스마트폰으로 간편하게 매물을 등록하고 관리하세요.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
