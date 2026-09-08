"use client";

import type { HoaInfo } from "@/lib/types";
import MoneyInput from "@/components/MoneyInput";
import { useAutosave } from "@/lib/useAutosave";
import CollapsibleSection from "@/components/CollapsibleSection";
import { saveHoa } from "./actions";

export default function HoaSection({ propertyId, data }: { propertyId: string; data: HoaInfo | null }) {
  const action = saveHoa.bind(null, propertyId, undefined);
  const { formRef, status, error, handleChange, handleBlur } = useAutosave(action);

  return (
    <CollapsibleSection title="HOA">
      <form ref={formRef} onChange={handleChange} onBlur={handleBlur} className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="hoa_name">HOA name</label>
          <input className="input" id="hoa_name" name="hoa_name" defaultValue={data?.hoa_name ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="due_amount">Due amount</label>
          <MoneyInput id="due_amount" name="due_amount" defaultValue={data?.due_amount} />
        </div>
        <div>
          <label className="label" htmlFor="due_frequency">Due frequency</label>
          <select className="input" id="due_frequency" name="due_frequency" defaultValue={data?.due_frequency ?? ""}>
            <option value="">—</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="contact">HOA contact</label>
          <input className="input" id="contact" name="contact" defaultValue={data?.contact ?? ""} />
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
