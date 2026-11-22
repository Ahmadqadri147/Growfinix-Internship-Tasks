import type { MetadataRoute } from 'next';
import { APP_DESCRIPTION, APP_SHORT_NAME } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Growfinix Studio',
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f3efe5',
    theme_color: '#f3efe5',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
