import "./globals.css";

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export const metadata = {
  title: 'Autofolio',
  description: 'Autofolio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      <body style={{ overflowX: 'hidden', maxWidth: '100vw', margin: 0, padding: 0 }}>
        <div id="__next" style={{ overflowX: 'hidden', width: '100%' }}>
          {children}
        </div>
      </body>
    </html>
  );
}