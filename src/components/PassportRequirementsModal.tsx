import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PassportRequirementsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Requisiti Ufficiali Fototessera 35×45 mm
              </h3>
              <p className="text-[11px] text-slate-500">
                Standard ICAO per Passaporto, Carta d'Identità (CIE) e Patente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                Dimensioni Esatte
              </span>
              <p className="text-[11px] text-slate-500">
                35 mm di larghezza × 45 mm di altezza (proporzione 7:9).
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                Proporzione Viso
              </span>
              <p className="text-[11px] text-slate-500">
                Il capo (mento-sommità) deve occupare il 70-80% dell'altezza (32-36 mm).
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Cosa fare (Consigli per la foto perfetta)
            </h4>
            <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-400 pl-1">
              <li>Sguardo dritto rivolto verso l'obiettivo, occhi aperti e ben visibili.</li>
              <li>Espressione neutra, bocca chiusa e rilassata.</li>
              <li>Sfondo uniforme, chiaro (bianco, crema o grigio chiarissimo), senza ombre.</li>
              <li>Illuminazione omogenea su entrambi i lati del viso.</li>
              <li>Capelli che non coprono gli occhi o la forma del volto.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Cosa evitare
            </h4>
            <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-400 pl-1">
              <li>Niente occhiali con lenti scure o montature pesanti che coprono gli occhi.</li>
              <li>Niente copricapo (ammessi solo per motivi religiosi con volto visibile).</li>
              <li>Evitare sorrisi pronunciati o smorfie.</li>
              <li>Niente ombre marcate dietro la testa o sul volto.</li>
            </ul>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/50 text-[11px] text-indigo-900 dark:text-indigo-200">
            <strong>Consiglio per la Stampa del PDF A5:</strong>
            <br />
            Quando stampi su carta fotografica o comune con la stampante, assicurati di selezionare nelle opzioni di stampa <strong>"Scala 100%"</strong> oppure <strong>"Dimensioni effettive"</strong> (non selezionare "Adatta alla pagina"), così i 35×45 mm saranno precisi al decimo di millimetro.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
};
