"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { KeysAccess, Owner } from "@/lib/types";
import { saveKeysAccess } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function KeysSection({
  propertyId,
  data,
  owners,
}: {
  propertyId: string;
  data: KeysAccess | null;
  owners: Owner[];
}) {
  const action = saveKeysAccess.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="card">
      <h2 className="section-title">Keys & access</h2>
      <form action={formAction} className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="key_count"># of keys</label>
          <input className="input" id="key_count" name="key_count" type="number" defaultValue={data?.key_count ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="spare_key_holder_id">
            Spare key held by
          </label>
          <select
            className="input"
            id="spare_key_holder_id"
            name="spare_key_holder_id"
            defaultValue={data?.spare_key_holder_id ?? ""}
          >
            <option value="">—</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="garage_opener_count"># of garage openers</label>
          <input
            className="input"
            id="garage_opener_count"
            name="garage_opener_count"
            type="number"
            defaultValue={data?.garage_opener_count ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="garage_opener_holder_id">
            Garage opener held by
          </label>
          <select
            className="input"
            id="garage_opener_holder_id"
            name="garage_opener_holder_id"
            defaultValue={data?.garage_opener_holder_id ?? ""}
          >
            <option value="">—</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">
            Notes (lockbox code, alarm code, etc.)
          </label>
          <textarea className="input" id="notes" name="notes" rows={2} defaultValue={data?.notes ?? ""} />
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
