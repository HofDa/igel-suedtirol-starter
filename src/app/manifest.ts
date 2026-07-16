import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Igel Südtirol',
    short_name: 'Igel Südtirol',
    description: 'Citizen Science für Igelbeobachtungen in Südtirol',
    start_url: '/de',
    display: 'standalone',
    background_color: '#f7f4ec',
    theme_color: '#234936',
    icons: [
      {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png'},
      {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png'},
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
