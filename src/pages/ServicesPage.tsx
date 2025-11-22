
import React from 'react';
import { SectionHeader } from '../components/shared/SectionHeader';
import { Service } from '../types';
import { useServices } from '../hooks/useCMS';
import { faqs } from '../data/faqs';
import { NavLink } from 'react-router-dom';
import { Accordion, AccordionItem } from '../components/faq/Accordion';
import { AiIcon, ApiIcon, AppIcon, WebDevIcon, SearchIcon, CodeIcon } from '../assets/icons';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    AiIcon,
    ApiIcon,
    AppIcon,
    WebDevIcon,
    SearchIcon,
    CodeIcon,
};

const FaqJsonLd = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
};

const ServicesPage: React.FC = () => {
    const { services, loading, error } = useServices();
    
    const renderServices = () => {
        if (loading) return <div className="text-center p-12 text-neutral-400">Loading services...</div>;
        if (error) return <div className="text-center p-12 text-red-400">Error loading services: {error.message}</div>;
        if (services.length === 0) return <div className="text-center p-12 text-neutral-400">No services are currently offered.</div>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => {
                    const Icon = service.icon && typeof service.icon === 'string' ? iconMap[service.icon] || CodeIcon : CodeIcon;
                    
                    // Parse JSON strings
                    const features = service.features ? JSON.parse(service.features) : [];
                    const price = service.price || 0;
                    
                    return (
                        <div key={service.id} className="flex flex-col p-8 glassmorphic rounded-lg border border-devil-gray hover:border-devil-red transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex-shrink-0">
                                <Icon className="h-12 w-12 text-devil-red" />
                                <h3 className="mt-4 text-2xl font-bold text-devil-light">{service.title}</h3>
                                <p className="mt-2 text-gray-400">{service.description}</p>
                            </div>
                            <div className="flex-grow mt-6">
                                <ul className="space-y-2 text-gray-300">
                                    {features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start">
                                            <span className="text-devil-red mr-2 mt-1">&#10003;</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm text-gray-400">Starting from</p>
                                <p className="text-3xl font-bold text-white">${price}</p>
                                <NavLink to="/contact" className="block w-full text-center mt-6 px-4 py-2 text-sm font-bold text-devil-red bg-devil-red/10 hover:bg-devil-red hover:text-white border border-devil-red rounded-md transition-all duration-300">
                                    Request a Quote
                                </NavLink>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <>
            <FaqJsonLd />
            <div className="pt-24 pb-12">
                <SectionHeader title="Services" subtitle="Building Elite Digital Solutions" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    {renderServices()}
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                    <SectionHeader title="Frequently Asked Questions" subtitle="Clarity on Collaboration" />
                    <div className="max-w-3xl mx-auto mt-12">
                        <Accordion>
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} title={faq.question}>
                                    <p className="text-neutral-300">{faq.answer}</p>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServicesPage;
