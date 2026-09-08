"use client";

import type { Expense } from "@/lib/types";
import ExpenseRow from "./ExpenseRow";

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
          <ExpenseRow key={e.id} propertyId={propertyId} expense={e} />
        ))}
      </tbody>
    </table>
  );
}
