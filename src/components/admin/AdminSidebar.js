"use client";

import { useState } from 'react';
import { BarChart3, Users, Clock, ShieldCheck, ShieldAlert, Award, Building2, LogOut, Menu, X, Flag, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

const NavItem = ({ href, icon: Icon, label, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
        isActive 
          ? 'bg-[#5D22D7] text-white shadow-sm' 
          : 'text-gray-700 hover:bg-[#5D22D7]/10 hover:text-[#5D22D7]'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
};

export default function AdminSidebar({ adminRole }) {
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#5D22D7]" />
          <span className="font-bold text-xl text-gray-900">Admin Panel</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-4 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden md:flex items-center gap-2 mb-8 px-4 py-2">
          <ShieldAlert className="w-6 h-6 text-[#5D22D7]" />
          <span className="font-bold text-xl text-gray-900">Admin Panel</span>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2 md:mt-0">Overview</div>
          <NavItem href="/admin" icon={BarChart3} label="Dashboard" onClick={closeSidebar} />
          <NavItem href="/admin/queue" icon={Clock} label="Verification Queue" onClick={closeSidebar} />
          
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-6">Management</div>
          <NavItem href="/admin/users" icon={Users} label="Users" onClick={closeSidebar} />
          <NavItem href="/admin/colleges" icon={Building2} label="Colleges" onClick={closeSidebar} />
          <NavItem href="/admin/clubs" icon={ShieldCheck} label="Clubs" onClick={closeSidebar} />
          <NavItem href="/admin/ambassadors" icon={Award} label="Ambassadors" onClick={closeSidebar} />
          <NavItem href="/admin/reports" icon={Flag} label="Reports" onClick={closeSidebar} />
          <NavItem href="/admin/points" icon={Award} label="Points Ledger" onClick={closeSidebar} />
          
          {adminRole === 'super-admin' && (
            <>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-6">System</div>
              <NavItem href="/admin/settings" icon={ShieldCheck} label="Admins" onClick={closeSidebar} />
            </>
          )}
        </nav>

        <button 
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex items-center gap-2 px-4 py-3 mt-auto text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </>
  );
}
