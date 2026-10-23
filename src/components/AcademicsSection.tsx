import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { ACADEMIC_PROGRAMS, HOUSES_DATA, DEFAULT_SCHOOL_INFO } from '../data/defaultData';
import { AnthemAudioPlayer } from './AnthemAudioPlayer';
import { triggerFanfareDownload } from '../utils/audioFanfare';
import { 
  GraduationCap, 
  Home, 
  Music, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Briefcase, 
  Palette, 
  Microscope,
  Sprout,
  Copy,
  Check,
  Volume2,
  Download
} from 'lucide-react';

export const AcademicsSection: React.FC = () => {
  const { schoolInfo, setActiveTab } = useSchool();
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);



  const anthem = schoolInfo?.anthem || DEFAULT_SCHOOL_INFO.anthem;
  const anthemTitle = anthem?.title || DEFAULT_SCHOOL_INFO.anthem.title;
  const anthemStanzas = (anthem?.stanzas && anthem.stanzas.length > 0) 
    ? anthem.stanzas 
    : DEFAULT_SCHOOL_INFO.anthem.stanzas;

  const handleCopyLyrics = () => {
    const text = `${anthemTitle}\nGhanata Senior High School, Dodowa\n\n${anthemStanzas.join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getProgramIcon = (id: string) => {
    switch (id) {
      case 'science': return Microscope;
      case 'arts': return BookOpen;
      case 'business': return Briefcase;
      case 'home-economics': return Award;
      case 'visual-arts': return Palette;
      case 'agriculture': return Sprout;
      default: return GraduationCap;
    }
  };

  return (
    <div className="py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section 1: Academic Programs */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-900 uppercase tracking-widest bg-yellow-100 px-3 py-1 rounded-full mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-yellow-700" />
              <span>Rigorous Academic Disciplines</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
              Academic Programs Offered
            </h2>
            <p className="text-stone-600 font-academic italic text-sm sm:text-base mt-2">
              Comprehensive secondary curricula designed to foster intellectual rigour and prepare students for leading global universities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ACADEMIC_PROGRAMS.map((prog) => {
              const Icon = getProgramIcon(prog.id);
              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl p-7 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#14532d] mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-stone-900 mb-2">
                      {prog.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                      {prog.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Elective Subjects:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prog.electives.map((elec, i) => (
                          <span
                            key={i}
                            className="text-xs bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md border border-stone-200"
                          >
                            {elec}
                          </span>
                        ))}
                        <span className="text-xs bg-emerald-50 text-[#14532d] px-2.5 py-1 rounded-md border border-emerald-200 font-semibold italic">
                          etc.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-yellow-800 uppercase block">Career Pathways:</span>
                    <p className="text-xs text-stone-500 mt-0.5">{prog.careers}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official Course & 39 Classes Distribution Grid */}
          <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-bold text-yellow-800 uppercase tracking-widest">
                  Academic Structure & Class Arms (39 Classes Total)
                </span>
                <h3 className="font-heading text-xl font-extrabold text-[#14532d] mt-0.5">
                  Core Subjects & Class Arm Specifications
                </h3>
              </div>
              <div className="text-xs text-stone-500">
                Four Cores: <strong className="text-stone-800">Social Studies, General Science, General Mathematics, English Language</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="font-heading text-sm text-[#14532d]">General Art</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 font-mono text-[11px]">15 Classes</span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  <strong>Classes:</strong> GArt 1 to GArt 15
                </p>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span className="text-emerald-700 font-semibold block">All 4 core subjects constant:</span>
                  Social Studies, General Science, General Mathematics, English Language + 6 Elective slots for teachers.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="font-heading text-sm text-[#14532d]">Visual Art</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 font-mono text-[11px]">5 Classes</span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  <strong>Classes:</strong> V Art 1 to V Art 5
                </p>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span className="text-emerald-700 font-semibold block">All 4 core subjects constant:</span>
                  Social Studies, General Science, General Mathematics, English Language + 6 Elective slots for teachers.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="font-heading text-sm text-[#14532d]">Business</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 font-mono text-[11px]">5 Classes</span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  <strong>Classes:</strong> B1 to B5
                </p>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span className="text-emerald-700 font-semibold block">All 4 core subjects constant:</span>
                  Social Studies, General Science, General Mathematics, English Language + 6 Elective slots for teachers.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="font-heading text-sm text-[#14532d]">Home Economics</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 font-mono text-[11px]">5 Classes</span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  <strong>Classes:</strong> H1 to H5
                </p>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span className="text-emerald-700 font-semibold block">All 4 core subjects constant:</span>
                  Social Studies, General Science, General Mathematics, English Language + 6 Elective slots for teachers.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="font-heading text-sm text-[#14532d]">Agric</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 font-mono text-[11px]">3 Classes</span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  <strong>Classes:</strong> Agric 1 to Agric 3
                </p>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span className="text-emerald-700 font-semibold block">All 4 core subjects constant:</span>
                  Social Studies, General Science, General Mathematics, English Language + 6 Elective slots for teachers.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-yellow-400 bg-yellow-50/50 space-y-2">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="font-heading text-sm text-[#14532d]">Science</span>
                  <span className="px-2 py-0.5 rounded bg-[#14532d] text-white font-mono text-[11px]">6 Classes</span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  <strong>Classes:</strong> Science 1 to Science 6
                </p>
                <div className="text-[11px] text-yellow-900 pt-1 border-t border-yellow-200">
                  <span className="font-semibold block text-yellow-800">Special Curriculum Rule:</span>
                  All core subjects <em>except General Science</em> are constant (Social Studies, General Mathematics, English Language) + 6 Elective slots for teachers (Physics, Chemistry, Biology, Elective Maths, etc.).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: School Houses of Residence */}
        <div className="pt-8 border-t border-stone-200">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#14532d] uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full mb-3">
              <Home className="w-3.5 h-3.5 text-[#14532d]" />
              <span>Co-Curricular Community</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
              School Houses of Residence
            </h2>
            <p className="text-stone-600 font-academic italic text-sm sm:text-base mt-2">
              The vibrant residential houses fostering camaraderie, sportsmanship, and leadership competitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOUSES_DATA.map((house, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:border-[#14532d]/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-white shadow-xs"
                    style={{ backgroundColor: house.color }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-stone-900">
                      {house.name}
                    </h3>
                    <p className="text-xs text-yellow-800 font-serif italic font-semibold">
                      "{house.motto}"
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {house.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: School Anthem & Ceremonial Fanfare Audio */}
        <div id="school-anthem-section" className="bg-gradient-to-br from-stone-950 via-[#0a2e16] to-[#14532d] text-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-yellow-500/30 relative overflow-hidden scroll-mt-24">
          {/* Subtle decorative background watermarks */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 mx-auto flex items-center justify-center text-yellow-400 border border-yellow-400/30 shadow-inner">
              <Music className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-[11px] font-bold uppercase tracking-widest">
                <SchoolCrest size="sm" />
                <span>Official Ghanata Anthem</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {anthemTitle}
              </h3>
              <p className="text-xs sm:text-sm text-yellow-100/80 font-serif italic max-w-xl mx-auto">
                The revered hymn of Ghanata Senior High School, celebrating God's grace, the eagle's flight, and the eternal crown of victory.
              </p>
            </div>

            {/* Ceremonial Audio Player with Waveform & Download */}
            <div className="pt-2 max-w-2xl mx-auto w-full text-left">
              <AnthemAudioPlayer />
            </div>

            {/* Quick interactive action bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  triggerFanfareDownload('Ghanata_Senior_High_School_Anthem.wav');
                  setDownloaded(true);
                  setTimeout(() => setDownloaded(false), 2500);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-heading text-xs font-bold transition-all shadow-md hover:shadow-yellow-400/20 active:scale-95 cursor-pointer"
              >
                {downloaded ? <Check className="w-4 h-4 text-emerald-950" /> : <Download className="w-4 h-4" />}
                <span>{downloaded ? 'Downloading Fanfare...' : 'Download Fanfare (.wav)'}</span>
              </button>

              <a
                href={schoolInfo.anthem?.audioUrl || "/Ghanata Senior High School Anthem.mp3"}
                download={schoolInfo.anthem?.audioFileName || "Ghanata Senior High School Anthem.mp3"}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-yellow-300 border border-yellow-400/30 font-heading text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{schoolInfo.anthem?.audioFileName ? `Download Audio (${schoolInfo.anthem.audioFileName.slice(-3).toUpperCase()})` : 'Download Fanfare (.mp3)'}</span>
              </a>

              <button
                onClick={handleCopyLyrics}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-heading text-xs font-semibold transition-all hover:border-yellow-400/50 active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-yellow-300" />}
                <span>{copied ? 'Lyrics Copied to Clipboard!' : 'Copy Official Lyrics'}</span>
              </button>
            </div>

            {/* Stanzas Display */}
            <div className="space-y-6 pt-4 text-stone-100 font-serif text-base sm:text-lg leading-relaxed">
              {anthemStanzas.map((stanza, idx) => {
                const isChorus = stanza.startsWith('Chorus:') || idx === 1;
                const cleanStanza = stanza.replace(/^Chorus:\n?/, '');
                
                return (
                  <div 
                    key={idx} 
                    className={`p-6 sm:p-8 rounded-2xl border transition-all text-center ${
                      isChorus 
                        ? 'bg-gradient-to-b from-yellow-950/20 to-black/40 border-yellow-500/40 shadow-lg' 
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <div className="mb-4">
                      <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-heading ${
                        isChorus 
                          ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40' 
                          : 'bg-white/10 text-stone-300 border border-white/20'
                      }`}>
                        {isChorus ? 'Chorus / Refrain' : (idx === 0 ? 'Stanza I · Invocation & Excellence' : `Stanza ${idx + 1}`)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {cleanStanza.split('\n').map((line, lIdx) => {
                        if (!line.trim()) {
                          return <div key={lIdx} className="h-3" />;
                        }
                        const isHighlight = 
                          line.toLowerCase().includes('sempe merabllis') || 
                          line.toLowerCase().includes('victorious our crown') ||
                          line.toLowerCase().includes('carpet diem');
                          
                        return (
                          <p 
                            key={lIdx} 
                            className={`tracking-wide ${
                              isHighlight 
                                ? 'text-yellow-300 font-semibold' 
                                : 'text-stone-100'
                            }`}
                          >
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Institutional Seal & Motto Footer */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-yellow-200/90 border-t border-white/10">
              <div className="flex items-center gap-2">
                <SchoolCrest size="sm" />
                <span className="font-semibold tracking-wider">CARPE DIEM · SEMPER MIRABILIS</span>
              </div>
              <span className="hidden sm:inline text-yellow-400/40">·</span>
              <span className="text-stone-300">Sung proudly at all official Ghanata ceremonies and assemblies.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
