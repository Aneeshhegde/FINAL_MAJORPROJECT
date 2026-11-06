import React from 'react';
import { 
  IndianRupee, 
  Briefcase, 
  Clock,
  Layers
} from 'lucide-react';
import { KPIs } from '../types';

interface KPICardsProps {
  kpis: KPIs;
  periodLabel?: string;
  snapshotCountLabel?: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ 
  kpis, 
  periodLabel = "FY 2018-19 to 2025-26 (2025-26 up to Feb)",
  snapshotCountLabel
}) => {
  const cards = [
    {
      title: 'Total Expenditure',
      value: `₹${(kpis.total_expenditure_lakhs / 100).toFixed(2)} Cr`,
      subtitle: `Wages: ₹${(kpis.total_wages_lakhs / 100).toFixed(2)} Cr | Material: ₹${(kpis.total_material_lakhs / 100).toFixed(2)} Cr`,
      period: periodLabel,
      icon: IndianRupee,
    },
    {
      title: 'Person-Days Generated',
      value: `${(kpis.total_persondays / 1000000).toFixed(2)} M`,
      subtitle: `${kpis.total_persondays.toLocaleString()} Central Liability Days`,
      period: periodLabel,
      icon: Clock,
    },
    {
      title: 'Works Implemented',
      value: kpis.total_works.toLocaleString(),
      subtitle: `${kpis.completed_works.toLocaleString()} Completed | ${kpis.ongoing_works.toLocaleString()} Ongoing`,
      period: periodLabel,
      icon: Briefcase,
    },
    {
      title: 'Reporting Snapshots',
      value: snapshotCountLabel || `${kpis.reporting_cycles || 558} snapshots (8 financial years)`,
      subtitle: `Yearly final cumulative snapshots aggregated`,
      period: periodLabel,
      icon: Layers,
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider px-1">
        <span>District Expenditure Baseline (Aggregated Annual Snapshots)</span>
        <span className="text-slate-400 font-mono normal-case">{periodLabel}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index}
              className="bg-white border border-[var(--color-line)] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-slate-50 text-[var(--color-navy)] border border-slate-100">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-2xl font-black text-[var(--color-ink)] tabular-nums tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium truncate">
                  {card.subtitle}
                </p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                  {card.period}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
