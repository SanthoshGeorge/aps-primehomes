import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, EXPENSE_CATEGORY_LABEL } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/lib/types";
import ExpenseForm from "./ExpenseForm";
import ExpenseTable from "./ExpenseTable";

const CATEGORIES: ExpenseCategory[] = ["maintenance", "repair", "turnover", "other"];

export default async function ExpensesPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: property }, { data: expenses }] = await Promise.all([
    supabase.from("properties").select("nickname, address").eq("id", params.id).single(),
    supabase
      .from("expenses")
      .select("*")
      .eq("property_id", params.id)
      .order("expense_date", { ascending: false }),
  ]);

  if (!property) return notFound();

  const items = (expenses || []) as Expense[];
  const currentYear = new Date().getFullYear();
  const thisYear = items.filter((e) => new Date(e.expense_date + "T00:00:00").getFullYear() === currentYear);

  const totalAllTime = items.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalThisYear = thisYear.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategoryThisYear = CATEGORIES.map((c) => ({
    category: c,
    total: thisYear.filter((e) => e.category === c).reduce((sum, e) => sum + Number(e.amount), 0),
  })).filter((c) => c.total > 0);

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <Link href={`/properties/${params.id}`} className="text-sm text-gray-500 hover:text-brand-600">
          ← Back to {property.nickname}
        </Link>
      </div>

      <div className="card">
        <h1 className="text-xl font-semibold mb-1">Expenses</h1>
        <p className="text-sm text-gray-500 mb-4">
          {property.nickname} — {property.address}
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500">This year ({currentYear})</div>
            <div className="text-lg font-semibold">{formatCurrency(totalThisYear)}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500">All time</div>
            <div className="text-lg font-semibold">{formatCurrency(totalAllTime)}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500 mb-1">By category ({currentYear})</div>
            {byCategoryThisYear.length === 0 ? (
              <div className="text-sm text-gray-400">—</div>
            ) : (
              <ul className="text-sm space-y-0.5">
                {byCategoryThisYear.map((c) => (
                  <li key={c.category} className="flex justify-between gap-2">
                    <span className="text-gray-600">{EXPENSE_CATEGORY_LABEL[c.category]}</span>
                    <span>{formatCurrency(c.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <ExpenseTable propertyId={params.id} items={items} />
        <ExpenseForm propertyId={params.id} />
      </div>
    </div>
  );
}
