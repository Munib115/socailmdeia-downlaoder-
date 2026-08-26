'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '@/lib/seo';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">Frequently Asked Questions</h2>
        <p className="text-sm text-text-secondary">Answers about supported public videos, formats, privacy, and compatibility.</p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question} className="liquid-glass rounded-2xl overflow-hidden transition-all duration-200">
              <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} className="w-full p-5 text-left flex items-center justify-between gap-4 select-none hover:bg-white/5 transition-colors">
                <span className="text-sm sm:text-base font-bold text-text-primary">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
              </button>
              {isOpen && <div className="px-5 pb-5 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-white/5 pt-3.5 animate-fade-in">{faq.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
