import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { Landmark, Calendar, MapPin, Award, CheckCircle } from 'lucide-react';

export const BriefHistory: React.FC = () => {
  const { schoolInfo } = useSchool();

  const timelineMilestones = [
    {
      year: '1936',
      title: 'Founding at Adidome (Volta Region)',
      detail: 'Rev. Emmanuel Osabutey-Aguedze established "Gold Coast Sub-Senior College" on February 2, 1936 to expand secondary schooling to underprivileged Gold Coast youth.'
    },
    {
      year: '1940s',
      title: 'Growth & Relocation to Koforidua',
      detail: 'To accommodate expanding student enrollment and access higher academic opportunities, the college briefly relocated to Koforidua.'
    },
    {
      year: '1957',
      title: 'Permanent Home in Dodowa',
      detail: 'In the historic year of Ghana’s independence, the school settled permanently on its vast, scenic campus in Dodowa, Shai-Osudoku District, under the majestic Shai Hills.'
    },
    {
      year: 'Post-1957',
      title: 'Christened "Ghanata Senior High School"',
      detail: 'Renamed "Ghanata" in honor of the ancient Ghana Empire and the newly sovereign Ghanaian republic, adopting the Latin motto "Carpe Diem".'
    },
    {
      year: 'Modern Era',
      title: 'Category A Excellence & Co-Education',
      detail: 'Now recognized as one of Greater Accra’s premier Category A co-educational high schools, excelling in WASSCE, NSMQ, sports, debate, and producing national icons.'
    }
  ];

  return (
    <section id="history-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-stone-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-900 uppercase tracking-widest bg-yellow-100 px-3 py-1 rounded-full mb-3">
              <Landmark className="w-3.5 h-3.5 text-yellow-700" />
              <span>Historical Legacy Since 1936</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
              Brief History of Ghanata SHS
            </h2>
            <p className="text-stone-600 font-academic italic text-sm sm:text-base mt-1">
              From Adidome to the foot of the Shai Hills in Dodowa · nearly nine decades of scholastic distinction.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl">
            <SchoolCrest size="sm" />
            <div>
              <div className="text-xs font-bold text-stone-900 uppercase">Institutional Roots</div>
              <div className="text-[11px] text-yellow-800 font-serif font-semibold">1936 to Present</div>
            </div>
          </div>
        </div>

        {/* Narrative & Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Narrative: History Paragraphs */}
          <div className="lg:col-span-7 space-y-5 text-stone-700 leading-relaxed text-sm sm:text-base text-justify">
            {schoolInfo.briefHistory.map((paragraph, index) => (
              <p key={index} className="first-letter:text-3xl first-letter:font-heading first-letter:font-bold first-letter:text-[#14532d] first-letter:mr-1">
                {paragraph}
              </p>
            ))}

            {/* Historical Fast Facts */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <h4 className="font-heading font-bold text-stone-900 text-sm uppercase tracking-wider mb-3">
                Key Historical Markers:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">Original Name:</span>
                    <p className="text-stone-600">Gold Coast Sub-Senior College</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">Founding Date:</span>
                    <p className="text-stone-600">February 2, 1936</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">Permanent Relocation:</span>
                    <p className="text-stone-600">Dodowa, Shai-Osudoku (1957)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">Institution Category:</span>
                    <p className="text-stone-600">Category A Co-Educational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Timeline */}
          <div className="lg:col-span-5 bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            <h3 className="font-heading text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#14532d]" />
              <span>Chronological Milestones</span>
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-yellow-400">
              {timelineMilestones.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-3 border-[#14532d] group-hover:scale-125 transition-transform" />
                  
                  <div>
                    <span className="text-xs font-mono font-bold text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded">
                      {item.year}
                    </span>
                    <h4 className="font-semibold text-stone-900 text-sm mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Geographical Quote */}
            <div className="mt-8 pt-6 border-t border-stone-200 bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-950 italic font-academic">
                  "Nestled peacefully beneath the historic Shai Hills, Dodowa provides the ideal, tranquil academic sanctuary where the Ghanata spirit thrives."
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
