
import React from 'react';
import { SectionHeader } from '../components/shared/SectionHeader';

const PrivacyPage: React.FC = () => {
  return (
    <div className="pt-24 pb-12">
      <SectionHeader title="Privacy Policy" subtitle="Last Updated: 2023-10-27" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg text-neutral-300">
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy describes how Vicky Kumar ("I", "Me", "My") collects, uses, and shares information about you when you use my website vickyiitp.tech ("Site") and my services. Your privacy is important to me.
          </p>

          <h2>2. Information I Collect</h2>
          <p>
            I collect information in the following ways:
          </p>
          <ul>
            <li><strong>Information you provide:</strong> When you fill out the contact form, purchase a product, or otherwise communicate with me, you may provide personal information such as your name, email address, and message content.</li>
            <li><strong>Analytics Data:</strong> I may use third-party analytics services (like Vercel Analytics or Google Analytics) to collect anonymous data about your visit, such as your browser type, device type, and pages visited. This data helps me understand how visitors use the Site and improve it. This data is aggregated and does not personally identify you.</li>
          </ul>

          <h2>3. How I Use Your Information</h2>
          <p>
            I use the information I collect to:
          </p>
          <ul>
            <li>Respond to your inquiries and provide customer support.</li>
            <li>Process transactions and deliver digital products you have purchased.</li>
            <li>Improve and optimize the Site and my product offerings.</li>
            <li>Prevent fraud and ensure the security of the Site.</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>
            I do not sell, trade, or rent your personal information to others. I may share your information with trusted third-party service providers who assist me in operating my website, conducting my business, or servicing you (e.g., payment processors), so long as those parties agree to keep this information confidential.
          </p>
          
          <h2>5. Data Security</h2>
          <p>
            I implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
          </p>
          
          <h2>6. Your Rights</h2>
          <p>
            You have the right to request access to the personal data I hold about you, to request corrections, or to request that I delete your personal data. Please contact me at vickyykumar14@gmail.com to make such a request.
          </p>
          
          <h2>7. Changes to This Policy</h2>
          <p>
            I may update this Privacy Policy from time to time. I will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
