"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateName(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name can't be empty." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("owners").update({ name }).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
