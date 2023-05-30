import './globals.css';
import { PageContainer } from 'components/page-container';

import StyledComponentsRegistry from './lib/registry';

export const metadata = {
  title: 'kram.land',
  description: 'making internet with the nice people who live there',
  openGraph: {
    title: 'kram.land',
    description: 'making internet with the nice people who live there',
    url: 'https://kram.land',
    siteName: 'kram.land',
    images: [{ url: 'https://kram.land/ikea.png', width: 800, height: 800 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kram.land',
    description: 'making internet with the nice people who live there',
    images: ['https://kram.land/ikea.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  icons: { icon: '/favicon.png' },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <PageContainer>{children}</PageContainer>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
