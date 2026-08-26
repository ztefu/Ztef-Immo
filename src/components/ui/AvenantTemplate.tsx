import { Tenant, Unit, Agency, Property } from "@/lib/mock-data";
import { APP_NAME } from "@/lib/config";

interface AvenantTemplateProps {
  tenant: Tenant;
  unit: Unit | null;
  agency?: Agency | null;
  property?: Property | null;
  newEndDate: string;
  newRent?: number;
}

export function AvenantTemplate({ tenant, unit, agency, property, newEndDate, newRent }: AvenantTemplateProps) {
  const bailleurName = property?.owner || "Le Propriétaire";
  const agencyName = agency?.name || APP_NAME;
  const headerName = agency?.isVirtual ? APP_NAME : agencyName;
  
  return (
    <div 
      id={`avenant-pdf-template-${tenant.id}`} 
      className="bg-white p-12 text-slate-900"
      style={{ width: "794px", minHeight: "1123px" }} // A4 size in pixels at 96 DPI
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-1">AVENANT DE RENOUVELLEMENT</h2>
          <p className="text-slate-500 font-medium">Référence du bail : <span className="font-bold text-slate-700">{unit?.reference || "N/A"}</span></p>
        </div>
      </div>

      {/* Intro */}
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        Entre les soussignés, <strong>{bailleurName}</strong> (désigné "Le Bailleur", représenté par le gestionnaire {agencyName}), et <strong>{tenant.fullName}</strong> (désigné "Le Preneur"), il a été convenu ce qui suit, modifiant le contrat de bail initialement conclu le <strong>{tenant.entryDate}</strong> :
      </div>

      {/* Parties */}
      <div className="flex justify-between mb-8 gap-8">
        <div className="w-1/2 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Le Bailleur</h3>
          <p className="font-bold text-slate-900">{bailleurName}</p>
          <p className="text-slate-600 mt-1 italic text-xs mb-2">Propriétaire du bien</p>
          {!agency?.isVirtual && (
            <div className="border-t border-slate-200 pt-2 mt-2">
              <p className="text-slate-500 text-xs font-semibold mb-1">Représenté par le mandataire :</p>
              <p className="font-medium text-slate-900 text-sm">{agencyName}</p>
            </div>
          )}
        </div>
        <div className="w-1/2 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Le Preneur</h3>
          <p className="font-bold text-slate-900">{tenant.fullName}</p>
          <p className="text-slate-600 mt-1">Téléphone : {tenant.phone}</p>
          <p className="text-slate-600">CNI / ID : {tenant.idCardReference}</p>
        </div>
      </div>

      {/* Objet du contrat */}
      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">1. OBJET DE L'AVENANT</h3>
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        Le présent avenant a pour objet le <strong>renouvellement du bail</strong> concernant le logement suivant :
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><strong>Type de bien :</strong> {unit?.type || "Non défini"}</li>
          <li><strong>Référence / Numéro :</strong> {unit?.reference || "Non défini"}</li>
          <li><strong>Propriété :</strong> {property?.name || "Non défini"} ({property?.address || "Adresse non définie"})</li>
        </ul>
      </div>

      {/* Durée */}
      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">2. NOUVELLE ÉCHÉANCE</h3>
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        Les parties conviennent de prolonger la durée du contrat de bail susmentionné.
        La nouvelle date d'échéance du contrat est fixée au <strong>{newEndDate}</strong>.
      </div>

      {/* Loyer et charges */}
      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">3. LOYER MENTSUEL</h3>
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        {newRent && newRent !== tenant.rentAmount ? (
          <p>Le loyer mensuel est révisé et fixé à la somme de <strong>{newRent.toLocaleString()} FCFA</strong> à compter de la date de prise d'effet du présent renouvellement.</p>
        ) : (
          <p>Le montant du loyer mensuel est maintenu à la somme de <strong>{tenant.rentAmount.toLocaleString()} FCFA</strong>, selon les mêmes conditions stipulées dans le contrat initial.</p>
        )}
        <p className="mt-2 text-slate-500 italic">Toutes les autres clauses du contrat de bail initial restent inchangées et continuent de produire leurs effets entre les parties.</p>
      </div>
      
      {/* Footer */}
      <div className="mt-20 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        Généré avec <span className="font-semibold text-primary">{APP_NAME}</span>
      </div>
    </div>
  );
}
