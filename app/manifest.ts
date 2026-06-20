import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Capital Lens',
    short_name: 'CapitalLens',
    description: 'Analyze and visualize your custom ETF portfolio.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    // The share_target property is valid in web app manifests but might be missing
    // from the Next.js TypeScript definitions, so we cast to any.
    ...({
      share_target: {
        action: '/share-target',
        method: 'POST',
        enctype: 'multipart/form-data',
        params: {
          title: 'title',
          text: 'text',
          url: 'url',
          files: [
            {
              name: 'portfolioFile',
              accept: ['.csv', '.lens'],
            },
          ],
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  };
}
