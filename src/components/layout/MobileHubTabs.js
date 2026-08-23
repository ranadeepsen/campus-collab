"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function MobileHubTabs() {
  const pathname = usePathname();
  
  const tabs = [
    { label: 'Students', href: '/hub' },
    { label: 'Events', href: '/events' },
    { label: 'Clubs', href: '/clubs' },
  ];

  return (
    <div className="lg:hidden bg-white px-2 py-3 border-b border-gray-100 mb-4 rounded-xl shadow-sm">
      <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={clsx(
                "flex-1 text-center text-sm py-2 rounded-md transition-all font-semibold",
                isActive 
                  ? "bg-white shadow-sm text-[#5D22D7]" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
