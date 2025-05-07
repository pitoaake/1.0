/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['transparencyreport.google.com', 'check.spamhaus.org'],
  },
}

module.exports = nextConfig 