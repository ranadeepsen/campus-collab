"use client";

import { Mail, MessageCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const faqs = [
    {
      q: "How do I verify my account?",
      a: "Go to your Settings, click on Edit Profile, and follow the verification process. You can upload your college ID or verify via a university email address."
    },
    {
      q: "How do I become an Ambassador?",
      a: "If you are a verified current student, go to the Mentorship tab and click 'Become an Ambassador' to apply."
    },
    {
      q: "How are Ambassador points awarded?",
      a: "Ambassadors earn base points (+10) for accepting a request. They can also earn up to +20 bonus points if the prospective student leaves a 5-star rating 24 hours later!"
    },
    {
      q: "Can I report inappropriate content?",
      a: "Yes. Every post, club, and event has a report option. Our admins review these reports daily to ensure community guidelines are upheld."
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="bg-[#5D22D7] rounded-3xl p-8 sm:p-10 shadow-sm text-white text-center">
        <HelpCircle className="w-16 h-16 text-white/90 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold mb-3">Help & Support</h1>
        <p className="text-white/80 max-w-xl mx-auto">We're here to help you get the most out of Campus Collab. Browse our FAQs or reach out directly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
            <Mail className="w-6 h-6 text-[#5D22D7]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Contact Us</h2>
          <p className="text-gray-500 mb-6">Have a specific issue not covered in our FAQs? Send us an email and we'll get back to you as soon as possible.</p>
          <a
            href="mailto:placeholder@campuscollab.com"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#5D22D7] hover:bg-[#4C1D95] text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            <Mail className="w-5 h-5" />
            Email Support
          </a>
          <p className="text-xs text-gray-400 mt-3 text-center">We typically reply within 24-48 hours.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Community Guidelines</h2>
          <p className="text-gray-500 mb-6">Campus Collab is a safe space for students. We strictly prohibit harassment, spam, and misinformation.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all border border-gray-200"
          >
            <MessageCircle className="w-5 h-5" />
            Read Full Guidelines
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
