"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ServiceContact } from "@/lib/types";
import { addContact, deleteContact } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Adding…" : "Add"}
    </button>
  );
}

export default function ContactsSection({
  propertyId,
  items,
}: {
  propertyId: string;
  items: ServiceContact[];
}) {
  const action = addContact.bind(null, propertyId);
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="card">
      <h2 className="section-title">Handyman & service contacts</h2>

      {items.length > 0 && (
        <table className="w-full text-sm mb-4">
          <thead className="text-gray-500 text-left">
            <tr>
              <th className="py-1">Name</th>
              <th className="py-1">Trade</th>
              <th className="py-1">Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="py-1">{c.name}</td>
                <td className="py-1">{c.trade || "—"}</td>
                <td className="py-1">{c.phone || "—"}</td>
                <td className="py-1 text-right">
                  <button
                    className="text-xs text-gray-400 hover:text-red-600"
                    onClick={() => deleteContact(propertyId, c.id)}
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
          <label className="label" htmlFor="name">Name</label>
          <input className="input" id="name" name="name" required />
        </div>
        <div>
          <label className="label" htmlFor="trade">Trade</label>
          <input className="input" id="trade" name="trade" placeholder="Plumber" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" />
        </div>
        {state?.error && <p className="text-sm text-red-600 sm:col-span-3">{state.error}</p>}
        <div className="sm:col-span-3">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
