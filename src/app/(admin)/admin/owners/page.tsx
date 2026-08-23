import { PageHeader } from "@/components/ui/PageHeader";
import { createAdminClient } from "@/utils/supabase/server";
import { OwnersTable } from "./OwnersTable";

export const dynamic = "force-dynamic";

export default async function AdminOwnersPage() {
  const adminClient = createAdminClient();

  // We only want autonomous owners here, as delegated owners are managed by agencies
  const { data: owners } = await adminClient
    .from("owners")
    .select("*")
    .eq("management_type", "Autonome")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8 pb-20 sm:pb-0">
      <PageHeader 
        title="Propriétaires Autonomes" 
        description="Liste des propriétaires gérant eux-mêmes leurs biens sur la plateforme."
      />

      <OwnersTable owners={owners || []} />
    </div>
  );
}
