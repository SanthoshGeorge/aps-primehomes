"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Lease } from "@/lib/types";
import { leaseStatus, STATUS_LABEL, STATUS_BADGE_CLASS, formatDate, formatCurrency } from "@/lib/format";
import { addLease, endCurrentLease } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function LeaseSection({
  propertyId,
  currentLease,
  history,
}: {
  propertyId: string;
  currentLease: Lease | null;
  history: Lease[];
}) {
  const [showForm, setShowForm] = useState(!currentLease);
  const action = addLease.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);
  const status = leaseStatus(currentLease);

  return (
    <div className="card">
      <h2 className="section-title">Current tenant & lease</h2>

      {currentLease && !showForm && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_BADGE_CLASS[status]}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-gray-500">Tenant</dt>
            <dd>{currentLease.tenant_name}</dd>
            <dt className="text-gray-500">Contact</dt>
            <dd>{[currentLease.tenant_phone, currentLease.tenant_email].filter(Boolean).join(" · ") || "—"}</dd>
            <dt className="text-gray-500">Rent</dt>
            <dd>{formatCurrency(currentLease.rent_amount)}/mo</dd>
            <dt className="text-gray-500">Lease term</dt>
            <dd>
              {formatDate(currentLease.start_date)} – {formatDate(currentLease.end_date)}
            </dd>
          </dl>
          <div className="flex gap-4 mt-3">
            <button className="text-sm text-brand-600 hover:underline" onClick={() => setShowForm(true)}>
              Enter new lease / renewal
            </button>
            <button
              className="text-sm text-gray-400 hover:text-red-600"
              onClick={() => endCurrentLease(propertyId)}
            >
              Mark vacant
            </button>
          </div>
        </div>
      )}

      {!currentLease && !showForm && (
        <p className="text-sm text-gray-400 mb-4">No current tenant — this property is vacant.</p>
      )}

      {showForm && (
        <form action={formAction} className="space-y-3 border-t border-gray-100 pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="tenant_name">
                Tenant name
              </label>
              <input className="input" id="tenant_name" name="tenant_name" required />
            </div>
            <div>
              <label className="label" htmlFor="rent_amount">
                Monthly rent
              </label>
              <input className="input" id="rent_amount" name="rent_amount" type="number" step="0.01" />
            </div>
            <div>
              <label className="label" htmlFor="tenant_phone">
                Tenant phone
              </label>
              <input className="input" id="tenant_phone" name="tenant_phone" />
            </div>
            <div>
              <label className="label" htmlFor="tenant_email">
                Tenant email
              </label>
              <input className="input" id="tenant_email" name="tenant_email" type="email" />
            </div>
            <div>
              <label className="label" htmlFor="start_date">
                Lease start
              </label>
              <input className="input" id="start_date" name="start_date" type="date" required />
            </div>
            <div>
              <label className="label" htmlFor="end_date">
                Lease end
              </label>
              <input className="input" id="end_date" name="end_date" type="date" required />
            </div>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <div className="flex gap-3">
            <SubmitButton label="Save lease" />
            {currentLease && (
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {history.length > 0 && (
        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Lease history ({history.length})
          </summary>
          <table className="w-full text-sm mt-2">
            <thead className="text-gray-500 text-left">
              <tr>
                <th className="py-1">Tenant</th>
                <th className="py-1">Start</th>
                <th className="py-1">End</th>
                <th className="py-1">Rent</th>
              </tr>
            </thead>
            <tbody>
              {history.map((l) => (
                <tr key={l.id} className="border-t border-gray-100">
                  <td className="py-1">{l.tenant_name}</td>
                  <td className="py-1">{formatDate(l.start_date)}</td>
                  <td className="py-1">{formatDate(l.end_date)}</td>
                  <td className="py-1">{formatCurrency(l.rent_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
