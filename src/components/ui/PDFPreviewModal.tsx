import { Modal } from "./Modal";
import { Download } from "lucide-react";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName?: string;
  title?: string;
}

export function PDFPreviewModal({ isOpen, onClose, pdfUrl, fileName = "Document.pdf", title = "Aperçu du document" }: PDFPreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col h-[70vh]">
        {pdfUrl ? (
          <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200">
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              title="PDF Preview"
              className="w-full h-full border-0" 
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Chargement de l'aperçu...
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (!pdfUrl) return;
              
              try {
                // Si l'URL vient d'un autre domaine (comme Supabase Storage),
                // l'attribut 'download' est ignoré par sécurité.
                // La solution est de télécharger le fichier en tâche de fond (fetch),
                // puis de créer une URL locale pour forcer le navigateur à le sauvegarder.
                const response = await fetch(pdfUrl);
                const blob = await response.blob();
                
                // On utilise le type générique pour forcer le téléchargement direct
                const forceDownloadBlob = new Blob([blob], { type: "application/octet-stream" });
                const localUrl = window.URL.createObjectURL(forceDownloadBlob);
                
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = localUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                
                // Nettoyage
                window.URL.revokeObjectURL(localUrl);
                document.body.removeChild(a);
                
                onClose();
              } catch (err) {
                console.error("Erreur lors du téléchargement forcé", err);
                // Plan B de secours si le fetch échoue (problème CORS par exemple)
                const a = document.createElement("a");
                a.href = pdfUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                onClose();
              }
            }}
            disabled={!pdfUrl}
            className={`flex items-center gap-2 px-6 h-11 rounded-full text-sm font-bold shadow-sm transition-all ${
              pdfUrl 
                ? "bg-white border border-slate-400 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md hover:-translate-y-0.5" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Download size={18} />
            Télécharger
          </button>
        </div>
      </div>
    </Modal>
  );
}
