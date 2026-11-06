export type Variant = "a" | "b";

// FNV-1a de 32 bits sobre bytes UTF-8: mismo ID => mismo hash => misma variante.
export function fnv1a32(value: string): number {
  const bytes = new TextEncoder().encode(value);
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function assignVariant(visitorId: string): Variant {
  return (fnv1a32(visitorId) % 2 === 0) ? "a" : "b";
}

export function validVisitorId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9-]{36}$/i.test(value) &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

export function conversionRate(impressions: number, conversions: number): number | null {
  if (!Number.isSafeInteger(impressions) || impressions <= 0 ||
      !Number.isSafeInteger(conversions) || conversions < 0) return null;
  return (conversions / impressions) * 100;
}

export function formatRate(rate: number | null): string {
  return rate === null ? "Sin tasa" : `${rate.toFixed(2).replace(".", ",")}%`;
}

export function formatDifference(a: number | null, b: number | null): string {
  return a === null || b === null ? "Sin diferencia" :
    `${(b - a).toFixed(2).replace(".", ",")} pp`;
}

export const OFFER = {
  start: "14 de abril",
  duration: "8 semanas",
  capacity: "12 personas",
  trades: ["Carpintería", "Electricidad", "Cocina"],
} as const;

export const CONTENT = {
  a: {
    name: "A · Control",
    title: "Cursos de oficio en ocho semanas, con salida laboral",
    description: "Aprendé carpintería, electricidad o cocina en ocho semanas. Grupos de doce personas y práctica real, con una salida laboral que se puede cobrar.",
    headline: "Ocho semanas para un oficio que se puede cobrar.",
    subheadline: "Aprendé haciendo, con práctica real y grupos reducidos.",
    cta: "Ver cupos de abril",
  },
  b: {
    name: "B · Tratamiento",
    title: "Abril abre cupos: cursos de oficio en grupos de 12",
    description: "El 14 de abril empiezan grupos de doce. En la cohorte anterior, ocho de cada diez consiguieron trabajo en el rubro antes de los noventa días.",
    headline: "El curso empieza el 14 de abril. El cupo, no.",
    subheadline: "Doce lugares por grupo. Elegí tu oficio antes de que se completen.",
    cta: "Reservar mi lugar",
  },
} as const;

export const FIXED_CASE = {
  a: { impressions: 240, conversions: 18 },
  b: { impressions: 236, conversions: 31 },
} as const;
