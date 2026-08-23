"use client";

import { usePathname } from 'next/navigation';
import RightSidebar from './RightSidebar';

export default function MainLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  const hideOnRoutes = ['/hub', '/events', '/mentors', '/messages', '/saved'];
  const shouldHide = hideOnRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));

  return (
    <div className={`grid grid-cols-1 ${shouldHide ? '' : 'lg:grid-cols-[1fr_330px]'} gap-6 items-start pb-16 md:pb-8`}>
      <main className="min-w-0">
        {children}
      </main>

      {!shouldHide && (
        <aside className="hidden lg:block w-[330px] shrink-0">
          <div className="sticky top-6">
            <RightSidebar />
          </div>
        </aside>
      )}
    </div>
  );
}

