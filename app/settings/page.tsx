import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: owner } = await supabase.from("owners").select("*").eq("id", user!.id).single();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="card">
        <p className="text-sm text-gray-500 mb-4">{owner?.email}</p>
        <SettingsForm currentName={owner?.name || ""} />
      </div>
      <div className="card">
        <h2 className="section-title">Password</h2>
        <p className="text-sm text-gray-500 mb-3">
          Change the password you use to sign in.
        </p>
        <Link href="/update-password" className="btn-secondary">
          Change password
        </Link>
      </div>
    </div>
  );
}
