import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BriefHistory } from './components/BriefHistory';
import { VisionMissionMotto } from './components/VisionMissionMotto';
import { FounderSection } from './components/FounderSection';
import { HeadTeacherSection } from './components/HeadTeacherSection';
import { ContactInfoSection } from './components/ContactInfoSection';
import { ResultsChecker } from './components/ResultsChecker';
import { PtaPage } from './components/PtaPage';
import { TeacherPortal } from './components/TeacherPortal';
import { DeveloperPortal } from './components/DeveloperPortal';
import { AcademicsSection } from './components/AcademicsSection';
import { Footer } from './components/Footer';

const MainContent: React.FC = () => {
  const { activeTab } = useSchool();

  return (
    <main className="min-h-screen flex flex-col justify-between pb-16 md:pb-0">
      <div>
        {activeTab === 'home' && (
          <>
            <Hero />
            <VisionMissionMotto />
            <BriefHistory />
            <FounderSection />
            <HeadTeacherSection />
            <AcademicsSection />
            <ContactInfoSection />
          </>
        )}

        {activeTab === 'results' && <ResultsChecker />}

        {activeTab === 'pta' && <PtaPage />}

        {activeTab === 'teacher' && <TeacherPortal />}

        {activeTab === 'developer' && <DeveloperPortal />}

        {activeTab === 'academics' && <AcademicsSection />}

        {activeTab === 'history' && (
          <>
            <BriefHistory />
            <FounderSection />
          </>
        )}

        {activeTab === 'contact' && <ContactInfoSection />}
      </div>

      <Footer />
    </main>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
        <Navbar />
        <MainContent />
      </div>
    </SchoolProvider>
  );
}
