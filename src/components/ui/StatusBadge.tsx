import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "occupé":
      case "actif":
      case "payé":
        return "bg-[#dcfce7] text-[#22c55e]";
      case "annulé":
      case "résilié":
      case "inactif":
        return "bg-slate-100 text-slate-500";
      case "vacant":
      case "en attente":
      case "réservé":
      case "expire bientôt":
      case "partiellement payé":
        return "bg-[#fef08a] text-[#eab308]";
      case "en retard":
      case "expiré":
        return "bg-red-100 text-red-500";
      case "maintenance":
      case "en maintenance":
      case "en travaux":
        return "bg-[#dbeafe] text-[#3b82f6]";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold inline-flex items-center justify-center whitespace-nowrap", getStatusStyles(status), className)}>
      {status}
    </span>
  );
}
