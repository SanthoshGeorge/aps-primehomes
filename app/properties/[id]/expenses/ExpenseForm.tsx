"use client";

import { useFormState, useFormStatus } from "react-dom";
import MoneyInput from "@/components/MoneyInput";
import { EXPENSE_CATEGORY_LABEL } from "@/lib/format";
import type { ExpenseCategory } from "@/lib/types";
import { addExpense } from "./actions";

const CATEGORIES: ExpenseCategory[] = ["maintenance", "repair", "turnover", "other"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Adding…" : "Add expense"}
    </button>
  );
}

export default function ExpenseForm({ propertyId }: { propertyId: string }) {
  const action = addExpense.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="grid sm:grid-cols-2 gap-3 border-t border-gray-100 pt-4">
      <div>
        <label className="label" htmlFor="expense_date">Date</label>
        <input className="input" id="expense_date" name="expense_date" type="date" defaultValue={today} required />
      </div>
      <div>
        <label className="label" htmlFor="category">Category</label>
        <select className="input" id="category" name="category" defaultValue="maintenance" required>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {EXPENSE_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="amount">Amount</label>
        <MoneyInput id="amount" name="amount" required />
      </div>
      <div>
        <label className="label" htmlFor="vendor">Vendor / paid to</label>
        <input className="input" id="vendor" name="vendor" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="description">Description</label>
        <textarea className="input" id="description" name="description" rows={2} />
      </div>
      {state?.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
