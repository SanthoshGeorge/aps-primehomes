"use client";

import type { Mortgage } from "@/lib/types";
import MoneyInput from "@/components/MoneyInput";
import { useAutosave } from "@/lib/useAutosave";
import CollapsibleSection from "@/components/CollapsibleSection";
import { saveMortgage } from "./actions";

export default function MortgageSection({ propertyId, data }: { propertyId: string; data: Mortgage | null }) {
  const action = saveMortgage.bind(null, propertyId, undefined);
  const { formRef, status, error, handleChange, handleBlur } = useAutosave(action);

  return (
    <CollapsibleSection title="Mortgage">
      <form ref={formRef} onChange={handleChange} onBlur={handleBlur} className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="lender">Lender</label>
          <input className="input" id="lender" name="lender" defaultValue={data?.lender ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="account_last4">Account (last 4 digits)</label>
          <input className="input" id="account_last4" name="account_last4" maxLength={4} defaultValue={data?.account_last4 ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="original_amount">Original loan amount</label>
          <MoneyInput id="original_amount" name="original_amount" defaultValue={data?.original_amount} />
        </div>
        <div>
          <label className="label" htmlFor="interest_rate">Interest rate (%)</label>
          <input className="input" id="interest_rate" name="interest_rate" type="number" step="0.001" defaultValue={data?.interest_rate ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="term_years">Term (years)</label>
          <input className="input" id="term_years" name="term_years" type="number" defaultValue={data?.term_years ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="monthly_payment">Monthly payment</label>
          <MoneyInput id="monthly_payment" name="monthly_payment" defaultValue={data?.monthly_payment} />
        </div>
        <div>
          <label className="label" htmlFor="maturity_date">Maturity / payoff date</label>
          <input className="input" id="maturity_date" name="maturity_date" type="date" defaultValue={data?.maturity_date ?? ""} />
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
