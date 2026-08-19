"use client";

import { Mail, MessageCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light">
        <h1 className="text-2xl font-bold text-text-main mb-2">Help & Support</h1>
        <p className="text-muted">Need help with Campus Collab? Reach out to our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="mailto:support@campuscollab.app"
          className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light hover:border-primary/30 transition-colors flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-text-main mb-1">Email Support</h2>
            <p className="text-sm text-muted">support@campuscollab.app</p>
          </div>
        </a>

        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-text-main mb-1">Community Guidelines</h2>
            <p className="text-sm text-muted">Be respectful, verify your student status, and report inappropriate content from any post menu.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
