import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

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
      if (
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/formulir") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/pengaturan")
      ) {
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  // ==========================================
  // 2. PROTEKSI SUPABASE AUTH
  // ==========================================
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/formulir") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/pengaturan")
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userUID = user?.id;

    if (!userUID) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ==========================================
  // 3. HTTP Security Headers & RACIKAN FIX CSP MIDTRANS PRODUCTION
  // ==========================================
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  const SUPABASE_URL = "https://ovcatigbqltxmltnshlw.supabase.co";
  const SUPABASE_WSS = "wss://ovcatigbqltxmltnshlw.supabase.co";
  const CLOUDINARY_URL = "https://res.cloudinary.com";

  // 🌍 SEKARANG SUDAH FIX REKOMENDASI PRODUKSI RESMI MIDTRANS
  const MIDTRANS_SNAP = "https://app.midtrans.com";
  const MIDTRANS_ASSETS = "https://snap-assets.midtrans.com";
  const MIDTRANS_API = "https://api.midtrans.com";

  const WALLET_GOPAY = "https://gwk.gopayapi.com";
  const WALLET_GOOGLEPAY = "https://pay.google.com";

  // Jalur skrip tepercaya untuk Midtrans Snap Live
  const baseScripts = `'self' 'unsafe-inline' 'unsafe-eval' ${MIDTRANS_SNAP} ${MIDTRANS_ASSETS} ${MIDTRANS_API} ${WALLET_GOOGLEPAY} ${WALLET_GOPAY} https://www.googletagmanager.com`;

  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; ` +
      `script-src ${baseScripts}; ` +
      `script-src-elem ${baseScripts}; ` +
      `style-src 'self' 'unsafe-inline' ${MIDTRANS_ASSETS}; ` +
      `img-src 'self' data: blob: ${SUPABASE_URL} ${CLOUDINARY_URL} ${MIDTRANS_SNAP} ${MIDTRANS_ASSETS} ${MIDTRANS_API} https://googleusercontent.com https://*.googleusercontent.com; ` +
      `frame-src 'self' ${MIDTRANS_SNAP} ${MIDTRANS_API} ${WALLET_GOOGLEPAY} ${WALLET_GOPAY}; ` +
      `connect-src 'self' data: ${SUPABASE_URL} ${SUPABASE_WSS} ${CLOUDINARY_URL} ${MIDTRANS_SNAP} ${MIDTRANS_API} ${WALLET_GOPAY} ${WALLET_GOOGLEPAY};`,
  );

  return response;
}

export const config = {
  matcher: [
    "/checkout",
    "/checkout/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/formulir",
    "/formulir/:path*",
    "/profile",
    "/profile/:path*",
    "/pengaturan",
    "/pengaturan/:path*",
  ],
};
