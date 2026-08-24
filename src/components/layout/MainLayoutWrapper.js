"use client";

import { usePathname } from 'next/navigation';
import RightSidebar from './RightSidebar';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function MainLayoutWrapper({ children, isRightSidebarOpen, setIsRightSidebarOpen }) {
  const pathname = usePathname();
  
  const hideOnRoutes = ['/hub', '/events', '/mentors', '/messages', '/saved'];
  const shouldHide = hideOnRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));

  // Close sidebar when pathname changes (navigation)
  useEffect(() => {
    setIsRightSidebarOpen(false);
  }, [pathname, setIsRightSidebarOpen]);

  return (
    <>
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

      {/* Mobile Drawer Overlay */}
      {!shouldHide && isRightSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsRightSidebarOpen(false)}
        />
      )}

      {/* Mobile Right Sidebar Drawer */}
      {!shouldHide && (
        <div 
          className={`fixed top-0 right-0 h-full w-[300px] bg-white/80 backdrop-blur-2xl z-[70] transform transition-transform duration-300 ease-in-out lg:hidden shadow-[0_8px_32px_rgba(124,58,237,0.15)] border-l border-white/50 ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-full overflow-y-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900 text-lg">Explore</h2>
              <button 
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <RightSidebar />
          </div>
        </div>
      )}
    </>
  );
}
