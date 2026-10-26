import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building2 } from 'lucide-react';

export const ContactInfoSection: React.FC = () => {
  const { schoolInfo } = useSchool();
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Admissions & Results Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: 'Admissions & Results Inquiry', message: '' });
    }, 4000);
  };

  return (
    <section id="contact-section" className="py-20 bg-stone-100/70 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-900 uppercase tracking-widest bg-yellow-100 px-3 py-1 rounded-full mb-3">
            <Building2 className="w-3.5 h-3.5 text-yellow-700" />
            <span>Official Communications & Secretariat</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
            Contact Ghanata Senior High School
          </h2>
          <p className="text-stone-600 font-academic italic text-sm sm:text-base mt-2">
            Reach out to our administrative offices, academic departments, or headmaster's registry.
          </p>
        </div>

        {/* Contact Cards & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Official Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* P.O. Box & Physical Location Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-700 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider">
                    Postal Address & Location
                  </span>
                  <h4 className="text-base font-bold text-stone-900 mt-1">
                    {schoolInfo.postOfficeBox}
                  </h4>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    Physical Campus: {schoolInfo.campusAddress || 'Off the Accra-Somanya Road, Dodowa, Shai-Osudoku District, Greater Accra Region, Ghana.'}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <span>GPS Coordinates: {schoolInfo.gpsCoordinates || 'Dodowa Valley Campus'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Channels Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#14532d] shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#14532d] uppercase tracking-wider">
                    Official Email Communications
                  </span>
                  <h4 className="text-base font-bold text-stone-900 mt-1">
                    <a href={`mailto:${schoolInfo.email}`} className="hover:text-[#14532d] hover:underline">
                      {schoolInfo.email}
                    </a>
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Alternative: <a href={`mailto:${schoolInfo.secondaryEmail}`} className="font-mono text-stone-800 hover:underline">{schoolInfo.secondaryEmail}</a>
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    Inquiries regarding student transcripts, terminal results verification, and admissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Telephone & Office Hours */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Telephone Secretariat
                  </span>
                  <h4 className="text-base font-bold text-stone-900 mt-1">
                    <a href={`tel:${schoolInfo.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#14532d] hover:underline">
                      {schoolInfo.phone}
                    </a>
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Mobile/WhatsApp Desk: <a href={`tel:${schoolInfo.secondaryPhone.replace(/[^0-9+]/g, '')}`} className="font-mono text-stone-800 hover:underline">{schoolInfo.secondaryPhone}</a>
                  </p>
                  
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Office Hours: {schoolInfo.officeHours || 'Mon to Fri (7:30 AM to 4:30 PM GMT)'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Direct Secretariat Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-7 sm:p-9 border border-stone-200 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-stone-900">
                  Send an Inquiry to the Administration
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Our administrative secretariat responds within 24 to 48 hours.
                </p>
              </div>
              <SchoolCrest size="sm" />
            </div>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-heading text-lg font-bold">Message Dispatched Successfully</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for reaching out to Ghanata Senior High School. The registrar's desk has received your note and will be in contact shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mr. Emmanuel Abbey"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] bg-stone-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. e.abbey@gmail.com"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Subject Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] bg-stone-50/50"
                  >
                    <option value="Admissions & Results Inquiry">Student Results & Terminal Transcripts</option>
                    <option value="WASSCE Verification">WASSCE Verification for Universities</option>
                    <option value="General Admission">Form 1 CSSPS Admissions</option>
                    <option value="Old Ghanatans Association">Old Ghanatans Association (OGA) Affairs</option>
                    <option value="Headmaster Office">Direct Headmaster's Registry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Message / Inquiry
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your request, student index number, or message for the administration here..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] bg-stone-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-yellow-300" />
                  <span>Transmit Official Message</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
