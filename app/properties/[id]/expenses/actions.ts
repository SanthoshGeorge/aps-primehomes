"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ExpenseCategory } from "@/lib/types";

type ActionState = { error?: string; success?: boolean } | undefined;

const CATEGORIES: ExpenseCategory[] = ["maintenance", "repair", "turnover", "other"];

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) || "").trim();
  return v || null;
}

export async function addExpense(propertyId: string, _prev: ActionState, formData: FormData) {
  const expense_date = str(formData, "expense_date");
  const category = str(formData, "category") as ExpenseCategory | null;
  const amount = num(formData, "amount");

  if (!expense_date) return { error: "Date is required." };
  if (!category || !CATEGORIES.includes(category)) return { error: "Category is required." };
  if (amount === null) return { error: "Amount is required." };

  const supabase = createClient();
  const { error } = await supabase.from("expenses").insert({
    property_id: propertyId,
    expense_date,
    category,
    amount,
    vendor: str(formData, "vendor"),
    description: str(formData, "description"),
  });

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}/expenses`);
  return { success: true };
}

export async function deleteExpense(propertyId: string, expenseId: string) {
  const supabase = createClient();
  await supabase.from("expenses").delete().eq("id", expenseId);
  revalidatePath(`/properties/${propertyId}/expenses`);
}
