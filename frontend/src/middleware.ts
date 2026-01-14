import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";
import createMiddleware from "next-intl/middleware";

const handleI18n = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // 所有语言都要求前缀
});
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to notebooks
  if (pathname === "/") {
    // return NextResponse.redirect(new URL("/notebooks", request.url));
    return NextResponse.redirect(
      new URL(`/${defaultLocale}/notebooks`, request.url)
    );
  }
  // 其余交给 next-intl 处理（包含语言缺失时的重定向）
  return handleI18n(request);
  // return NextResponse.next();
}

export const config = {
  // 把静态文件排除出 matcher，不走重定向语言逻辑
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
  // matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
