"use client";

import type { KeysAccess, Owner } from "@/lib/types";
import { useAutosave } from "@/lib/useAutosave";
import CollapsibleSection from "@/components/CollapsibleSection";
import { saveKeysAccess } from "./actions";

export default function KeysSection({
  propertyId,
  data,
  owners,
}: {
  propertyId: string;
  data: KeysAccess | null;
  owners: Owner[];
}) {
  const action = saveKeysAccess.bind(null, propertyId, undefined);
  const { formRef, status, error, handleChange, handleBlur } = useAutosave(action);

  return (
    <CollapsibleSection title="Keys & access">
      <form ref={formRef} onChange={handleChange} onBlur={handleBlur} className="grid sm:grid-cols-2 gap-3">
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
        <div className="sm:col-span-2 h-4">
          {status === "saving" && <span className="text-sm text-gray-400">Saving…</span>}
          {status === "saved" && <span className="text-sm text-green-700">Saved</span>}
          {status === "error" && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </CollapsibleSection>
  );
}
