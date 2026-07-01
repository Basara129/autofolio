// app/about/page.jsx
export const metadata = {
  title: 'Tentang Kami - Autofolio',
  description: 'Deep Slate Studio adalah platform pembuatan template portofolio modern, cepat, dan responsif.',
  keywords: ['portofolio', 'nextjs', 'developer', 'web design'],
  openGraph: {
    title: 'Tentang Kami - Autofolio',
    description: 'Layanan Pembuatan Website Portofolio .',
    url: 'https://www.autofolio.my.id/about',
    siteName: 'Deep Slate Studio',
    images: [
      {
        url: 'https://autofolio.my.id/about.png', // Gambar yang muncul saat link dishare di WA/Twitter
        width: 1200,
        height: 630,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function AboutPage() {
  return <main>...</main>;
}