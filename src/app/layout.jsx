import "./globals.css";


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