"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { Lease } from "@/lib/types";
import { leaseStatus, STATUS_LABEL, STATUS_BADGE_CLASS, formatDate, formatCurrency } from "@/lib/format";
import MoneyInput from "@/components/MoneyInput";
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
  historyCount,
}: {
  propertyId: string;
  currentLease: Lease | null;
  historyCount: number;
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
            {currentLease.notes && (
              <>
                <dt className="text-gray-500">Notes</dt>
                <dd className="whitespace-pre-wrap">{currentLease.notes}</dd>
              </>
            )}
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

      {!showForm && (
        <Link
          href={`/properties/${propertyId}/history`}
          className="text-sm text-gray-500 hover:text-brand-600 hover:underline"
        >
          View past tenants{historyCount > 0 ? ` (${historyCount})` : ""} →
        </Link>
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
              <MoneyInput id="rent_amount" name="rent_amount" />
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
            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea className="input" id="notes" name="notes" rows={2} />
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
    </div>
  );
}
