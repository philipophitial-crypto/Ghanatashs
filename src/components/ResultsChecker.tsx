import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolCrest } from './SchoolCrest';
import { 
  Search, 
  Printer, 
  Download, 
  Share2, 
  Award, 
  CheckCircle2, 
  Calendar, 
  User, 
  BookOpen, 
  FileText, 
  Filter, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  QrCode,
  FileSpreadsheet
} from 'lucide-react';
import { StudentResult, ProgramType } from '../types';
import { COURSE_CONFIGS } from '../data/defaultData';

export const ResultsChecker: React.FC = () => {
  const { students, schoolInfo, headTeacher, activeResultStudentId, setActiveResultStudentId, setActiveTab } = useSchool();
  const [searchInput, setSearchInput] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedTerm, setSelectedTerm] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize selected student only when activeResultStudentId changes
  useEffect(() => {
    if (activeResultStudentId) {
      const found = students.find(s => s.id === activeResultStudentId);
      if (found) {
        setSelectedStudent(found);
        setSearchInput(found.indexNumber);
      }
    }
  }, [activeResultStudentId, students]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) {
      showNotify('Please enter a valid student index number or name.');
      return;
    }

    const match = students.find(s => 
      s.indexNumber.toUpperCase() === query || 
      s.indexNumber.replace(/\//g, '-').toUpperCase() === query ||
      s.studentName.toUpperCase().includes(query)
    );

    if (match) {
      setSelectedStudent(match);
      setActiveResultStudentId(match.id);
      showNotify(`Loaded official result for ${match.studentName}`);
    } else {
      showNotify(`No matching record found for "${searchInput}". Please check spelling or test a sample record.`);
    }
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Live reactive active student record derived from SchoolContext state
  const activeStudent = selectedStudent
    ? (students.find(s => s.id === selectedStudent.id) || selectedStudent)
    : null;

  const downloadPdfResult = async () => {
    if (!activeStudent) return;
    const element = document.getElementById('official-report-card');
    if (!element) return;

    try {
      setIsDownloading(true);
      showNotify('Generating official high-definition PDF result document...');
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const cleanName = activeStudent.studentName.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanIndex = activeStudent.indexNumber.replace(/[^a-zA-Z0-9]/g, '-');
      pdf.save(`Ghanata_SHS_${cleanName}_${cleanIndex}_Terminal_Result.pdf`);
      showNotify(`Successfully downloaded PDF result slip for ${activeStudent.studentName}!`);
    } catch (err) {
      console.error('PDF generation error:', err);
      showNotify('PDF generation fallback: Click "Print Official Result Slip" and select "Save as PDF".');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadImageResult = async () => {
    if (!activeStudent) return;
    const element = document.getElementById('official-report-card');
    if (!element) return;

    try {
      setIsDownloading(true);
      showNotify('Generating high-resolution PNG image of result slip...');
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanName = activeStudent.studentName.replace(/[^a-zA-Z0-9]/g, '_');
      link.href = image;
      link.download = `Ghanata_SHS_${cleanName}_Result_Slip.png`;
      link.click();
      showNotify(`Downloaded PNG result slip image for ${activeStudent.studentName}!`);
    } catch (err) {
      console.error('Image generation error:', err);
      showNotify('Image export error. Please try downloading PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadCsvResult = () => {
    if (!activeStudent) return;
    const s = activeStudent;
    const lines = [
      `GHANATA SENIOR HIGH SCHOOL - OFFICIAL TERMINAL REPORT CARD`,
      `Student Name,${s.studentName}`,
      `Index Number,${s.indexNumber}`,
      `Course / Program,${s.program}`,
      `Class / Form,${s.classForm}`,
      `Academic Year,${s.academicYear}`,
      `Term / Semester,${s.term}`,
      `House,${s.house}`,
      `Position in Class,${s.positionInClass} out of ${s.totalStudentsInClass}`,
      `Best 6 Aggregate,${s.aggregate}`,
      `GPA,${s.gpa.toFixed(2)}`,
      `Conduct Remarks,${s.conductRemarks}`,
      `Headteacher Remarks,${s.headTeacherRemarks}`,
      ``,
      `SUBJECT BREAKDOWN`,
      `Subject Name,Type,Midsem (/20),Portfolio (/10),Individual Proj (/10),Group Proj (/10),Exam Score (/50),Total Score (/100),Grade,Remark`
    ];

    s.subjects.forEach(sub => {
      lines.push(
        `"${sub.name}",${sub.isCore ? 'CORE' : 'ELECTIVE'},${sub.midsemScore || 0},${sub.portfolioScore || 0},${sub.individualProjectScore || 0},${sub.groupProjectScore || 0},${sub.examScore},${sub.totalScore},${sub.grade},"${sub.interpretation}"`
      );
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    const cleanName = s.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Ghanata_SHS_${cleanName}_Result.csv`;
    link.click();
    showNotify(`Downloaded CSV result data for ${s.studentName}!`);
  };

  const filteredStudentsList = students.filter(s => {
    if (selectedProgram !== 'All' && s.program !== selectedProgram) return false;
    if (selectedClass !== 'All' && s.classForm !== selectedClass) return false;
    if (selectedTerm !== 'All' && s.term !== selectedTerm) return false;
    if (selectedYear !== 'All' && s.academicYear !== selectedYear) return false;
    return true;
  });

  // Calculate overall student performance statistics
  const coreSubjects = activeStudent?.subjects.filter(s => s.isCore) || [];
  const electiveSubjects = activeStudent?.subjects.filter(s => !s.isCore) || [];
  const totalScoreSum = activeStudent?.subjects.reduce((acc, curr) => acc + curr.totalScore, 0) || 0;
  const averageScore = activeStudent && activeStudent.subjects.length > 0
    ? (totalScoreSum / activeStudent.subjects.length).toFixed(1)
    : '0';

  // Available classes for dropdown
  const availableClasses = selectedProgram !== 'All' && COURSE_CONFIGS[selectedProgram as ProgramType]
    ? COURSE_CONFIGS[selectedProgram as ProgramType].classes
    : Object.values(COURSE_CONFIGS).flatMap(c => c.classes);

  return (
    <div className="py-12 bg-stone-100/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Top Heading Banner (Hidden when printing) */}
        <div className="no-print bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-900 uppercase tracking-widest bg-yellow-100 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-700" />
              <span>Official GES Terminal & WASSCE Grading System</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#14532d] tracking-tight">
              Student Results & Grades Portal
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm">
              Displays student terminal and WASSCE results in official grades (A1 to F9) inputted by teachers across all 6 courses and 39 classes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('teacher')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-stone-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Teacher Mode (Input Marks)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Developer Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </button>
            <button
              onClick={handlePrint}
              disabled={!selectedStudent}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-yellow-300" />
              <span>Print Official Result Slip</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar (Hidden when printing) */}
        <div className="no-print bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Index Number Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Student Index Number (e.g. GHS/2024/001) or Name..."
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] bg-stone-50"
              />
            </div>

            {/* Program Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedProgram}
                onChange={(e) => {
                  setSelectedProgram(e.target.value);
                  setSelectedClass('All');
                }}
                className="w-full px-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-stone-50 font-medium"
              >
                <option value="All">All Courses (6 Courses)</option>
                <option value="General Art">General Art (GArt 1 - 15)</option>
                <option value="Visual Art">Visual Art (V Art 1 - 5)</option>
                <option value="Business">Business (B1 - B5)</option>
                <option value="Home Economics">Home Economics (H1 - H5)</option>
                <option value="Agric">Agric (Agric 1 - 3)</option>
                <option value="Science">Science (Science 1 - 6)</option>
              </select>
            </div>

            {/* Class Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#14532d] bg-stone-50 font-medium"
              >
                <option value="All">All Classes</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Search Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#14532d] hover:bg-[#0b331c] text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4 text-yellow-300" />
                <span>Fetch Result</span>
              </button>
            </div>

          </form>

          {/* Toast Notification */}
          {notification && (
            <div className="text-xs text-yellow-950 bg-yellow-50 border border-yellow-300 p-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Security / Index Required Notice */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-[#14532d] shrink-0" />
            <span>Students and parents must enter their official Index Number (e.g. GHS/2024/001) above to access terminal results.</span>
          </div>
        </div>

        {/* OFFICIAL RESULT SLIP / TERMINAL REPORT CARD */}
        {activeStudent ? (
          <div className="space-y-4">
            
            {/* Quick Print & Download Action Bar (Hidden when printing) */}
            <div className="no-print bg-stone-900 text-white rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/20 rounded-lg text-yellow-400 border border-yellow-400/30">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Result Actions: {activeStudent.studentName}</span>
                    <span className="font-mono text-xs text-yellow-300">({activeStudent.indexNumber})</span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Download official high-definition PDF, high-res PNG image, CSV raw data, or print directly.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadPdfResult}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Download result slip as PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={downloadImageResult}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg border border-stone-700 transition-colors cursor-pointer disabled:opacity-50"
                  title="Download result slip as PNG Image"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Image (PNG)</span>
                </button>

                <button
                  onClick={downloadCsvResult}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg border border-stone-700 transition-colors cursor-pointer"
                  title="Download raw student marks as CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Download CSV</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer ring-1 ring-yellow-400/50"
                >
                  <Printer className="w-4 h-4 text-yellow-300" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>

            {/* Official Report Slip Card */}
            <div id="official-report-card" className="print-container bg-white rounded-2xl shadow-xl border-2 border-stone-300 p-6 sm:p-10 max-w-5xl mx-auto print:border print:border-black print:shadow-none print:p-6">
              
              {/* Header: Institutional & Crest Banner */}
              <div className="border-b-2 border-[#14532d] pb-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-shrink-0">
                    <SchoolCrest size="lg" />
                  </div>

                <div className="text-center flex-1">
                  <div className="text-xs font-bold text-stone-600 uppercase tracking-widest">
                    GHANA EDUCATION SERVICE · GREATER ACCRA REGION
                  </div>
                  <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-[#14532d] tracking-tight uppercase mt-1">
                    GHANATA SENIOR HIGH SCHOOL
                  </h2>
                  <p className="text-xs sm:text-sm font-serif font-bold text-yellow-800">
                    P.O. Box 4, Dodowa, Greater Accra Region, Ghana · Email: {schoolInfo.email}
                  </p>
                  <p className="text-xs italic font-serif text-stone-600 mt-0.5">
                    Motto: "{schoolInfo.mottoLatin}" ({schoolInfo.mottoEnglish}) · Established 1936
                  </p>
                  <div className="inline-block mt-2 px-4 py-0.5 bg-[#14532d] text-yellow-300 font-heading font-bold text-xs uppercase tracking-wider rounded">
                    OFFICIAL TERMINAL REPORT & PERFORMANCE SHEET
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-center justify-center p-2 border border-stone-300 rounded-lg bg-stone-50 text-[10px] text-stone-500 font-mono">
                  <QrCode className="w-12 h-12 text-stone-800" />
                  <span className="mt-1">GES-VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Student Biodata Summary Grid */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                
                {/* Student Photo */}
                <div className="sm:col-span-3 flex justify-center sm:justify-start">
                  <div className="w-28 h-32 rounded-lg overflow-hidden border-2 border-[#14532d] shadow-xs bg-stone-200 flex-shrink-0 flex items-center justify-center">
                    {activeStudent.photoUrl && activeStudent.photoUrl.trim() !== '' ? (
                      <img
                        src={activeStudent.photoUrl}
                        alt={activeStudent.studentName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-stone-400 text-[10px] text-center p-2 font-medium">
                        No Photo
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Fields */}
                <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-stone-500 font-medium block">Student Full Name:</span>
                    <span className="font-bold text-stone-900 text-sm">{activeStudent.studentName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">Index Number:</span>
                    <span className="font-bold font-mono text-[#14532d] text-sm">{activeStudent.indexNumber}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">Academic Program:</span>
                    <span className="font-bold text-stone-900">{activeStudent.program}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">Class / Form:</span>
                    <span className="font-bold text-stone-900">{activeStudent.classForm}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">Academic Year & Term:</span>
                    <span className="font-bold text-stone-900">{activeStudent.academicYear} · {activeStudent.term}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">School House:</span>
                    <span className="font-bold text-stone-900">{activeStudent.house}</span>
                  </div>
                  
                  <div>
                    <span className="text-stone-500 font-medium block">Position in Class:</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {activeStudent.positionInClass} <span className="font-normal text-stone-500 text-xs">out of {activeStudent.totalStudentsInClass}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium block">Promotion Status:</span>
                    <span className="font-bold text-emerald-700">
                      {activeStudent.promotedToNextClass ? '✓ Promoted / Good Standing' : 'Repeated'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Core & Elective Subject Marks Table */}
            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-heading text-sm font-bold text-[#14532d] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Subject Performance Breakdown</span>
                  <span className="text-[11px] font-sans text-stone-500 font-normal">
                    Class Work (30%) + Terminal Exam (70%) = Total (100%)
                  </span>
                </h3>

                <div className="overflow-x-auto border border-stone-300 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#14532d] text-yellow-100 font-semibold">
                        <th className="py-2.5 px-3 border-r border-[#15803d]">Subject Name</th>
                        <th className="py-2.5 px-2 text-center border-r border-[#15803d] w-16">Type</th>
                        <th className="py-2.5 px-2 text-center border-r border-[#15803d] w-16">Class (30%)</th>
                        <th className="py-2.5 px-2 text-center border-r border-[#15803d] w-16">Exam (70%)</th>
                        <th className="py-2.5 px-2 text-center border-r border-[#15803d] w-16">Total (100%)</th>
                        <th className="py-2.5 px-2 text-center border-r border-[#15803d] w-14">Grade</th>
                        <th className="py-2.5 px-2 text-center border-r border-[#15803d] w-24">Remark</th>
                        <th className="py-2.5 px-3 hidden sm:table-cell">Tutor Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {activeStudent.subjects.map((subj, index) => {
                        const isEven = index % 2 === 0;
                        const isDistinction = subj.grade === 'A1' || subj.grade === 'B2';
                        return (
                          <tr key={subj.id} className={isEven ? 'bg-white' : 'bg-stone-50/70'}>
                            <td className="py-2 px-3 font-semibold text-stone-900 border-r border-stone-200">
                              {subj.name}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-stone-200 font-mono text-[11px]">
                              {subj.isCore ? (
                                <span className="text-emerald-800 font-bold">CORE</span>
                              ) : (
                                <span className="text-stone-600">ELECT</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-stone-200 font-mono text-stone-700">
                              {subj.classScore}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-stone-200 font-mono text-stone-700">
                              {subj.examScore}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-stone-200 font-mono font-bold text-stone-950">
                              {subj.totalScore}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-stone-200 font-mono font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                isDistinction ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-900'
                              }`}>
                                {subj.grade}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center border-r border-stone-200 font-medium text-stone-700 text-[11px]">
                              {subj.interpretation}
                            </td>
                            <td className="py-2 px-3 text-stone-600 text-xs italic hidden sm:table-cell">
                              {subj.remarks}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Performance Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-4 mb-8 text-center">
              <div className="border-r border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Best 6 Aggregate:</span>
                <span className="text-2xl font-bold font-mono text-[#14532d]">
                  {activeStudent.aggregate}
                </span>
                <span className="text-[10px] text-stone-400 block">(Grade Points)</span>
              </div>
              <div className="sm:border-r border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Grade Point Average:</span>
                <span className="text-2xl font-bold font-mono text-yellow-700">
                  {activeStudent.gpa.toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-400 block">(Scale 4.0)</span>
              </div>
              <div className="border-r border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Average Score:</span>
                <span className="text-2xl font-bold font-mono text-emerald-700">
                  {averageScore}%
                </span>
                <span className="text-[10px] text-stone-400 block">(All Subjects)</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Class Standing:</span>
                <span className="text-2xl font-bold font-mono text-stone-900">
                  {activeStudent.positionInClass}
                </span>
                <span className="text-[10px] text-stone-400 block">Class Rank</span>
              </div>
            </div>

            {/* Remarks & Signatures Section */}
            <div className="space-y-4 mb-8">
              {/* Headteacher Remarks */}
              <div className="bg-yellow-50/60 p-4 rounded-xl border border-yellow-200 text-xs">
                <div className="font-semibold text-stone-900 mb-1 flex items-center justify-between">
                  <span className="text-[#14532d] font-bold">Headteacher's Assessment & Recommendation:</span>
                  <span className="text-stone-500 font-normal font-mono">Date Published: {activeStudent.publishedDate}</span>
                </div>
                <p className="font-serif italic text-stone-800 mb-2">
                  "{activeStudent.headTeacherRemarks}"
                </p>
                <div className="text-[11px] text-stone-600 font-medium">
                  <strong>Student Conduct & Attitude:</strong> {activeStudent.conductRemarks}
                </div>
              </div>
            </div>

            {/* Official Stamps & Signatures */}
            <div className="pt-6 border-t-2 border-stone-300 flex justify-end">
              <div className="text-right flex flex-col items-end">
                <div className="inline-block text-center border-2 border-dashed border-[#14532d] rounded-lg p-2.5 bg-emerald-50/50 mb-2">
                  <div className="text-[10px] font-bold text-[#14532d] tracking-wider uppercase">
                    GHANATA SENIOR HIGH SCHOOL
                  </div>
                  <div className="text-[9px] text-stone-600 font-mono">
                    HEADMASTER'S OFFICIAL STAMP
                  </div>
                  <div className="font-academic text-xs font-bold text-[#14532d] mt-1">
                    {headTeacher.name}
                  </div>
                  <div className="text-[9px] text-stone-500">
                    Dodowa · Greater Accra Region
                  </div>
                </div>
                <span className="text-[11px] font-bold text-stone-500 uppercase">
                  Headteacher's Certified Endorsement
                </span>
              </div>
            </div>

            {/* Slip Footer */}
            <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400">
              This terminal score slip is an authentic academic document issued by the Academic Secretariat of Ghanata Senior High School, Dodowa. Any unauthorized alteration renders it null and void.
            </div>

            </div>

            {/* Bottom Download & Print Action Bar (Hidden when printing) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs max-w-5xl mx-auto">
              <div className="text-xs text-stone-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Result Slip is verified and ready for instant PDF, PNG, or CSV export.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadPdfResult}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Downloading...' : 'Download PDF Result'}</span>
                </button>
                <button
                  onClick={downloadImageResult}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download Image (PNG)</span>
                </button>
                <button
                  onClick={downloadCsvResult}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-yellow-700" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14532d] hover:bg-[#0b331c] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-yellow-300" />
                  <span>Print Result Slip</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No Student Selected</h3>
            <p className="text-xs text-stone-500 mt-1">
              Please enter a student index number in the search bar above or choose one of the sample student records.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
