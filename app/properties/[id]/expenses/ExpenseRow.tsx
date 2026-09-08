"use client";

import { useState } from "react";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { formatDate, formatCurrency, EXPENSE_CATEGORY_LABEL, EXPENSE_CATEGORY_BADGE_CLASS } from "@/lib/format";
import { updateExpense, deleteExpense } from "./actions";

const CATEGORIES: ExpenseCategory[] = ["maintenance", "repair", "turnover", "other"];

export default function ExpenseRow({ propertyId, expense }: { propertyId: string; expense: Expense }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(expense.expense_date);
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [amount, setAmount] = useState(String(expense.amount));
  const [vendor, setVendor] = useState(expense.vendor ?? "");
  const [description, setDescription] = useState(expense.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDate(expense.expense_date);
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setVendor(expense.vendor ?? "");
    setDescription(expense.description ?? "");
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateExpense(propertyId, expense.id, {
      expense_date: date,
      category,
      amount: Number(amount),
      vendor: vendor.trim() || null,
      description: description.trim() || null,
    });
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <tr className="border-t border-gray-100 align-top bg-gray-50">
        <td className="py-1 pr-2">
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </td>
        <td className="py-1 pr-2">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </td>
        <td className="py-1 pr-2">
          <input className="input" value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </td>
        <td className="py-1 pr-2">
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </td>
        <td className="py-1 pr-2">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
              $
            </span>
            <input
              className="input text-right"
              style={{ paddingLeft: "1.25rem" }}
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </td>
        <td className="py-1 text-right align-middle whitespace-nowrap">
          <div className="flex gap-3 justify-end">
            <button className="text-xs text-brand-600 hover:underline" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="text-xs text-gray-400 hover:text-gray-600" onClick={cancel} disabled={saving}>
              Cancel
            </button>
          </div>
          {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-gray-100 align-top">
      <td className="py-1 whitespace-nowrap">{formatDate(expense.expense_date)}</td>
      <td className="py-1">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${EXPENSE_CATEGORY_BADGE_CLASS[expense.category]}`}>
          {EXPENSE_CATEGORY_LABEL[expense.category]}
        </span>
      </td>
      <td className="py-1">{expense.vendor || "—"}</td>
      <td className="py-1 text-gray-500">{expense.description || "—"}</td>
      <td className="py-1 text-right whitespace-nowrap">{formatCurrency(expense.amount)}</td>
      <td className="py-1 text-right whitespace-nowrap">
        <div className="flex gap-3 justify-end">
          <button className="text-xs text-gray-400 hover:text-brand-600" onClick={startEdit}>
            Edit
          </button>
          <button className="text-xs text-gray-400 hover:text-red-600" onClick={() => deleteExpense(propertyId, expense.id)}>
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}
