import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // AniList already serves sized, compressed images, so we skip Next's image optimizer.
    // This also keeps the app inside Vercel's free image-optimization quota.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
