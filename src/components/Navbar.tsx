import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { 
  Menu, 
  X, 
  GraduationCap, 
  FileText, 
  BookOpen, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Home
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, schoolInfo } = useSchool();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'results', label: 'Results', icon: FileText, highlight: true },
    { id: 'pta', label: 'PTA', icon: Users, isPta: true },
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'history', label: 'History & Founder', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        {/* Top institutional announcement strip */}
        <div className="bg-[#14532d] text-yellow-100 text-xs py-1.5 px-3 sm:px-8 border-b border-yellow-600/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-yellow-100/90 text-[10px] sm:text-xs truncate">
              <span className="flex items-center gap-1 flex-shrink-0">
                <MapPin className="w-3 h-3 text-yellow-400" />
                <span>Dodowa, Greater Accra</span>
              </span>
              <span className="hidden sm:inline text-yellow-400/40">|</span>
              <span className="hidden sm:flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span className="truncate">{schoolInfo.email}</span>
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-yellow-300 font-semibold flex-shrink-0">
              Est. 1936 · Carpe Diem
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & School Name */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none"
            >
              <SchoolCrest size="md" className="scale-90 sm:scale-100" />
              <div>
                <div className="font-heading font-extrabold text-sm sm:text-lg md:text-xl text-[#14532d] tracking-tight group-hover:text-emerald-800 transition-colors leading-tight">
                  GHANATA SENIOR HIGH
                </div>
                <div className="text-[10px] sm:text-xs text-stone-600 font-medium flex items-center gap-1.5">
                  <span className="text-yellow-700 font-bold tracking-wider">CARPE DIEM</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-500">Dodowa</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                if (item.highlight) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`ml-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#14532d] text-white shadow-sm ring-2 ring-[#14532d]/30'
                          : 'bg-yellow-50 hover:bg-yellow-100 text-[#14532d] border border-yellow-300 shadow-xs'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-yellow-600" />
                      <span>{item.label}</span>
                      <span className="bg-yellow-400 text-stone-950 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">Check</span>
                    </button>
                  );
                }

                if (item.isPta) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors relative cursor-pointer ${
                        isActive
                          ? 'text-[#14532d] bg-yellow-50 font-bold border border-yellow-200'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-yellow-700" />
                        <span>{item.label}</span>
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#14532d] rounded-full" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors relative cursor-pointer ${
                      isActive
                        ? 'text-[#14532d] font-semibold bg-emerald-50/70'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#14532d] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Mobile Action Buttons */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => handleNavClick('results')}
                className="px-2.5 py-1.5 bg-[#14532d] text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <FileText className="w-3.5 h-3.5 text-yellow-300" />
                <span>Results</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-700 hover:text-stone-950 hover:bg-stone-100 focus:outline-none cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-stone-900" /> : <Menu className="w-5 h-5 text-stone-900" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-1.5 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-[#14532d] border-l-4 border-[#14532d]'
                      : 'text-stone-700 hover:bg-stone-100'
                  } ${item.highlight ? 'bg-yellow-50 text-[#14532d] border border-yellow-300' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#14532d]' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#14532d] text-white">
                      Check Terminal Slip
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb-Friendly on Phones) */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 md:hidden flex items-center justify-around py-1.5 px-2 shadow-lg safe-bottom"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#14532d]' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'text-[#14532d] stroke-[2.5]' : 'text-stone-500'}`} />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavClick('results')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer relative ${
            activeTab === 'results' ? 'text-[#14532d]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <div className="relative">
            <FileText className={`w-5 h-5 mb-0.5 ${activeTab === 'results' ? 'text-[#14532d] stroke-[2.5]' : 'text-stone-600'}`} />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          </div>
          <span>Results</span>
        </button>

        <button
          onClick={() => handleNavClick('pta')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'pta' ? 'text-[#14532d]' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'pta' ? 'text-[#14532d] stroke-[2.5]' : 'text-stone-500'}`} />
          <span>PTA</span>
        </button>

        <button
          onClick={() => handleNavClick('academics')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'academics' ? 'text-[#14532d]' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <GraduationCap className={`w-5 h-5 mb-0.5 ${activeTab === 'academics' ? 'text-[#14532d] stroke-[2.5]' : 'text-stone-500'}`} />
          <span>Courses</span>
        </button>

        <button
          onClick={() => handleNavClick('contact')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'contact' ? 'text-[#14532d]' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Phone className={`w-5 h-5 mb-0.5 ${activeTab === 'contact' ? 'text-[#14532d] stroke-[2.5]' : 'text-stone-500'}`} />
          <span>Contact</span>
        </button>
      </nav>
    </>
  );
};
