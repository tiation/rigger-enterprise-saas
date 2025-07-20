/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rigger/database', '@rigger/auth', '@rigger/shared-ui', '@rigger/types'],
  images: {
    domains: ['localhost', 'tiation.net'],
  },
}

module.exports = nextConfig