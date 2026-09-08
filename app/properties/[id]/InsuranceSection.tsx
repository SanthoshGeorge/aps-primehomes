"use client";

import type { InsurancePolicy } from "@/lib/types";
import MoneyInput from "@/components/MoneyInput";
import { useAutosave } from "@/lib/useAutosave";
import CollapsibleSection from "@/components/CollapsibleSection";
import { saveInsurance } from "./actions";

export default function InsuranceSection({ propertyId, data }: { propertyId: string; data: InsurancePolicy | null }) {
  const action = saveInsurance.bind(null, propertyId, undefined);
  const { formRef, status, error, handleChange, handleBlur } = useAutosave(action);

  return (
    <CollapsibleSection title="Insurance">
      <form ref={formRef} onChange={handleChange} onBlur={handleBlur} className="grid sm:grid-cols-2 gap-3">
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
          <MoneyInput id="annual_premium" name="annual_premium" defaultValue={data?.annual_premium} />
        </div>
        <div>
          <label className="label" htmlFor="renewal_date">
            Renewal date <span className="font-normal text-gray-400">(emails all owners 30 days before)</span>
          </label>
          <input className="input" id="renewal_date" name="renewal_date" type="date" defaultValue={data?.renewal_date ?? ""} />
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
