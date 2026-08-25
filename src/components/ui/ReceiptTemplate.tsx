import { Payment, Tenant, Unit, Agency } from "@/lib/mock-data";
import { APP_NAME } from "@/lib/config";

interface ReceiptTemplateProps {
  tenant: Tenant;
  payment: Payment;
  unit: Unit | null;
  agency?: Agency | null;
}

export function ReceiptTemplate({ tenant, payment, unit, agency }: ReceiptTemplateProps) {
  const headerName = agency?.isVirtual ? APP_NAME : (agency?.name || APP_NAME);

  return (
    <div 
      id={`receipt-pdf-template-${payment.id}`} 
      className="bg-white p-12 text-slate-900"
      style={{ width: "794px", minHeight: "1123px" }} // A4 size in pixels at 96 DPI
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
        <div className="flex items-center gap-4">
          {agency?.logoUrl && (
            <img src={agency.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{headerName}</h1>
            <p className="text-slate-500 mt-2 font-medium">Gestion locative premium</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-primary mb-1">QUITTANCE DE LOYER</h2>
          <p className="text-slate-500 font-medium">Date d'émission : {payment.date}</p>
          <p className="text-slate-500 font-medium">Période : <span className="font-bold text-slate-700">{payment.month}</span></p>
        </div>
      </div>

      {/* Addresses */}
      <div className="flex justify-between mb-12">
        <div className="w-1/2 pr-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Propriétaire / Mandataire</h3>
          <p className="font-bold text-slate-900 text-lg">{agency?.name || APP_NAME}</p>
          <p className="text-slate-600 mt-1">{agency?.address || "123 Avenue de la République"}</p>
          {agency?.contactPhone && <p className="text-slate-600">{agency.contactPhone}</p>}
          <p className="text-slate-600">{agency?.contactEmail || `contact@${APP_NAME.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}</p>
        </div>
        <div className="w-1/2 pl-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Locataire</h3>
          <p className="font-bold text-slate-900 text-lg">{tenant.fullName}</p>
          <p className="text-slate-600 mt-1">{tenant.address}</p>
          <p className="text-slate-600">{tenant.phone}</p>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-slate-50 p-6 rounded-2xl mb-12 border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Détails du Logement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Type de bien</p>
            <p className="font-semibold text-slate-900">{unit?.type || "Logement"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Référence / Localisation</p>
            <p className="font-semibold text-slate-900">{unit?.reference || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Financials */}
      <div className="mb-12">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-4 font-bold text-slate-900 uppercase tracking-wider text-sm">Désignation</th>
              <th className="py-4 font-bold text-slate-900 uppercase tracking-wider text-sm text-right">Montant (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-5 text-slate-700 font-medium">Loyer de base ({payment.month})</td>
              <td className="py-5 text-right font-bold text-slate-900">{(payment.amountDue || 0).toLocaleString()}</td>
            </tr>
            {/* Can add charges here if available in the future */}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-16">
        <div className="w-1/2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-600 font-medium">Total dû</span>
            <span className="font-bold text-slate-900">{(payment.amountDue || 0).toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-600 font-medium">Montant réglé</span>
            <span className="font-bold text-green-600">{(payment.amountPaid || 0).toLocaleString()} FCFA</span>
          </div>
          <div className="w-full h-px bg-slate-200 my-3"></div>
          <div className="flex justify-between items-center">
            <span className="text-slate-900 font-bold">Reste à payer</span>
            <span className={`font-black text-xl ${((payment.amountDue || 0) - (payment.amountPaid || 0)) > 0 ? "text-orange-500" : "text-slate-900"}`}>
              {Math.max(0, (payment.amountDue || 0) - (payment.amountPaid || 0)).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-slate-100">
        <p className="text-sm text-slate-500 italic text-center">Quittance générée électroniquement le {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="text-sm text-slate-500 italic mt-1 text-center">Valable pour servir et valoir ce que de droit.</p>
        <div className="mt-6 text-xs text-slate-400 text-center">
          Généré avec <span className="font-semibold text-primary">{APP_NAME}</span>
        </div>
      </div>
    </div>
  );
}
