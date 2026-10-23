import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Search, 
  Filter, 
  FileText, 
  ArrowRight, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { PtaNotice } from '../types';

export const PtaPage: React.FC = () => {
  const { ptaNotices, schoolInfo, setActiveTab } = useSchool();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<PtaNotice | null>(null);

  const categories = [
    'All',
    'General Meeting',
    'Levies & Welfare',
    'Academic Report',
    'Development Projects',
    'Emergency Notice'
  ];

  const filteredNotices = ptaNotices.filter(notice => {
    if (selectedCategory !== 'All' && notice.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        notice.title.toLowerCase().includes(q) ||
        notice.content.toLowerCase().includes(q) ||
        notice.summary.toLowerCase().includes(q) ||
        notice.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (priority: PtaNotice['priority']) => {
    switch (priority) {
      case 'Urgent':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">Urgent Notice</span>;
      case 'Important':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">Important</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded text-[10px] uppercase">General</span>;
    }
  };

  return (
    <div className="py-12 bg-stone-100/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Institutional Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-900 uppercase tracking-widest bg-yellow-100 px-3 py-1 rounded-full">
                <Users className="w-3.5 h-3.5 text-yellow-700" />
                <span>Parent-Teacher Association (PTA) Portal</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
                Ghanata Parent-Teacher Association
              </h1>
              <p className="text-stone-600 text-sm sm:text-base font-academic leading-relaxed text-justify">
                Official communication channel for parents and guardians of Ghanata Senior High School, Dodowa. Stay informed on statutory meetings, academic progress reviews, welfare levies, and ongoing development projects.
              </p>
            </div>

            {/* Admin Management Notice */}
            <div className="bg-yellow-50/80 border-2 border-yellow-300/80 rounded-2xl p-5 lg:max-w-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-900">
                <ShieldCheck className="w-4 h-4 text-yellow-700" />
                <span>Secretariat Notice:</span>
              </div>
              <p className="text-xs text-yellow-950/80 leading-relaxed">
                All announcements on this page are officially posted and managed through the Developer Page (can be deleted or edited).
              </p>
              <button
                onClick={() => setActiveTab('developer')}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage PTA in Developer Page</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PTA announcements, agendas, levies..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-stone-50"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#14532d] text-white font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          <div className="text-xs text-stone-500 flex items-center justify-between pt-2 border-t border-stone-100">
            <span>Showing {filteredNotices.length} official PTA announcements</span>
            <span className="font-mono text-[11px]">Updated regularly by the PTA Executive Secretariat</span>
          </div>
        </div>

        {/* Notices Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-yellow-900 uppercase tracking-wider bg-yellow-100 px-2.5 py-0.5 rounded">
                      {notice.category}
                    </span>
                    {getPriorityBadge(notice.priority)}
                  </div>
                  <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {notice.date}
                  </span>
                </div>

                <h3 className="font-heading text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                  {notice.summary}
                </p>

                {/* Venue & Time if present */}
                {(notice.venue || notice.time) && (
                  <div className="mt-4 pt-3 border-t border-stone-100 bg-stone-50/70 p-3 rounded-xl space-y-1 text-xs text-stone-700">
                    {notice.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-yellow-700 flex-shrink-0" />
                        <span>Venue: <strong>{notice.venue}</strong></span>
                      </div>
                    )}
                    {notice.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-yellow-700 flex-shrink-0" />
                        <span>Schedule: <strong>{notice.time}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-serif italic">
                  Issued by: {notice.author}
                </span>

                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#14532d] hover:text-[#0b331c] hover:underline cursor-pointer"
                >
                  <span>Read Full Notice</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredNotices.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500 space-y-2">
              <FileText className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No Announcements Found</h3>
              <p className="text-xs text-stone-500">
                No PTA announcements match your search criteria. You can post a new notice in the Developer Page.
              </p>
              <button
                onClick={() => setActiveTab('developer')}
                className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg"
              >
                Go to Developer Page
              </button>
            </div>
          )}
        </div>

        {/* PTA Executive Committee & Contacts Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">
              Governance & Representation
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              PTA Executive Council & Liaison Officers
            </h2>
            <p className="text-xs text-stone-500">
              Elected parent representatives working harmoniously with school authorities to uplift student welfare.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-yellow-900 uppercase">Executive Portfolio</span>
              <h4 className="font-heading font-bold text-stone-900 text-sm mt-0.5">Office of the PTA Chairman</h4>
              <p className="text-[11px] text-stone-500 mt-1">Representative of Parent Body</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-yellow-900 uppercase">Executive Portfolio</span>
              <h4 className="font-heading font-bold text-stone-900 text-sm mt-0.5">Office of the PTA Vice-Chairperson</h4>
              <p className="text-[11px] text-stone-500 mt-1">Welfare & Boarding Oversight</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-yellow-900 uppercase">Executive Portfolio</span>
              <h4 className="font-heading font-bold text-stone-900 text-sm mt-0.5">Office of the PTA Financial Secretary</h4>
              <p className="text-[11px] text-stone-500 mt-1">Audit & Treasury Records</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-yellow-900 uppercase">Ex-Officio Portfolio</span>
              <h4 className="font-heading font-bold text-stone-900 text-sm mt-0.5">Office of the Headmaster</h4>
              <p className="text-[11px] text-stone-500 mt-1">Liaison to Ghana Education Service</p>
            </div>
          </div>
        </div>

      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-yellow-900 uppercase bg-yellow-100 px-2 py-0.5 rounded">
                    {selectedNotice.category}
                  </span>
                  {getPriorityBadge(selectedNotice.priority)}
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
                  {selectedNotice.title}
                </h2>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                  <span>Date: {selectedNotice.date}</span>
                  <span>·</span>
                  <span>Issued by: {selectedNotice.author}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-stone-400 hover:text-stone-800 text-2xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {(selectedNotice.venue || selectedNotice.time) && (
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                {selectedNotice.venue && (
                  <div><strong>Venue:</strong> {selectedNotice.venue}</div>
                )}
                {selectedNotice.time && (
                  <div><strong>Time / Hours:</strong> {selectedNotice.time}</div>
                )}
              </div>
            )}

            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 whitespace-pre-line text-justify font-sans">
              {selectedNotice.content}
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                Official Ghanata SHS PTA Document
              </span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
