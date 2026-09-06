"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Property } from "@/lib/types";
import { updateProperty, setPropertyStatus } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Saving…" : "Save details"}
    </button>
  );
}

export default function PropertyHeader({ property }: { property: Property }) {
  const action = updateProperty.bind(null, property.id);
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-xl font-semibold">{property.nickname}</h1>
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

      <form action={formAction} className="grid sm:grid-cols-2 gap-4">
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
        <div className="sm:col-span-2 flex items-center gap-3">
          <SubmitButton />
          {state?.success && <span className="text-sm text-green-700">Saved.</span>}
          {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        </div>
      </form>
    </div>
  );
}
