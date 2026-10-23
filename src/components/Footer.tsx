import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { Mail, Phone, MapPin, Settings, Heart, Shield, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  const { schoolInfo, headTeacher, founder, setActiveTab } = useSchool();

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="no-print bg-stone-950 text-stone-300 border-t-4 border-[#14532d]">
      {/* Top Banner */}
      <div className="bg-[#14532d] text-yellow-100 py-3 px-4 sm:px-8 border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-yellow-300">CARPE DIEM</span>
            <span>·</span>
            <span>Seize the Opportunity</span>
            <span>·</span>
            <span className="hidden sm:inline">Enter to Learn, Depart to Serve</span>
          </div>

          <button
            onClick={() => handleNav('developer')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-stone-950/40 hover:bg-stone-950/70 text-yellow-300 font-semibold text-xs border border-yellow-400/40 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Developer Portal (Update Headteacher & Records)</span>
          </button>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Brand & Logo & Motto */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <SchoolCrest size="md" />
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  GHANATA SENIOR HIGH SCHOOL
                </h3>
                <p className="text-xs text-yellow-400 font-semibold">
                  Dodowa, Greater Accra Region · Est. 1936
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed text-justify">
              Established on 2nd February, 1936 by <strong className="text-stone-200">{founder.name}</strong> as Gold Coast Sub-Senior College, relocating to Dodowa in 1957. Category A public secondary institution dedicated to academic distinction and moral integrity.
            </p>

            <div className="pt-2 text-xs text-yellow-300 font-serif italic">
              "{schoolInfo.mottoLatin}" — {schoolInfo.mottoEnglish}
            </div>

            {/* Founder & Headteacher quick reference */}
            <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 space-y-1">
              <div>
                <span className="text-stone-300 font-semibold">Founder:</span> {founder.name} ({founder.yearsOfLife})
              </div>
              <div>
                <span className="text-stone-300 font-semibold">Current Headmaster:</span> {headTeacher.name}
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-yellow-300 transition-colors cursor-pointer"
                >
                  Home (Vision, Mission & Motto)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('results')}
                  className="hover:text-yellow-300 transition-colors font-semibold text-yellow-400 cursor-pointer flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Results Checker</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('history')}
                  className="hover:text-yellow-300 transition-colors cursor-pointer"
                >
                  Brief History & Founder Tribute
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('pta')}
                  className="hover:text-yellow-300 transition-colors cursor-pointer text-yellow-300"
                >
                  PTA Portal (Parent Announcements)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('academics')}
                  className="hover:text-yellow-300 transition-colors cursor-pointer"
                >
                  Academic Programs, Houses & School Anthem
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-yellow-300 transition-colors cursor-pointer"
                >
                  Secretariat & Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('teacher')}
                  className="hover:text-yellow-300 transition-colors font-medium text-yellow-200 cursor-pointer flex items-center gap-1.5 pt-0.5"
                >
                  <span>Teacher Mode (Input Marks)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('developer')}
                  className="hover:text-yellow-300 transition-colors font-medium text-stone-400 cursor-pointer flex items-center gap-1.5 pt-0.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Developer & Admin Page</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Contact & Address */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Official School Address
            </h4>
            
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">Postal Address (P.O. Box):</span>
                  <span>{schoolInfo.postOfficeBox}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">Official Email:</span>
                  <span className="font-mono text-stone-300">{schoolInfo.email}</span>
                  <span className="block font-mono text-stone-400 text-[11px]">{schoolInfo.secondaryEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">Telephone:</span>
                  <span>{schoolInfo.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 text-[11px] text-stone-400">
                <span className="text-yellow-400 font-bold block mb-0.5">Accreditation:</span>
                Ghana Education Service (GES) · Ministry of Education, Republic of Ghana.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Ghanata Senior High School, Dodowa. All Rights Reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Motto: "Carpe Diem"</span>
            <span>·</span>
            <span>Founded by Rev. Emmanuel Osabutey-Aguedze (1936)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
