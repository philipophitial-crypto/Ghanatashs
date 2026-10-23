import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { Eye, Target, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { SchoolCrest } from './SchoolCrest';

export const VisionMissionMotto: React.FC = () => {
  const { schoolInfo } = useSchool();

  return (
    <section className="py-16 bg-stone-100/60 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-900 uppercase tracking-widest bg-yellow-100 px-3 py-1 rounded-full mb-3">
            <Compass className="w-3.5 h-3.5 text-yellow-700" />
            <span>Guiding Institutional Philosophy</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
            Vision, Mission & Motto
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2 font-academic">
            The enduring ideological pillars guiding Ghanata Senior High School since 1936.
          </p>
        </div>

        {/* 3 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: School Motto */}
          <div className="bg-white rounded-2xl p-7 shadow-xs border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-700 mb-5 border border-yellow-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                School Motto
              </span>
              <h3 className="text-2xl font-bold font-heading text-stone-900 mt-1 mb-2">
                {schoolInfo.mottoLatin}
              </h3>
              <p className="text-base font-academic italic text-yellow-800 font-semibold mb-4">
                "{schoolInfo.mottoEnglish}"
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed text-justify">
                "Carpe Diem" challenges every student and tutor to seize every golden hour, opportunity, and challenge with unwavering diligence, urgency, and moral resolve.
              </p>
              
              <div className="mt-4 pt-4 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-500 uppercase">Secondary Creed:</span>
                <p className="text-xs font-serif italic text-stone-700 mt-0.5">
                  "{schoolInfo.secondaryMotto}"
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-yellow-800 font-medium">
              <SchoolCrest size="sm" />
              <span>Emblazoned on the official Ghanata Crest</span>
            </div>
          </div>

          {/* Card 2: Vision Statement */}
          <div className="bg-white rounded-2xl p-7 shadow-xs border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#14532d]" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#14532d] mb-5 border border-emerald-200">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#14532d] uppercase tracking-widest">
                Our Vision
              </span>
              <h3 className="text-xl font-bold font-heading text-stone-900 mt-1 mb-3">
                Center of National Distinction
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed text-justify">
                {schoolInfo.vision}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Vision Benchmarks:
              </span>
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Top-tier WASSCE distinctions in all 6 programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>National Science & Maths Quiz supremacy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Mission Statement */}
          <div className="bg-white rounded-2xl p-7 shadow-xs border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-800 mb-5 border border-yellow-200">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
                Our Mission
              </span>
              <h3 className="text-xl font-bold font-heading text-stone-900 mt-1 mb-3">
                Holistic Education & Service
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed text-justify">
                {schoolInfo.mission}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Pillars of Implementation:
              </span>
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Academic discipline & STEM laboratories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Character formation & Civic leadership</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Core Values Strip */}
        <div className="mt-12 bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Ghanata SHS Core Values:
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {schoolInfo.coreValues.map((val, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-stone-800 bg-stone-100 px-3 py-1 rounded-md border border-stone-200/80"
              >
                {val}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
