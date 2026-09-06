"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createProperty(_prevState: { error: string } | undefined, formData: FormData) {
  const nickname = String(formData.get("nickname") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const property_type = String(formData.get("property_type") || "").trim() || null;
  const date_acquired = String(formData.get("date_acquired") || "") || null;

  if (!nickname || !address) {
    return { error: "Nickname and address are required." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({ nickname, address, property_type, date_acquired })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "Could not create the property." };
  }

  redirect(`/properties/${data.id}`);
}
