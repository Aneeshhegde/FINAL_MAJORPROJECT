import React from 'react';
import { Info } from 'lucide-react';

export const ResponsibleAIDisclaimer: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-start space-x-3.5">
        <div className="p-2 rounded-xl bg-blue-100 border border-blue-200 shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-1">
            Responsible AI & Statistical Anomaly Auditing Standard
          </span>
          Anomaly detection identifies statistically unusual patterns and statutory compliance deviations based on mathematical distributions and historical baselines. Anomaly flags do not establish legal proof of fraud; rather, they serve as high-priority audit triggers for field verification and departmental scrutiny by designated welfare authorities.
        </div>
      </div>
    </div>
  );
};
