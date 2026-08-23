import { PageHeader } from "@/components/ui/PageHeader";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Agences Partenaires"
        description="Gérez les agences immobilières utilisant la plateforme Ztefu-Immo."
      />
      
      <div className="bg-white rounded-[24px] p-2 sm:p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="animate-pulse flex flex-col">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 py-4 px-4 bg-slate-50/50 rounded-xl mb-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 hidden md:block"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-10 ml-auto"></div>
          </div>
          
          {/* Rows Skeletons */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-5 px-4 border-b border-slate-50 last:border-0">
              <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="flex-1 hidden md:flex flex-col gap-2">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="w-20 h-6 bg-slate-200 rounded-full shrink-0"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-xl shrink-0 ml-4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
