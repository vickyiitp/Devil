
export interface Faq {
    question: string;
    answer: string;
    category: 'Pricing' | 'Delivery' | 'Licensing' | 'General';
}

export const faqs: Faq[] = [
    {
        question: "Do you negotiate on pricing?",
        answer: "My standard rates are based on the complexity and value of the work. However, I offer custom quotes for large projects and bundle pricing for multiple products or services. Please use the 'Request a Quote' form to discuss your specific needs.",
        category: 'Pricing',
    },
    {
        question: "What are your payment terms?",
        answer: "For most projects, my standard payment term is 30% upfront to secure the booking, with milestone payments throughout the project, and the final payment upon completion and before final delivery of source code or assets.",
        category: 'Pricing',
    },
    {
        question: "How long does a typical project take to deliver?",
        answer: "Delivery timelines depend heavily on the project scope. A small custom tool might take 1-2 weeks, while a full-stack application could take 4-8 weeks or more. I provide a detailed timeline estimate in every project proposal.",
        category: 'Delivery',
    },
    {
        question: "How do revisions work?",
        answer: "Each project proposal includes a set number of revision rounds (typically two) at key stages. Additional revisions beyond what's agreed upon may be subject to an additional fee, which will be discussed and approved by you beforehand.",
        category: 'Delivery',
    },
    {
        question: "Do you sign Non-Disclosure Agreements (NDAs)?",
        answer: "Absolutely. I am happy to sign an NDA to protect your project's confidentiality before we dive into any sensitive details. Simply provide your standard agreement, and I will review it promptly.",
        category: 'General',
    },
    {
        question: "Are source code licenses transferable?",
        answer: "It depends on the license type purchased. 'Developer' licenses are non-transferable. 'Commercial' and 'Enterprise' licenses may have transfer rights, which are clearly outlined in the license agreement. I can also facilitate transfers via an escrow service for added security.",
        category: 'Licensing',
    }
];
