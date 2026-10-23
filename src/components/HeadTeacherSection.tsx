import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { Settings, Edit3, Award, Quote, CheckCircle2 } from 'lucide-react';

export const HeadTeacherSection: React.FC = () => {
  const { headTeacher, setActiveTab } = useSchool();

  return (
    <section id="headteacher-section" className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Developer Page Note */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-stone-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#14532d] uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full mb-3">
              <Award className="w-3.5 h-3.5 text-[#14532d]" />
              <span>Office of the Administration</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
              Current Head Teacher
            </h2>
            <p className="text-stone-600 font-academic italic text-sm sm:text-base mt-1">
              Leadership, stewardship, and visionary guidance for modern Ghanata scholars.
            </p>
          </div>


        </div>

        {/* Headteacher Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Portrait & Official Badges */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden bg-stone-100 border-4 border-[#14532d] shadow-xl relative">
                  <img
                    src={headTeacher.imageUrl}
                    alt={headTeacher.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback if image link fails
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-stone-950/80 to-transparent p-3 text-white">
                    <span className="text-[11px] font-bold tracking-wider uppercase bg-[#14532d] px-2 py-0.5 rounded">
                      Headteacher in Office
                    </span>
                  </div>
                </div>


              </div>

              <div className="mt-5 space-y-1">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
                  {headTeacher.name}
                </h3>
                <p className="text-yellow-800 font-semibold text-sm">
                  {headTeacher.title}
                </p>
                <p className="text-xs text-stone-500 font-mono">
                  Tenure: {headTeacher.tenure}
                </p>
              </div>

            </div>

            {/* Right Column: Headteacher Welcome Speech & Vision */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Institutional quote introduction */}
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-5 relative">
                <Quote className="w-8 h-8 text-[#14532d]/20 absolute top-3 right-3" />
                <h4 className="font-heading text-sm font-bold text-[#14532d] uppercase tracking-wider mb-2">
                  Welcome Address from the Headmaster's Desk
                </h4>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed text-justify font-academic italic">
                  "{headTeacher.welcomeMessage}"
                </p>
              </div>

              {/* Qualifications and credentials */}
              <div>
                <h5 className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Academic Background & Credentials:
                </h5>
                <p className="text-xs sm:text-sm text-stone-600 bg-yellow-50/50 p-3 rounded-lg border border-yellow-200/60 font-mono">
                  {headTeacher.qualification}
                </p>
              </div>

              {/* Core administrative priorities */}
              <div className="space-y-2">
                <h5 className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Key Priorities for Ghanata Senior High:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700">
                  <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Maintaining top 10 WASSCE ranking in Greater Accra</span>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Expansion of digital science and robotic laboratories</span>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Zero tolerance for indiscipline, upholding "Carpe Diem"</span>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Strong collaboration with the Old Ghanatans Association</span>
                  </div>
                </div>
              </div>

              {/* Digital signature & Official Stamp */}
              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SchoolCrest size="sm" />
                  <div className="text-xs">
                    <div className="font-bold text-stone-900">Official Office of the Headmaster</div>
                    <div className="text-stone-500">Ghanata Senior High School, Dodowa</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-academic italic font-bold text-[#14532d] text-lg">
                    {headTeacher.name}
                  </div>
                  <div className="text-[11px] text-stone-500 uppercase font-mono">
                    Official Certified Seal
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
