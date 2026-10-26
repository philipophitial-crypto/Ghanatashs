import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { Search, ArrowRight, Award, ShieldCheck, BookOpen, GraduationCap, ChevronRight, Users, Music, Lock } from 'lucide-react';

export const Hero: React.FC = () => {
  const { schoolInfo, setActiveTab, students, setActiveResultStudentId } = useSchool();
  const [quickIndex, setQuickIndex] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const clean = quickIndex.trim().toUpperCase();
    if (!clean) {
      setSearchError('Please enter a student index number (e.g. GHS/2024/001)');
      return;
    }

    const found = students.find(
      s => s.indexNumber.toUpperCase() === clean || s.indexNumber.replace(/\//g, '-').toUpperCase() === clean
    );

    if (found) {
      setActiveResultStudentId(found.id);
      setActiveTab('results');
    } else {
      setSearchError(`No student record found for index "${clean}". Please verify your admission year and index number.`);
    }
  };

  return (
    <div className="relative bg-linear-to-b from-stone-950 via-[#0d3820] to-[#14532d] text-white overflow-hidden">
      {/* Subtle architectural background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      {/* Top Banner highlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: School Title, Motto & Vision Intro */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Clean Institutional Metadata */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-medium text-yellow-200/90 tracking-wide">
              <span className="flex items-center gap-1.5 font-bold text-yellow-300">
                <Award className="w-4 h-4 text-yellow-400" />
                Category A Senior High School
              </span>
              <span className="text-white/30">·</span>
              <span className="text-stone-300">Dodowa, Greater Accra</span>
              <span className="text-white/30">·</span>
              <span className="text-yellow-400 font-semibold">Est. 1936</span>
            </div>

            {/* School Main Heading */}
            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                GHANATA <br />
                <span className="text-yellow-400">SENIOR HIGH SCHOOL</span>
              </h1>
              <p className="text-xl sm:text-2xl font-academic italic text-yellow-100/90 font-medium">
                "{schoolInfo.mottoLatin}" · <span className="font-sans not-italic text-stone-200 text-lg">{schoolInfo.mottoEnglish}</span>
              </p>
            </div>

            {/* Introduction paragraph */}
            <p className="text-stone-200 text-sm sm:text-base max-w-2xl leading-relaxed text-justify lg:text-left">
              Founded in 1936 by <strong className="text-yellow-300">Rev. Emmanuel Osabutey-Aguedze</strong>, Ghanata Senior High School has nurtured generations of illustrious leaders, scholars, and professionals across Ghana and the globe beneath the Shai Hills of Dodowa.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => setActiveTab('results')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-bold text-sm shadow-lg hover:shadow-yellow-400/30 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Check Student Results</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-yellow-300" />
                <span>School History & Founder</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('academics');
                  setTimeout(() => {
                    const el = document.getElementById('school-anthem-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-200 font-medium text-sm backdrop-blur-xs border border-yellow-400/30 transition-colors cursor-pointer"
              >
                <Music className="w-4 h-4 text-yellow-300" />
                <span>School Anthem & Audio</span>
              </button>

              <button
                onClick={() => setActiveTab('pta')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 font-medium text-sm backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-yellow-300" />
                <span>PTA Notices</span>
              </button>

              <button
                onClick={() => {
                  const elem = document.getElementById('headteacher-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-yellow-200/90 hover:text-white text-sm hover:underline cursor-pointer"
              >
                <span>Meet Headteacher</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Key Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="font-heading text-xl sm:text-2xl font-bold text-yellow-400">88+</div>
                <div className="text-[11px] sm:text-xs text-stone-300">Years of Academic Excellence</div>
              </div>
              <div>
                <div className="font-heading text-xl sm:text-2xl font-bold text-yellow-400">3,200+</div>
                <div className="text-[11px] sm:text-xs text-stone-300">Enrolled Students</div>
              </div>
              <div>
                <div className="font-heading text-xl sm:text-2xl font-bold text-yellow-400">6</div>
                <div className="text-[11px] sm:text-xs text-stone-300">Academic Programs</div>
              </div>
            </div>
          </div>

          {/* Right Column: Instant Student Result Checker Box */}
          <div className="lg:col-span-5">
            <div className="bg-white text-stone-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400/90 relative">
              <div className="absolute -top-6 right-6">
                <div className="bg-[#14532d] p-2.5 rounded-2xl shadow-md border-2 border-yellow-400">
                  <SchoolCrest size="sm" />
                </div>
              </div>

              <div className="mb-4">
                <span className="text-[11px] font-bold tracking-widest text-[#14532d] uppercase block">
                  Official Examination Portal
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-1 font-heading">
                  Student Terminal Results
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Access terminal scores, WASSCE performance records, and print official slips for Ghanata SHS scholars.
                </p>
              </div>

              {/* Quick Search Form */}
              <form onSubmit={handleQuickSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Student Index Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={quickIndex}
                      onChange={(e) => setQuickIndex(e.target.value)}
                      placeholder="e.g. GHS/2024/001"
                      className="w-full px-4 py-3 pl-10 text-sm font-mono border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] bg-stone-50"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {searchError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                    {searchError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Lookup Student Result</span>
                </button>
              </form>

              {/* Official Index Required Notice */}
              <div className="mt-5 pt-4 border-t border-stone-200">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#14532d]">
                    <Lock className="w-3.5 h-3.5 text-yellow-600" />
                    <span>Confidential Results Protection</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Enter your assigned student index number (e.g. <strong className="font-mono text-stone-800">GHS/2024/001</strong>) to view your official terminal report card. The year in your index represents the year you were admitted to Ghanata SHS.
                  </p>
                </div>
              </div>

              {/* Secure Notice */}
              <div className="mt-4 flex items-center gap-2 text-[11px] text-stone-500 bg-stone-100/70 p-2 rounded">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verified Ghanata Academic Records & Terminal Results System</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
