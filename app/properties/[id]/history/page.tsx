import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatCurrency } from "@/lib/format";

export default async function LeaseHistoryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: property }, { data: leases }] = await Promise.all([
    supabase.from("properties").select("nickname, address").eq("id", params.id).single(),
    supabase
      .from("leases")
      .select("*")
      .eq("property_id", params.id)
      .eq("is_current", false)
      .order("start_date", { ascending: false }),
  ]);

  if (!property) return notFound();

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <Link href={`/properties/${params.id}`} className="text-sm text-gray-500 hover:text-brand-600">
          ← Back to {property.nickname}
        </Link>
      </div>

      <div className="card">
        <h1 className="text-xl font-semibold mb-1">Past tenants</h1>
        <p className="text-sm text-gray-500 mb-4">{property.nickname} — {property.address}</p>

        {!leases || leases.length === 0 ? (
          <p className="text-sm text-gray-400">No past tenants on file yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-left">
              <tr>
                <th className="py-1">Tenant</th>
                <th className="py-1">Start</th>
                <th className="py-1">End</th>
                <th className="py-1">Rent</th>
                <th className="py-1">Notes</th>
              </tr>
            </thead>
            <tbody>
              {leases.map((l) => (
                <tr key={l.id} className="border-t border-gray-100 align-top">
                  <td className="py-1">{l.tenant_name}</td>
                  <td className="py-1">{formatDate(l.start_date)}</td>
                  <td className="py-1">{formatDate(l.end_date)}</td>
                  <td className="py-1">{formatCurrency(l.rent_amount)}</td>
                  <td className="py-1 text-gray-500">{l.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
