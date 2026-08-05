import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CONSTRUPLATA PRO',
    short_name: 'CONSTRUPLATA',
    description:
      'Plataforma empresarial para gestión, control y supervisión de proyectos de construcción.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#07172d',
    theme_color: '#0a477f',
    lang: 'es-DO',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
