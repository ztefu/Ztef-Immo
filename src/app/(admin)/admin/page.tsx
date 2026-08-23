import { PageHeader } from "@/components/ui/PageHeader";
import { Building2, Users, UserSquare2, TrendingUp } from "lucide-react";
import { createAdminClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient();

  // Fetch counts for KPI
  const { count: agenciesCount, error: agenciesError } = await adminClient.from("agencies").select("*", { count: "exact", head: true });
  console.log("Admin Dashboard - agenciesCount:", agenciesCount, "error:", agenciesError);
  
  const { count: ownersCount } = await adminClient.from("owners").select("*", { count: "exact", head: true }).eq("management_type", "Autonome");
  const { count: tenantsCount } = await adminClient.from("tenants").select("*", { count: "exact", head: true });
  const { count: unitsCount } = await adminClient.from("units").select("*", { count: "exact", head: true });

  const { data: recentAgencies } = await adminClient.from("agencies").select("id, name, created_at, slug").order("created_at", { ascending: false }).limit(5);
  const { data: recentOwners } = await adminClient.from("owners").select("id, full_name, created_at, slug, management_type").order("created_at", { ascending: false }).limit(5);

  const activities = [
    ...(recentAgencies || []).map(a => ({
      id: a.id,
      title: "Nouvelle agence inscrite",
      name: a.name,
      slug: a.slug,
      date: new Date(a.created_at),
      type: "agency",
      badge: undefined
    })),
    ...(recentOwners || []).map(o => ({
      id: o.id,
      title: "Nouveau propriétaire inscrit",
      name: o.full_name,
      slug: o.slug,
      date: new Date(o.created_at),
      type: "owner",
      badge: o.management_type
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const stats = [
    { name: "Agences Inscrites", value: agenciesCount || 0, icon: Building2, color: "bg-blue-100 text-blue-600" },
    { name: "Propriétaires Autonomes", value: ownersCount || 0, icon: UserSquare2, color: "bg-purple-100 text-purple-600" },
    { name: "Locataires Actifs", value: tenantsCount || 0, icon: Users, color: "bg-green-100 text-green-600" },
    { name: "Logements Gérés", value: unitsCount || 0, icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 sm:pb-0">
      <PageHeader 
        title="Vue d'ensemble Super Admin" 
        description="Statistiques globales de la plateforme Ztefu-Immo."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for future charts or activity feed */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <h2 className="text-[20px] font-bold text-slate-900 mb-6">Activité Récente</h2>
          <div className="flex flex-col gap-4">
            {activities.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-50">
                {activities.map((activity, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${activity.type === 'agency' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'}`}>
                      {activity.type === 'agency' ? <Building2 className="w-5 h-5" /> : <UserSquare2 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600 font-medium truncate">{activity.name}</span>
                        {activity.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {activity.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap shrink-0 font-medium">
                      {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(activity.date)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Aucune activité récente pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
