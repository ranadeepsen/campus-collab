"use client";

import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, ShieldCheck, ShieldAlert, Award, Building2, LogOut, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';

export default function DashboardClient({ adminRole }) {
  const { signOut } = useClerk();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const NavItem = ({ href, icon: Icon, label }) => (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#5D22D7]/10 hover:text-[#5D22D7] rounded-xl font-medium transition-colors">
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-4 py-2">
          <ShieldAlert className="w-6 h-6 text-[#5D22D7]" />
          <span className="font-bold text-xl text-gray-900">Admin Panel</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overview</div>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-[#5D22D7] text-white rounded-xl font-medium shadow-sm">
            <BarChart3 className="w-5 h-5" /> Dashboard
          </Link>
          <NavItem href="/admin/queue" icon={Clock} label="Verification Queue" />
          
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Management</div>
          <NavItem href="/admin/users" icon={Users} label="Users" />
          <NavItem href="/admin/colleges" icon={Building2} label="Colleges" />
          <NavItem href="/admin/reports" icon={ShieldAlert} label="Reports" />
          <NavItem href="/admin/points" icon={Award} label="Points Ledger" />
          
          {adminRole === 'super-admin' && (
            <>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">System</div>
              <NavItem href="/admin/settings" icon={ShieldCheck} label="Admins" />
            </>
          )}
        </nav>

        <button 
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex items-center gap-2 px-4 py-3 mt-auto text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics Overview</h1>
            <p className="text-gray-500 text-sm">A quick glance at Campus Collab's metrics.</p>
          </div>

          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
            </div>
          ) : !stats ? (
            <div className="text-center p-20 text-gray-500 bg-white rounded-2xl border border-gray-100">Failed to load statistics.</div>
          ) : (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 font-bold text-sm">Total Users</p>
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Users className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mt-4">{stats.users.total}</h3>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 font-bold text-sm">Verified Accounts</p>
                    <div className="bg-green-50 text-green-600 p-2 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mt-4">{stats.users.verified}</h3>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(stats.users.verified / stats.users.total) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 font-bold text-sm">Pending Verification</p>
                    <div className="bg-amber-50 text-amber-600 p-2 rounded-lg"><Clock className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mt-4">{stats.users.pending}</h3>
                  <Link href="/admin/queue" className="text-xs font-bold text-[#5D22D7] mt-3 flex items-center gap-1 hover:underline">
                    View Queue <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 font-bold text-sm">Active Ambassadors</p>
                    <div className="bg-yellow-50 text-yellow-600 p-2 rounded-lg"><Award className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mt-4">{stats.ambassadors}</h3>
                </div>
              </div>

              {/* Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Top 10 Colleges</h3>
                    <p className="text-xs text-gray-500 mt-1">Colleges with the most registered users.</p>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {stats.topColleges.map((college, idx) => (
                      <li key={college._id} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                          <span className="font-bold text-gray-900 text-sm">{college.name}</span>
                        </div>
                        <span className="bg-[#5D22D7]/10 text-[#5D22D7] font-bold text-xs px-2.5 py-1 rounded-md">{college.count} users</span>
                      </li>
                    ))}
                    {stats.topColleges.length === 0 && <li className="p-8 text-center text-gray-500 text-sm">No data available.</li>}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Recent Post Activity</h3>
                    <p className="text-xs text-gray-500 mt-1">Posts created per day (Last 30 days).</p>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-end">
                    <div className="flex items-end gap-1 h-40">
                      {stats.postsPerDay.map((day, idx) => {
                        const maxCount = Math.max(...stats.postsPerDay.map(d => d.count), 1);
                        const heightPercent = (day.count / maxCount) * 100;
                        return (
                          <div key={day._id} className="flex-1 bg-[#5D22D7]/10 hover:bg-[#5D22D7] rounded-t-sm transition-colors group relative" style={{ height: `${heightPercent}%`, minHeight: '4px' }}>
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                              {day._id}: {day.count} posts
                            </div>
                          </div>
                        );
                      })}
                      {stats.postsPerDay.length === 0 && <div className="w-full text-center text-gray-500 text-sm self-center">No posts in the last 30 days.</div>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
