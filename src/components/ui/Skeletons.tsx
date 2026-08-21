import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/PageHeader";

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 mb-8">
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-end items-center gap-3 w-full sm:w-auto">
        <Skeleton className="h-11 w-64 rounded-full" />
        <Skeleton className="h-11 w-32 rounded-full" />
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="relative rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between overflow-hidden min-h-[160px]">
      <div className="flex justify-between items-start z-10">
        <div className="pr-16 w-full flex flex-col gap-3">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
      </div>
      <div className="absolute top-4 right-4 bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center border border-slate-100">
        <Skeleton className="h-6 w-6 rounded-full bg-slate-200" />
      </div>
      <div className="mt-8 flex items-end justify-between z-10 w-full">
        <Skeleton className="h-5 w-40 rounded-md" />
      </div>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-[24px] bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden p-2.5 h-[360px] flex flex-col">
      <Skeleton className="h-44 w-full rounded-[20px]" />
      <div className="p-4 flex flex-col grow">
        <div className="flex justify-between items-start mb-2 mt-2">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <Skeleton className="h-4 w-1/2 rounded-md mb-6" />
        <div className="grid grid-cols-4 gap-2 mb-6">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4"><Skeleton className="h-4 w-24 rounded-md" /></th>
              <th className="px-6 py-4"><Skeleton className="h-4 w-32 rounded-md" /></th>
              <th className="px-6 py-4"><Skeleton className="h-4 w-24 rounded-md" /></th>
              <th className="px-6 py-4"><Skeleton className="h-4 w-20 rounded-md" /></th>
              <th className="px-6 py-4"><Skeleton className="h-4 w-12 rounded-md" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-40 rounded-md" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded-md" /></td>
                <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-md" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 relative w-full">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] col-span-1 h-[340px]">
          <Skeleton className="h-6 w-40 rounded-md mb-8" />
          <Skeleton className="h-48 w-48 rounded-full mx-auto" />
        </div>
        <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] col-span-1 lg:col-span-2 h-[340px]">
          <Skeleton className="h-6 w-48 rounded-md mb-8" />
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    </div>
  );
}

export function PortalDashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 w-full">
      <div className="flex flex-col gap-4 mb-8">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] h-64">
            <Skeleton className="h-6 w-48 rounded-md mb-6" />
            <Skeleton className="h-12 w-full rounded-md mb-4" />
            <Skeleton className="h-10 w-1/3 rounded-full" />
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] h-48">
            <Skeleton className="h-6 w-48 rounded-md mb-6" />
            <Skeleton className="h-4 w-full rounded-md mb-3" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] h-48">
            <Skeleton className="h-6 w-32 rounded-md mb-6" />
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-4 w-24 rounded-md mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <Skeleton className="h-4 w-24 rounded-md mb-2" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <Skeleton className="h-4 w-24 rounded-md mb-2" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 rounded-md mb-2" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
      <div className="mb-2">
        <Skeleton className="h-4 w-24 rounded-md mb-2" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-full mt-4" />
    </div>
  );
}
