import type { Metadata } from "next";
import { headers } from "next/headers";
import { CONTENT, type Variant } from "../../lib/experiment";
import { Landing } from "../../components/landing";

type PageProps = { searchParams: Promise<{ preview?: string; registrado?: string }> };
export const dynamic = "force-dynamic";

function getOrigin(): string {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try { return new URL(candidate).origin; } catch { return "http://localhost:3000"; }
}

async function getCurrent(searchParams: PageProps["searchParams"]) {
  const params = await searchParams;
  const preview = params.preview === "a" || params.preview === "b";
  const requestHeaders = await headers();
  const fromServer = requestHeaders.get("x-experiment-variant");
  const variant: Variant = preview ? (params.preview as Variant) : (fromServer === "b" ? "b" : "a");
  return { preview, variant, confirmed: params.registrado === "1" };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { preview, variant } = await getCurrent(searchParams);
  const copy = CONTENT[variant];
  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: { canonical: `${getOrigin()}/practica` },
    robots: preview ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function Practice({ searchParams }: PageProps) {
  const state = await getCurrent(searchParams);
  return <Landing {...state} />;
}
