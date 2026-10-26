import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { Quote, Award, Sparkles, HeartHandshake } from 'lucide-react';

export const FounderSection: React.FC = () => {
  const { founder, setActiveTab } = useSchool();

  return (
    <section className="py-20 bg-linear-to-b from-stone-900 via-stone-900 to-stone-950 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#14532d]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-300 uppercase tracking-widest bg-yellow-500/20 px-3 py-1 rounded-full mb-3 border border-yellow-400/30">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Founding Father & Pioneer Visionary</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Founder: {founder.name}
          </h2>
          <p className="text-stone-300 font-academic italic text-sm sm:text-base mt-2">
            The heroic Ghanaian cleric and educator who lit the flame of knowledge for Ghanata in 1936.
          </p>
        </div>

        {/* Founder Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-stone-800/60 rounded-3xl p-6 sm:p-10 border border-stone-700/80 backdrop-blur-xs shadow-2xl">
          
          {/* Left Column: Founder Portrait & Title Badge */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative group">
              {/* Gold & Green decorative frame */}
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-yellow-200 to-[#14532d] rounded-2xl opacity-75 blur-xs group-hover:opacity-100 transition-opacity" />
              
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-900 border-2 border-yellow-400 shadow-2xl">
                <img
                  src={founder.imageUrl}
                  alt={founder.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top filter grayscale contrast-110 hover:grayscale-0 transition-all duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/founder.jpg';
                  }}
                />
                
                {/* Overlay vignette */}
                <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-transparent to-transparent opacity-80" />
                
                {/* Bottom label on image */}
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="font-heading text-sm font-bold text-yellow-300 tracking-wider block">
                    {founder.name.toUpperCase()}
                  </span>
                  <div className="text-[11px] text-stone-300 font-serif">
                    {founder.yearsOfLife}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <h3 className="font-heading text-xl font-bold text-white">
                {founder.name}
              </h3>
              <p className="text-amber-400 font-serif italic text-sm">
                {founder.title}
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-stone-400 mt-2 bg-stone-900/80 px-3 py-1 rounded-full border border-stone-700">
                <span>Established 2nd February, {founder.foundingYear}</span>
                <span>·</span>
                <span>Adidome / Dodowa</span>
              </div>
            </div>


          </div>

          {/* Right Column: Biography, Quote & Heritage */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quote Box */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-6 relative">
              <Quote className="w-8 h-8 text-amber-400/40 absolute top-3 right-3" />
              <p className="text-base sm:text-lg font-academic italic text-amber-100 leading-relaxed">
                {founder.quote}
              </p>
              <p className="text-xs font-heading font-semibold text-amber-400 mt-3 text-right">
                · Rev. Emmanuel Osabutey-Aguedze
              </p>
            </div>

            {/* Detailed Biography */}
            <div className="space-y-4 text-stone-300 text-sm sm:text-base leading-relaxed text-justify">
              <p>
                {founder.biography}
              </p>
            </div>

            {/* Key Contributions */}
            <div className="pt-4 border-t border-stone-700">
              <h4 className="font-heading text-sm font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Enduring Contributions to Ghanaian Education:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {founder.keyContributions.map((contrib, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-stone-900/60 p-3 rounded-xl border border-stone-700/60">
                    <HeartHandshake className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-300">{contrib}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House & Memorial */}
            <div className="bg-stone-900/90 rounded-xl p-4 border border-amber-400/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SchoolCrest size="sm" />
                <div>
                  <div className="text-xs font-bold text-white uppercase">Osabutey House (House 1)</div>
                  <div className="text-[11px] text-stone-400">Memorial hall named in everlasting honor of our founder.</div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-950 px-3 py-1 rounded border border-amber-800">
                Motto: Leadership Through Sacrifice
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
