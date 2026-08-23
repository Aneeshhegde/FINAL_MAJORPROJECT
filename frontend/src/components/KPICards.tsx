import React from 'react';
import { 
  Users, 
  IndianRupee, 
  Briefcase, 
  Clock 
} from 'lucide-react';
import { KPIs } from '../types';

interface KPICardsProps {
  kpis: KPIs;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'Total Expenditure',
      value: `₹${(kpis.total_expenditure_lakhs / 100).toFixed(2)} Cr`,
      subtitle: `Wages: ₹${(kpis.total_wages_lakhs / 100).toFixed(2)} Cr | Material: ₹${(kpis.total_material_lakhs / 100).toFixed(2)} Cr`,
      icon: IndianRupee,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Total Workers & Beneficiaries',
      value: kpis.total_workers.toLocaleString(),
      subtitle: `${kpis.active_job_cards.toLocaleString()} Active Job Cards`,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Person-Days Generated',
      value: `${(kpis.total_persondays / 1000000).toFixed(2)} M`,
      subtitle: `${kpis.total_persondays.toLocaleString()} Central Liability Days`,
      icon: Clock,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Total Works Implemented',
      value: kpis.total_works.toLocaleString(),
      subtitle: `${kpis.completed_works.toLocaleString()} Completed | ${kpis.ongoing_works.toLocaleString()} Ongoing`,
      icon: Briefcase,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} border`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
