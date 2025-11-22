
import React from 'react';
import { SectionHeader } from '../components/shared/SectionHeader';

const TermsPage: React.FC = () => {
  return (
    <div className="pt-24 pb-12">
      <SectionHeader title="Terms of Service" subtitle="Last Updated: 2023-10-27" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg text-neutral-300">
          <h2>1. Introduction</h2>
          <p>
            Welcome to vickyiitp.tech ("Site"), owned and operated by Vicky Kumar ("I", "Me", "My"). These Terms of Service ("Terms") govern your use of this Site and the purchase of any digital products, source code, or services ("Products") offered. By accessing the Site or purchasing Products, you agree to be bound by these Terms.
          </p>

          <h2>2. Intellectual Property & Licenses</h2>
          <p>
            All content on this Site, including text, graphics, logos, and software, is my property and is protected by intellectual property laws. When you purchase a Product, you are purchasing a license to use it, not ownership of the Product itself.
          </p>
          <ul>
            <li><strong>Personal/Developer License:</strong> Grants you the right to use the Product for non-commercial, personal projects. You may not resell or redistribute the source code.</li>
            <li><strong>Commercial License:</strong> Grants you the right to use the Product in a single commercial project for one end client or your own business.</li>
            <li><strong>Enterprise License:</strong> Grants broader rights for use across multiple projects or within a large organization. Specific terms are defined in the purchase agreement.</li>
          </ul>
          <p>
            Unauthorized redistribution, resale, or replication of any Product is strictly prohibited and will result in license termination and potential legal action.
          </p>

          <h2>3. Payments and Refunds</h2>
          <p>
            All payments for Products are processed through secure third-party payment gateways. Due to the digital nature of the Products, all sales are final. I do not offer refunds once a Product has been downloaded or accessed, except as required by law. If you encounter a technical issue with a Product, please contact me for support.
          </p>

          <h2>4. Limitation of Liability</h2>
          <p>
            The Products are provided "as is" without any warranty of any kind. I do not guarantee that the Products will be error-free or suitable for every purpose. In no event shall I be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the Products. My total liability to you for any damages will not exceed the amount you paid for the Product.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any disputes arising under these Terms will be resolved in the courts located in Patna, Bihar, India.
          </p>
          
          <h2>6. Changes to Terms</h2>
          <p>
            I reserve the right to modify these Terms at any time. All changes will be posted on this page, and your continued use of the Site or Products after such changes have been posted will constitute your acceptance of the new Terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
