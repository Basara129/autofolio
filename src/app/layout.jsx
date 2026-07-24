import "./globals.css";
import Script from 'next/script';

export const metadata = {
  title: 'Autofolio',
  description: 'autofolio adalah platform pembuatan template portofolio modern, cepat, dan responsif.',
  keywords: ['portofolio', 'nextjs', 'developer', 'web design'],
  openGraph: {
    title: 'Autofolio',
    description: 'Layanan Pembuatan Website Portofolio.',
    url: 'https://autofolio.my.id/',
    siteName: 'autofolio',
    images: [
      {
        url: 'https://autofolio.my.id/about.png',
        width: 1200,
        height: 630,
        alt: 'Autofolio - autofolio', // Opsional: Bagus untuk aksesibilitas dan SEO
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      <head>
        {/* Muat script Production Midtrans secara global */}
        <Script
          // src="https://app.midtrans.com/snap/snap.js" production
          src="https://app.midtrans.com/snap/snap.js" // sandbox
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </head>
      <body style={{ overflowX: 'hidden', maxWidth: '100vw', margin: 0, padding: 0 }}>
        <div id="__next" style={{ overflowX: 'hidden', width: '100%' }}>
          {children}
        </div>
      </body>
    </html>
  );
}