"use client";

import Link from "next/link";
import type { Property } from "@/lib/types";
import { useAutosave } from "@/lib/useAutosave";
import { updateProperty, setPropertyStatus } from "./actions";

export default function PropertyHeader({ property }: { property: Property }) {
  const action = updateProperty.bind(null, property.id, undefined);
  const { formRef, status, error, handleChange, handleBlur } = useAutosave(action);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-xl font-semibold">{property.nickname}</h1>
        <div className="flex items-center gap-3">
          <Link href={`/properties/${property.id}/expenses`} className="text-xs text-gray-400 hover:text-brand-600">
            Expenses
          </Link>
          {property.status === "active" ? (
            <button
              onClick={() => setPropertyStatus(property.id, "archived")}
              className="text-xs text-gray-400 hover:text-red-600"
            >
              Archive property
            </button>
          ) : (
            <button
              onClick={() => setPropertyStatus(property.id, "active")}
              className="text-xs text-gray-400 hover:text-brand-600"
            >
              Restore from archive
            </button>
          )}
        </div>
      </div>

      <form ref={formRef} onChange={handleChange} onBlur={handleBlur} className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="nickname">
            Nickname / label
          </label>
          <input className="input" id="nickname" name="nickname" defaultValue={property.nickname} required />
        </div>
        <div>
          <label className="label" htmlFor="address">
            Address
          </label>
          <input className="input" id="address" name="address" defaultValue={property.address} required />
        </div>
        <div>
          <label className="label" htmlFor="property_type">
            Property type
          </label>
          <input className="input" id="property_type" name="property_type" defaultValue={property.property_type || ""} />
        </div>
        <div>
          <label className="label" htmlFor="date_acquired">
            Date acquired
          </label>
          <input
            className="input"
            id="date_acquired"
            name="date_acquired"
            type="date"
            defaultValue={property.date_acquired || ""}
          />
        </div>
        <div className="sm:col-span-2 h-4">
          {status === "saving" && <span className="text-sm text-gray-400">Saving…</span>}
          {status === "saved" && <span className="text-sm text-green-700">Saved</span>}
          {status === "error" && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
