"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assignVariant, validVisitorId } from "../../lib/experiment";
import { recordConversion } from "../../lib/events";

export async function registerConversion(formData: FormData) {
  // El preview nunca genera eventos, incluso si se hace clic en su CTA.
  if (formData.get("preview") === "1") redirect("/practica?preview=" +
    (formData.get("variant") === "b" ? "b" : "a"));

  const jar = await cookies();
  const visitorId = jar.get("tn_visitor")?.value;
  if (validVisitorId(visitorId)) {
    const variant = assignVariant(visitorId);
    recordConversion(visitorId, variant);
    revalidatePath("/bitacora");
  }
  redirect("/practica?registrado=1");
}
