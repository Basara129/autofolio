import { NextResponse } from "next/server";

// Kunci rahasia acak untuk memverifikasi keaslian cookie (Wajib sama dengan di page.jsx)
const COOKIE_SECRET = "AUTOFOLIO_SUPER_SECRET_KEY_2026";

function generateSignature(text) {
  let hash = 0;
  const combined = text + COOKIE_SECRET;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;

  // ==========================================
  // 1. KEAMANAN GLOBAL: CEK STATUS BAN (ANTI-SPAM)
  // ==========================================
  const isBanned = request.cookies.has("user_banned");
  if (isBanned) {
    const banSelesaiTimestamp = parseInt(
      request.cookies.get("user_banned")?.value || "0",
      10,
    );
    const sisaWaktuDetik = Math.ceil((banSelesaiTimestamp - Date.now()) / 1000);

    if (sisaWaktuDetik > 0) {
      if (pathname.startsWith("/pengaturan")) {
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  // ==========================================
  // 2. KEAMANAN RUTE: /pengaturan (Dengan Proteksi Anti-Manipulasi)
  // ==========================================
  if (pathname.startsWith("/pengaturan")) {
    const hasAccessCookie = request.cookies.has("akses_pengaturan");
    const accessCookieValue = request.cookies.get("akses_pengaturan")?.value;
    const cookieSignature = request.cookies.get("akses_sign")?.value;
    const urlParamKode = searchParams.get("kode");

    // Validasi dasar keberadaan cookie dan kesesuaian URL
    if (!hasAccessCookie || accessCookieValue !== urlParamKode) {
      const fallbackUrl = new URL("/", request.url);
      return NextResponse.redirect(fallbackUrl);
    }

    // Validasi Integritas: Cek modifikasi manual cookie
    const expectedSignature = generateSignature(accessCookieValue);
    if (cookieSignature !== expectedSignature) {
      const fallbackUrl = new URL("/", request.url);
      fallbackUrl.searchParams.set("error", "cookie_tampered");

      const response = NextResponse.redirect(fallbackUrl);
      response.cookies.delete("akses_pengaturan");
      response.cookies.delete("akses_sign");
      return response;
    }
  }

  // ==========================================
  // 3. STANDAR KEAMANAN GLOBAL: HTTP Security Headers
  // ==========================================
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:; " +
      "connect-src 'self';",
  );

  return response;
}

// MATCHER DISESUAIKAN: Hanya memfilter rute pengaturan
export const config = {
  matcher: ["/pengaturan", "/pengaturan/:path*"],
};
