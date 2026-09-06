"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Mortgage } from "@/lib/types";
import { saveMortgage } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function MortgageSection({ propertyId, data }: { propertyId: string; data: Mortgage | null }) {
  const action = saveMortgage.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="card">
      <h2 className="section-title">Mortgage</h2>
      <form action={formAction} className="grid sm:grid-cols-2 gap-3">
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
          <input className="input" id="original_amount" name="original_amount" type="number" step="0.01" defaultValue={data?.original_amount ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="interest_rate">Interest rate (%)</label>
          <input className="input" id="interest_rate" name="interest_rate" type="number" step="0.001" defaultValue={data?.interest_rate ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="term_months">Term (months)</label>
          <input className="input" id="term_months" name="term_months" type="number" defaultValue={data?.term_months ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="monthly_payment">Monthly payment</label>
          <input className="input" id="monthly_payment" name="monthly_payment" type="number" step="0.01" defaultValue={data?.monthly_payment ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="maturity_date">Maturity / payoff date</label>
          <input className="input" id="maturity_date" name="maturity_date" type="date" defaultValue={data?.maturity_date ?? ""} />
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
