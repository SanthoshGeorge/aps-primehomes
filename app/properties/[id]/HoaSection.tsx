"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { HoaInfo } from "@/lib/types";
import MoneyInput from "@/components/MoneyInput";
import { saveHoa } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function HoaSection({ propertyId, data }: { propertyId: string; data: HoaInfo | null }) {
  const action = saveHoa.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="card">
      <h2 className="section-title">HOA</h2>
      <form action={formAction} className="grid sm:grid-cols-2 gap-3">
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
        <div className="sm:col-span-2 flex items-center gap-3">
          <SubmitButton />
          {state?.success && <span className="text-sm text-green-700">Saved.</span>}
          {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        </div>
      </form>
    </div>
  );
}
