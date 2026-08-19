"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Home, Users, Calendar, MessageSquare, Compass, GraduationCap } from 'lucide-react';
import clsx from 'clsx';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const user_type = user?.publicMetadata?.user_type;

  const allNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Users, label: 'Hub', href: '/hub' },
    { icon: Compass, label: 'Clubs', href: '/clubs' },
    { icon: Calendar, label: 'Events', href: '/events' },
    { icon: MessageSquare, label: 'Chat', href: '/messages' },
  ];

  const navItems = user_type === 'prospective' 
    ? [{ icon: Home, label: 'Home', href: '/' }, { icon: GraduationCap, label: 'Mentors', href: '/mentors' }]
    : allNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-light pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted hover:text-text-main"
              )}
            >
              <item.icon className={clsx("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
