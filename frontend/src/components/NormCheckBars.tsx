import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { NormChecks } from '../types';

interface NormCheckBarsProps {
  normChecks?: NormChecks;
  materialRatio?: number;
  adminRatio?: number;
  costPerDay?: number;
}

export const NormCheckBars: React.FC<NormCheckBarsProps> = ({
  normChecks,
  materialRatio = 0,
  adminRatio = 0,
  costPerDay = 0
}) => {
  // Use passed normChecks or fallback to calculated values
  const matVal = normChecks?.material?.value ?? normChecks?.material?.value_pct ? (normChecks.material.value_pct! / 100) : materialRatio;
  const adminVal = normChecks?.admin?.value ?? normChecks?.admin?.value_pct ? (normChecks.admin.value_pct! / 100) : adminRatio;
  const costVal = normChecks?.cost_per_day?.value ?? normChecks?.cost_per_day?.value_rs ?? costPerDay;

  // Material Norm: Limit 40% (0.40)
  // OK if <= 35%, NEAR if > 35% and <= 40%, OVER if > 40%
  const matPct = matVal * 100;
  const matStatus = matVal > 0.40 ? 'OVER' : matVal >= 0.35 ? 'NEAR' : 'OK';

  // Admin Norm: Limit 6% (0.06)
  // OK if <= 5%, NEAR if > 5% and <= 6%, OVER if > 6%
  const adminPct = adminVal * 100;
  const adminStatus = adminVal > 0.06 ? 'OVER' : adminVal >= 0.05 ? 'NEAR' : 'OK';

  // Cost per Day Norm: Limit ₹450 / ₹500
  // OK if <= 450, NEAR if 450-500, OVER if > 500
  const costStatus = costVal > 500 ? 'OVER' : costVal >= 450 ? 'NEAR' : 'OK';

  const getStatusBadge = (status: 'OK' | 'NEAR' | 'OVER') => {
    switch (status) {
      case 'OVER':
        return {
          badge: 'bg-red-50 text-red-700 border-red-300',
          text: 'Over Limit',
          barColor: 'bg-red-600',
          icon: XCircle,
        };
      case 'NEAR':
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-300',
          text: 'Near Limit',
          barColor: 'bg-[var(--color-saffron)]',
          icon: AlertTriangle,
        };
      default:
        return {
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          text: 'Within Norm',
          barColor: 'bg-[var(--color-green)]',
          icon: CheckCircle2,
        };
    }
  };

  const matTheme = getStatusBadge(matStatus);
  const adminTheme = getStatusBadge(adminStatus);
  const costTheme = getStatusBadge(costStatus);

  return (
    <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--color-ink)]">
            Statutory Norm & Expenditure Limits
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compares district-wide aggregated expenditure against statutory legal ceilings.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase border border-slate-200">
          Statutory Check
        </span>
      </div>

      <div className="space-y-5">
        
        {/* Norm 1: Material Share */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[var(--color-ink)]">1. Material Expenditure Share</span>
              <span className="text-slate-400 font-normal">(Statutory ceiling: 40.0%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm text-[var(--color-ink)] tabular-nums">
                {matPct.toFixed(1)}%
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${matTheme.badge}`}>
                <span>{matTheme.text}</span>
              </span>
            </div>
          </div>

          {/* Bar with Limit Marker */}
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${matTheme.barColor}`}
              style={{ width: `${Math.min(100, (matPct / 60) * 100)}%` }}
            />
          </div>
          {/* Reference tick at 40% (40/60 = 66.6%) */}
          <div className="relative w-full h-4 text-[10px] text-slate-400 font-mono">
            <span className="absolute left-0">0%</span>
            <span className="absolute left-[66.6%] -translate-x-1/2 text-red-600 font-bold">
              | 40% Ceiling
            </span>
            <span className="absolute right-0">60%</span>
          </div>
        </div>

        {/* Norm 2: Admin Share */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-line)]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[var(--color-ink)]">2. Administrative Overhead Share</span>
              <span className="text-slate-400 font-normal">(Official MoRD limit: 6.0%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm text-[var(--color-ink)] tabular-nums">
                {adminPct.toFixed(1)}%
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${adminTheme.badge}`}>
                <span>{adminTheme.text}</span>
              </span>
            </div>
          </div>

          {/* Bar with Limit Marker */}
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${adminTheme.barColor}`}
              style={{ width: `${Math.min(100, (adminPct / 12) * 100)}%` }}
            />
          </div>
          {/* Reference tick at 6% (6/12 = 50%) */}
          <div className="relative w-full h-4 text-[10px] text-slate-400 font-mono">
            <span className="absolute left-0">0%</span>
            <span className="absolute left-1/2 -translate-x-1/2 text-amber-700 font-bold">
              | 6% Limit
            </span>
            <span className="absolute right-0">12%</span>
          </div>
        </div>

        {/* Norm 3: Unit Cost per Personday */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-line)]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[var(--color-ink)]">3. Unit Cost per Person-Day</span>
              <span className="text-slate-400 font-normal">(Norm: ₹450 / Statutory breach: ₹500)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm text-[var(--color-ink)] tabular-nums">
                ₹{costVal.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${costTheme.badge}`}>
                <span>{costTheme.text}</span>
              </span>
            </div>
          </div>

          {/* Bar with Limit Marker */}
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${costTheme.barColor}`}
              style={{ width: `${Math.min(100, (costVal / 800) * 100)}%` }}
            />
          </div>
          {/* Reference ticks at ₹450 (56.25%) and ₹500 (62.5%) */}
          <div className="relative w-full h-4 text-[10px] text-slate-400 font-mono">
            <span className="absolute left-0">₹0</span>
            <span className="absolute left-[56.25%] -translate-x-1/2 text-amber-700 font-bold">
              | ₹450
            </span>
            <span className="absolute left-[62.5%] -translate-x-1/2 text-red-600 font-bold">
              | ₹500
            </span>
            <span className="absolute right-0">₹800+</span>
          </div>
        </div>

      </div>
    </div>
  );
};
