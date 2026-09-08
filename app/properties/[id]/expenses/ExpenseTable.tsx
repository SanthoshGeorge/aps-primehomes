"use client";

import type { Expense } from "@/lib/types";
import ExpenseRow from "./ExpenseRow";

export default function ExpenseTable({ propertyId, items }: { propertyId: string; items: Expense[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 mb-4">No expenses logged yet.</p>;
  }

  return (
    <div className="mb-4">
      {/* Desktop / tablet: a normal table. Hidden below the `sm` breakpoint —
          6 columns (date, category, vendor, description, amount, actions)
          don't fit a phone screen without cramming/truncating everything. */}
      <table className="hidden sm:table w-full text-sm">
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
            <ExpenseRow key={e.id} propertyId={propertyId} expense={e} variant="row" />
          ))}
        </tbody>
      </table>

      {/* Mobile: one stacked card per expense instead of a squeezed table. */}
      <div className="sm:hidden space-y-3">
        {items.map((e) => (
          <ExpenseRow key={e.id} propertyId={propertyId} expense={e} variant="card" />
        ))}
      </div>
    </div>
  );
}
