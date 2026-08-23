import { PageHeader } from "@/components/ui/PageHeader";
import { createAdminClient } from "@/utils/supabase/server";
import { AgenciesTable } from "./AgenciesTable";

export const dynamic = "force-dynamic";

export default async function AdminAgenciesPage() {
  const adminClient = createAdminClient();

  const { data: agencies, error } = await adminClient
    .from("agencies")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("Admin Agencies Page - agencies:", agencies, "error:", error);

  return (
    <div className="flex flex-col gap-8 pb-20 sm:pb-0">
      <PageHeader 
        title="Gestion des Agences" 
        description="Liste de toutes les agences immobilières utilisant la plateforme."
      />

      <AgenciesTable agencies={agencies || []} />
    </div>
  );
}
