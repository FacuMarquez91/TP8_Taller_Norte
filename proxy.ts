import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { assignVariant, validVisitorId } from "./lib/experiment";
import { recordImpression } from "./lib/events";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const THIRTY_MINUTES = 60 * 30;
const BOT_PATTERN = /googlebot|bingbot|duckduckbot|baiduspider|yandexbot|slurp|applebot/i;

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const preview = url.searchParams.get("preview");
  const hasPreview = preview === "a" || preview === "b";

  // Control estable para crawlers; misma URL y oferta, nunca contenido engañoso.
  const crawler = BOT_PATTERN.test(request.headers.get("user-agent") ?? "");
  if (hasPreview || crawler) {
    const forward = new Headers(request.headers);
    forward.set("x-experiment-variant", hasPreview ? preview : "a");
    forward.set("x-experiment-preview", hasPreview ? "1" : "0");
    return NextResponse.next({ request: { headers: forward } });
  }

  const cookieId = request.cookies.get("tn_visitor")?.value;
  const visitorId = validVisitorId(cookieId) ? cookieId : randomUUID();
  const variant = assignVariant(visitorId);
  const originalVariant = request.cookies.get("tn_variant")?.value;

  const forward = new Headers(request.headers);
  forward.set("x-experiment-variant", variant);
  forward.set("x-experiment-preview", "0");
  // Se propagan las cookies nuevas también al primer request (SSR y server action).
  const cookieHeader = request.headers.get("cookie") ?? "";
  forward.set("cookie", `${cookieHeader}${cookieHeader ? "; " : ""}tn_visitor=${visitorId}; tn_variant=${variant}`);

  const response = NextResponse.next({ request: { headers: forward } });
  const embedded = request.headers.get("sec-fetch-dest") === "iframe" ||
    request.headers.get("sec-fetch-site") === "cross-site";
  const secure = embedded || request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";
  const sameSite = embedded ? "none" : "lax";
  const settings = { httpOnly: true, path: "/", maxAge: THIRTY_DAYS, secure, sameSite } as const;
  if (cookieId !== visitorId) response.cookies.set("tn_visitor", visitorId, settings);
  if (originalVariant !== variant) response.cookies.set("tn_variant", variant, settings);

  const session = request.cookies.get("tn_session")?.value;
  if (!validVisitorId(session)) {
    const newSession = randomUUID();
    recordImpression(visitorId, variant, newSession);
    response.cookies.set("tn_session", newSession, {
      httpOnly: true, path: "/", maxAge: THIRTY_MINUTES, secure, sameSite,
    });
  }
  return response;
}

export const config = { matcher: ["/practica"] };
