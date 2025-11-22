
import React, { useState } from 'react';
import { SectionHeader } from '../components/shared/SectionHeader';
import { cmsApi } from '../api/cms';
import { SocialWall } from '../components/shared/SocialWall';
import { sendContactMessage } from '../api/contact';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState<{ 
        name: string; 
        email: string; 
        company?: string;
        phone?: string;
        service?: string; 
        project_type?: string; 
        budget?: string;
        timeline?: string;
        priority?: string;
        technical_requirements?: string;
        message: string;
    }>({ name: '', email: '', message: '' });
    const [services, setServices] = useState<string[]>([]);
    const [projectTypes] = useState<string[]>([
        'AI/ML Development',
        'Agentic AI System',
        'Full-Stack Web App',
        'API Development',
        'Cybersecurity Tool',
        'Cloud Infrastructure',
        'Code Audit & Review',
        'Bug Fix & Maintenance',
        'Technical Consultation',
        'Other'
    ]);
    const [budgets] = useState<string[]>(['< $1,000', '$1,000 - $5,000', '$5,000 - $20,000', '$20,000 - $50,000', '> $50,000']);
    const [timelines] = useState<string[]>(['ASAP (1-2 weeks)', '1 Month', '2-3 Months', '3-6 Months', 'Flexible']);
    const [priorities] = useState<string[]>(['Urgent', 'High', 'Medium', 'Low']);
    const [errors, setErrors] = useState({ email: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'email') {
            setErrors({ email: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- Validation ---
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: 'Please enter a valid email address.' });
            return;
        }
        setErrors({ email: '' });
        
        setStatus('submitting');
        setFeedbackMessage('');

        try {
            const response = await sendContactMessage(formData);
            setStatus('success');
            setFeedbackMessage(response.message || 'Thank you for your message! I will get back to you shortly.');
            setFormData({ name: '', email: '', message: '', company: '', phone: '', service: '', project_type: '', budget: '', timeline: '', priority: '', technical_requirements: '' });

        } catch (error) {
            setStatus('error');
            setFeedbackMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
            console.error(error);
        }
    };

    React.useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await cmsApi.getServices({ active_only: true });
                setServices(data.map(s => s.title));
            } catch (err) {
                console.error('Failed to load services:', err);
            }
        };
        loadServices();
    }, []);

    return (
        <div className="pt-24 pb-12">
            <SectionHeader title="Contact" subtitle="Let's Build Something Demonic" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-8 glassmorphic rounded-lg">
                        <h3 className="text-2xl font-bold text-devil-red mb-2">Let's Discuss Your Project</h3>
                        <p className="text-sm text-gray-400 mb-6">Fill out the form below and I'll get back to you within 24 hours</p>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                                    <input type="text" name="name" id="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                                    <input type="email" name="email" id="email" required placeholder="john@company.com" value={formData.email} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all" />
                                    {errors.email && <p className="mt-2 text-sm text-devil-red">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">Company/Organization</label>
                                    <input type="text" name="company" id="company" placeholder="Your Company" value={formData.company || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                    <input type="tel" name="phone" id="phone" placeholder="+1 (555) 000-0000" value={formData.phone || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all" />
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="border-t border-gray-700 pt-5 mt-5">
                                <h4 className="text-lg font-semibold text-neon-gold mb-4">Project Details</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="project_type" className="block text-sm font-medium text-gray-300 mb-2">What do you need?</label>
                                        <select name="project_type" id="project_type" value={formData.project_type || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all">
                                            <option value="">Select project type...</option>
                                            {projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">Interested Service</label>
                                        <select name="service" id="service" value={formData.service || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all">
                                            <option value="">Select a service...</option>
                                            {services.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">Budget Range</label>
                                            <select name="budget" id="budget" value={formData.budget || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all">
                                                <option value="">Select budget...</option>
                                                {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
                                            <select name="timeline" id="timeline" value={formData.timeline || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all">
                                                <option value="">When needed...</option>
                                                {timelines.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                                            <select name="priority" id="priority" value={formData.priority || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all">
                                                <option value="">Select priority...</option>
                                                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="technical_requirements" className="block text-sm font-medium text-gray-300 mb-2">Technical Requirements (Optional)</label>
                                        <textarea name="technical_requirements" id="technical_requirements" rows={3} placeholder="e.g., Python, React, AWS, PostgreSQL..." value={formData.technical_requirements || ''} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all"></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Project Description *</label>
                                <textarea name="message" id="message" rows={5} required placeholder="Tell me about your project, goals, challenges, and any other relevant details..." value={formData.message} onChange={handleChange} className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-devil-red focus:border-devil-red transition-all"></textarea>
                            </div>
                            <button type="submit" disabled={status === 'submitting'} className="w-full px-6 py-3 text-lg font-bold text-white bg-devil-red hover:bg-devil-red-dark border border-devil-red rounded-md shadow-lg shadow-neon-red-soft transition-all duration-300 transform hover:scale-105 disabled:bg-devil-red/50 disabled:cursor-not-allowed">
                                {status === 'submitting' ? 'Sending...' : 'Send'}
                            </button>
                             {feedbackMessage && (
                                <p className={`mt-4 text-center text-sm ${status === 'error' ? 'text-devil-red' : 'text-green-400'}`}>
                                    {feedbackMessage}
                                </p>
                            )}
                        </form>
                    </div>
                    <div className="space-y-8">
                        <div className="p-8 glassmorphic rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-devil-red">Book a Meeting</h3>
                            <p className="mt-4 text-gray-300">Schedule a direct consultation to discuss your project in detail.</p>
                            <a href="#" className="inline-block mt-6 px-6 py-3 text-lg font-bold text-devil-red bg-transparent hover:bg-devil-red hover:text-white border-2 border-devil-red rounded-md transition-all duration-300">
                                Open Calendar
                            </a>
                        </div>
                         <div className="p-8 glassmorphic rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-devil-red">Connect</h3>
                            <p className="mt-4 text-gray-300">Follow my work and connect on social media.</p>
                             <div className="mt-6 flex justify-center">
                                <SocialWall />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;