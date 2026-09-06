"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { InsurancePolicy } from "@/lib/types";
import { saveInsurance } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function InsuranceSection({ propertyId, data }: { propertyId: string; data: InsurancePolicy | null }) {
  const action = saveInsurance.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="card">
      <h2 className="section-title">Insurance</h2>
      <form action={formAction} className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="carrier">Carrier</label>
          <input className="input" id="carrier" name="carrier" defaultValue={data?.carrier ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="policy_number">Policy number</label>
          <input className="input" id="policy_number" name="policy_number" defaultValue={data?.policy_number ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="coverage_summary">Coverage summary</label>
          <input className="input" id="coverage_summary" name="coverage_summary" defaultValue={data?.coverage_summary ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="annual_premium">Annual premium</label>
          <input className="input" id="annual_premium" name="annual_premium" type="number" step="0.01" defaultValue={data?.annual_premium ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="renewal_date">Renewal date</label>
          <input className="input" id="renewal_date" name="renewal_date" type="date" defaultValue={data?.renewal_date ?? ""} />
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
