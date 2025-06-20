/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración para el manejo de archivos CSS
  cssModules: true,
  
  // Variables de entorno
  env: {
    CUSTOM_KEY: 'explorador-precios',
  },
  
  // Configuración de imágenes (si es necesario en el futuro)
  images: {
    domains: ['http2.mlstatic.com', 'mla-s1-p.mlstatic.com', 'mla-s2-p.mlstatic.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Configuración del servidor de desarrollo
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // Optimización de bundle
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig; 