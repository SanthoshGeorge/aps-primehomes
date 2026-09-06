import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { leaseStatus, STATUS_LABEL, STATUS_BADGE_CLASS, formatDate } from "@/lib/format";
import type { Lease, Property } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { archived?: string };
}) {
  const supabase = createClient();
  const showArchived = searchParams.archived === "1";

  const { data: properties } = await supabase
    .from("properties")
    .select("*, leases(*)")
    .eq("status", showArchived ? "archived" : "active")
    .eq("leases.is_current", true)
    .order("nickname");

  const rows = (properties || []) as (Property & { leases: Lease[] })[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          {showArchived ? "Archived properties" : "Properties"}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href={showArchived ? "/" : "/?archived=1"}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            {showArchived ? "Back to active" : "View archived"}
          </Link>
          {!showArchived && (
            <Link href="/properties/new" className="btn-primary">
              Add property
            </Link>
          )}
        </div>
      </div>

      {rows.length === 0 && (
        <div className="card text-sm text-gray-500">
          {showArchived
            ? "No archived properties."
            : "No properties yet. Add the first one to get started."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((property) => {
          const currentLease = property.leases?.[0] ?? null;
          const status = leaseStatus(currentLease);
          return (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="font-semibold">{property.nickname}</h2>
                  <p className="text-sm text-gray-500">{property.address}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE_CLASS[status]}`}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
              {currentLease ? (
                <p className="text-sm text-gray-600">
                  {currentLease.tenant_name} — lease ends {formatDate(currentLease.end_date)}
                </p>
              ) : (
                <p className="text-sm text-gray-400">No current tenant on file</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
