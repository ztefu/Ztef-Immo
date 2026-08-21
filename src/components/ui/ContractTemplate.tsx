import { Tenant, Unit, Agency, Property } from "@/lib/mock-data";
import { APP_NAME } from "@/lib/config";

interface ContractTemplateProps {
  tenant: Tenant;
  unit: Unit | null;
  agency?: Agency | null;
  property?: Property | null;
}

export function ContractTemplate({ tenant, unit, agency, property }: ContractTemplateProps) {
  const bailleurName = property?.owner || "Le Propriétaire";
  const agencyName = agency?.name || APP_NAME;
  
  return (
    <div 
      id={`contract-pdf-template-${tenant.id}`} 
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{agencyName}</h1>
            <p className="text-slate-500 mt-2 font-medium">Gestion locative premium</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">CONTRAT DE BAIL</h2>
          <p className="text-slate-500 font-medium">Type : <span className="font-bold text-slate-700">{tenant.leaseType}</span></p>
        </div>
      </div>

      {/* Intro */}
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        Entre les soussignés, <strong>{bailleurName}</strong> (désigné "Le Bailleur", représenté par le gestionnaire {agencyName}), et <strong>{tenant.fullName}</strong> (désigné "Le Preneur"), il a été convenu ce qui suit :
      </div>

      {/* Parties */}
      <div className="flex justify-between mb-8 gap-8">
        <div className="w-1/2 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Le Bailleur</h3>
          <p className="font-bold text-slate-900">{bailleurName}</p>
          <p className="text-slate-600 mt-1 italic text-xs mb-2">Propriétaire du bien</p>
          <div className="border-t border-slate-200 pt-2 mt-2">
            <p className="text-slate-500 text-xs font-semibold mb-1">Représenté par le mandataire :</p>
            <p className="font-medium text-slate-900 text-sm">{agencyName}</p>
            <p className="text-slate-600 mt-1">{agency?.address || "123 Avenue de la République"}</p>
            {agency?.contactPhone && <p className="text-slate-600">{agency.contactPhone}</p>}
            <p className="text-slate-600">{agency?.contactEmail || `contact@${APP_NAME.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}</p>
          </div>
        </div>
        <div className="w-1/2 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Le Preneur</h3>
          <p className="font-bold text-slate-900">{tenant.fullName}</p>
          <p className="text-slate-600 mt-1">Téléphone : {tenant.phone}</p>
          <p className="text-slate-600">CNI / ID : {tenant.idCardReference}</p>
          <p className="text-slate-600">Adresse actuelle : {tenant.address}</p>
        </div>
      </div>

      {/* Objet du contrat */}
      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">1. OBJET DU CONTRAT - DÉSIGNATION DU LOGEMENT</h3>
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        Le Bailleur donne en location au Preneur le logement ci-après désigné :
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><strong>Type de bien :</strong> {unit?.type || "Non défini"}</li>
          <li><strong>Référence / Numéro :</strong> {unit?.reference || "Non défini"}</li>
          <li><strong>Propriété :</strong> {property?.name || "Non défini"} ({property?.address || "Adresse non définie"})</li>
          <li><strong>Surface et équipements :</strong> Tel que décrit dans l'état des lieux annexé au présent contrat.</li>
        </ul>
      </div>

      {/* Durée */}
      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">2. DURÉE DU CONTRAT</h3>
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        Le présent contrat est conclu pour une durée fixée ({tenant.leaseType}), commençant à courir le <strong>{tenant.leaseStartDate || tenant.entryDate}</strong> 
        {tenant.leaseEndDate ? ` pour se terminer le ${tenant.leaseEndDate}.` : "."} En cas de renouvellement, les conditions feront l'objet d'un avenant.
      </div>

      {/* Loyer et charges */}
      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">3. LOYER ET DÉPÔT DE GARANTIE</h3>
      <div className="mb-8 text-sm text-slate-700 leading-relaxed text-justify">
        <ul className="list-disc ml-5 space-y-2">
          <li><strong>Loyer Mensuel :</strong> Le montant du loyer est fixé à <strong>{tenant.rentAmount.toLocaleString()} FCFA</strong> payable au début de chaque mois.</li>
          <li><strong>Dépôt de garantie :</strong> À la signature du présent contrat, le Preneur verse la somme de <strong>{tenant.depositAmount.toLocaleString()} FCFA</strong> à titre de dépôt de garantie, qui lui sera restituée en fin de bail sous réserve de l'état du logement.</li>
        </ul>
      </div>

      {/* Signature */}
      <div className="mt-20 pt-8 border-t border-slate-900 flex justify-between items-end">
        <div className="w-1/2 text-center">
          <p className="font-bold text-slate-900 mb-16">Le Bailleur / Le Mandataire ({agencyName})</p>
          <div className="w-48 h-10 border-b-2 border-slate-300 border-dashed mx-auto flex items-end justify-center pb-2">
             <span className="text-slate-300 text-xs italic">Signature électronique</span>
          </div>
        </div>
        <div className="w-1/2 text-center">
          <p className="font-bold text-slate-900 mb-16">Le Preneur ({tenant.fullName})</p>
          <div className="w-48 h-10 border-b-2 border-slate-300 border-dashed mx-auto flex items-end justify-center pb-2">
            <span className="text-slate-300 text-xs italic">Lu et approuvé</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
        Document appartenant à <strong>{agencyName}</strong> <br/>
        Généré avec <span className="font-semibold text-primary">{APP_NAME}</span>
      </div>
    </div>
  );
}
