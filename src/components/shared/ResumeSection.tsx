
import React, { useCallback, useState } from 'react';
import { aboutData } from '../../data/aboutData';
import { API_URL } from '../../api/cms';
import { DownloadIcon } from '../../assets/icons';
import { SectionHeader } from './SectionHeader';

const resumeVersions = [
  { name: 'One-Page Resume', slug: 'onepage', description: 'A concise summary for quick reviews.', url: aboutData.resumeUrls.onePage, filename: 'Portfolio (1).pdf' },
  { name: 'Full CV', slug: 'full', description: 'The complete curriculum vitae with all details.', url: aboutData.resumeUrls.full, filename: 'full cv.pdf' },
  { name: 'Technical Resume', slug: 'technical', description: 'Focused on tech skills, projects, and stack.', url: aboutData.resumeUrls.technical, filename: 'technical resume.pdf' },
];

export const ResumeSection: React.FC = () => {
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const handleDownload = useCallback(async (slug: string) => {
    try {
      setLoadingSlug(slug);
      const res = await fetch(`${API_URL}/api/resumes/presigned/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch presigned URL');
      const data = await res.json();
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('Invalid URL returned');
      }
    } catch (e) {
      console.error('Download error', e);
      alert('Failed to download the resume. Please try again');
    } finally {
      setLoadingSlug(null);
    }
  }, []);
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Resume"
          subtitle="Vicky Kumar (AI Developer, IIT Patna)"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {resumeVersions.map((resume) => (
            <div
              key={resume.name}
              className="group relative p-6 glassmorphic rounded-lg border border-devil-gray hover:border-devil-red transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-devil-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-devil-light">{resume.name}</h3>
                <p className="text-gray-400 mt-2 text-sm">{resume.description}</p>
                <button
                  onClick={() => handleDownload(resume.slug)}
                  disabled={loadingSlug !== null}
                  className="inline-flex items-center mt-6 px-4 py-2 text-sm font-bold text-devil-red bg-devil-red/10 hover:bg-devil-red hover:text-white border border-devil-red rounded-md transition-all duration-300"
                >
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  {loadingSlug ? (loadingSlug === 'onepage' ? 'Downloading...' : 'Downloading...') : 'Download'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};