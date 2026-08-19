import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import TopBar from './TopBar';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <div className="max-w-[1400px] mx-auto flex w-full min-h-screen px-4 sm:px-6 lg:px-8 gap-7 py-6">
        
        {/* Left Sidebar - Permanent Application Navigation */}
        <aside className="hidden lg:block w-[260px] shrink-0">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content Area (Header + Center Feed + Right Sidebar) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Top Header */}
          <TopBar />
          
          {/* Main Grid: Feed + Right Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-6 items-start pb-16 md:pb-8">
            {/* Center Feed */}
            <main className="min-w-0">
              {children}
            </main>

            {/* Right Sidebar */}
            <aside className="hidden xl:block w-[330px] shrink-0">
              <div className="sticky top-6">
                <RightSidebar />
              </div>
            </aside>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
