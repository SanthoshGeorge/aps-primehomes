"use client";

import type { Expense } from "@/lib/types";
import { formatDate, formatCurrency, EXPENSE_CATEGORY_LABEL, EXPENSE_CATEGORY_BADGE_CLASS } from "@/lib/format";
import { deleteExpense } from "./actions";

export default function ExpenseTable({ propertyId, items }: { propertyId: string; items: Expense[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 mb-4">No expenses logged yet.</p>;
  }

  return (
    <table className="w-full text-sm mb-4">
      <thead className="text-gray-500 text-left">
        <tr>
          <th className="py-1">Date</th>
          <th className="py-1">Category</th>
          <th className="py-1">Vendor</th>
          <th className="py-1">Description</th>
          <th className="py-1 text-right">Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((e) => (
          <tr key={e.id} className="border-t border-gray-100 align-top">
            <td className="py-1 whitespace-nowrap">{formatDate(e.expense_date)}</td>
            <td className="py-1">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${EXPENSE_CATEGORY_BADGE_CLASS[e.category]}`}>
                {EXPENSE_CATEGORY_LABEL[e.category]}
              </span>
            </td>
            <td className="py-1">{e.vendor || "—"}</td>
            <td className="py-1 text-gray-500">{e.description || "—"}</td>
            <td className="py-1 text-right whitespace-nowrap">{formatCurrency(e.amount)}</td>
            <td className="py-1 text-right">
              <button
                className="text-xs text-gray-400 hover:text-red-600"
                onClick={() => deleteExpense(propertyId, e.id)}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
