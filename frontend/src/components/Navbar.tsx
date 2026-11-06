import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  Info, 
  Activity,
  LayoutDashboard,
  Sparkles,
  PlayCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/analysis') {
      return location.pathname === '/analysis' || location.pathname === '/analyze';
    }
    if (path === '/live-demo') {
      return location.pathname === '/live-demo' || location.pathname === '/demo';
    }
    return location.pathname === path;
  };

  const navItems = [
    { 
      path: '/', 
      label: 'Overview',
      shortLabel: 'Overview',
      icon: Activity 
    },
    { 
      path: '/live-demo', 
      label: 'Live Demo',
      shortLabel: 'Live Demo',
      icon: PlayCircle,
      highlight: true
    },
    { 
      path: '/dashboard', 
      label: 'Auditor Dashboard',
      shortLabel: 'Dashboard',
      prefix: 'Auditor ',
      icon: LayoutDashboard 
    },
    { 
      path: '/analysis', 
      label: 'District Analysis',
      shortLabel: 'Analysis',
      prefix: 'District ',
      icon: BarChart3 
    },
    { 
      path: '/rankings', 
      label: 'State Rankings',
      shortLabel: 'Rankings',
      prefix: 'State ',
      icon: Layers 
    },
    { 
      path: '/concepts', 
      label: 'Scheme Concepts',
      shortLabel: 'Concepts',
      prefix: 'Scheme ',
      icon: Sparkles 
    },
    { 
      path: '/about', 
      label: 'Methodology',
      shortLabel: 'Methodology',
      icon: Info 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-line)] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-navy)] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-none">
                <span className="font-bold text-base sm:text-lg text-[var(--color-ink)] tracking-tight whitespace-nowrap">
                  GovGuard <span className="text-[var(--color-saffron)]">AI</span>
                </span>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                  Audit Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-tight mt-1 whitespace-nowrap">
                Welfare Expenditure Anomaly Screening
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (>= lg: 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0 ml-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                    active
                      ? 'bg-[var(--color-navy)] text-white shadow-xs'
                      : item.highlight
                      ? 'text-[var(--color-navy)] bg-amber-50 hover:bg-amber-100 border border-amber-200'
                      : 'text-slate-600 hover:text-[var(--color-ink)] hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${
                    active 
                      ? 'text-white' 
                      : item.highlight 
                      ? 'text-[var(--color-saffron)]' 
                      : 'text-slate-500'
                  }`} />
                  <span>
                    {item.prefix ? (
                      <>
                        <span className="hidden xl:inline">{item.prefix}</span>
                        {item.shortLabel}
                      </>
                    ) : (
                      item.label
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Mobile / Tablet (< lg) Horizontal Scroll Navigation Row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-[var(--color-line)] scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
                  active
                    ? 'bg-[var(--color-navy)] text-white shadow-xs'
                    : item.highlight
                    ? 'text-[var(--color-navy)] bg-amber-50 border border-amber-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${
                  active 
                    ? 'text-white' 
                    : item.highlight 
                    ? 'text-[var(--color-saffron)]' 
                    : 'text-slate-500'
                }`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
};
