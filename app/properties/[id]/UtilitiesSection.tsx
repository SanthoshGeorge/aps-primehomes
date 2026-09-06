"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { UtilityAccount } from "@/lib/types";
import { addUtility, deleteUtility } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Adding…" : "Add"}
    </button>
  );
}

export default function UtilitiesSection({
  propertyId,
  items,
}: {
  propertyId: string;
  items: UtilityAccount[];
}) {
  const action = addUtility.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="card">
      <h2 className="section-title">Utilities</h2>

      {items.length > 0 && (
        <table className="w-full text-sm mb-4">
          <thead className="text-gray-500 text-left">
            <tr>
              <th className="py-1">Type</th>
              <th className="py-1">Provider</th>
              <th className="py-1">Account</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="py-1">{u.utility_type}</td>
                <td className="py-1">{u.provider || "—"}</td>
                <td className="py-1">{u.account_reference || "—"}</td>
                <td className="py-1 text-right">
                  <button
                    className="text-xs text-gray-400 hover:text-red-600"
                    onClick={() => deleteUtility(propertyId, u.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form action={formAction} className="grid sm:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
        <div>
          <label className="label" htmlFor="utility_type">Type</label>
          <input className="input" id="utility_type" name="utility_type" placeholder="Electric" required />
        </div>
        <div>
          <label className="label" htmlFor="provider">Provider</label>
          <input className="input" id="provider" name="provider" />
        </div>
        <div>
          <label className="label" htmlFor="account_reference">Account #</label>
          <input className="input" id="account_reference" name="account_reference" />
        </div>
        {state?.error && <p className="text-sm text-red-600 sm:col-span-3">{state.error}</p>}
        <div className="sm:col-span-3">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
