import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: owner } = await supabase.from("owners").select("*").eq("id", user!.id).single();

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>
      <div className="card">
        <p className="text-sm text-gray-500 mb-4">{owner?.email}</p>
        <SettingsForm currentName={owner?.name || ""} />
      </div>
    </div>
  );
}
