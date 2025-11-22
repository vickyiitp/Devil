import React from 'react';
import { SectionHeader } from '../components/shared/SectionHeader';
import { aboutData } from '../data/aboutData';
import { DownloadIcon } from '../assets/icons';

const ResumePage: React.FC = () => {
    return (
        <div className="pt-24 pb-12">
            <SectionHeader title="Resumes" subtitle="Download my resumes and CVs" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-lg border border-devil-gray bg-transparent">
                        <h3 className="text-lg font-semibold">One-Page Resume</h3>
                        <p className="text-sm text-neutral-400 mt-2">A concise summary for quick reviews.</p>
                        <a href={aboutData.resumeUrls.onePage} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-devil-red/10 text-devil-red font-bold hover:bg-devil-red hover:text-white transition-colors">
                            <DownloadIcon className="w-4 h-4" /> Download One-Page
                        </a>
                    </div>

                    <div className="p-6 rounded-lg border border-devil-gray bg-transparent">
                        <h3 className="text-lg font-semibold">Full CV</h3>
                        <p className="text-sm text-neutral-400 mt-2">The complete curriculum vitae with all details.</p>
                        <a href={aboutData.resumeUrls.full} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-devil-gray text-white font-bold hover:bg-gray-700 transition-colors">
                            <DownloadIcon className="w-4 h-4" /> Download Full CV
                        </a>
                    </div>

                    <div className="p-6 rounded-lg border border-devil-gray bg-transparent">
                        <h3 className="text-lg font-semibold">Technical Resume</h3>
                        <p className="text-sm text-neutral-400 mt-2">Focused on tech skills, projects, and stack.</p>
                        <a href={aboutData.resumeUrls.technical} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/6 text-white font-bold hover:bg-white/10 transition-colors">
                            <DownloadIcon className="w-4 h-4" /> Download Technical
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumePage;
