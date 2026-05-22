// Next.js 설정 — 외부 이미지 도메인 허용
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 Public URL
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        // Supabase Storage (필요 시)
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
