"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Sidebar from "../components/Sidebar";

export default function RootLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/user');
      const data = await res.json();
      
      if (res.ok && data.user) {
        // If user is admin, redirect to admin page
        if (data.user.isAdmin) {
          router.replace('/admin');
          return;
        }
        setUser(data.user);
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not loaded or is admin, don't render the dashboard
  if (!user || user.isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen overflow-hidden lg:pl-[300px] lg:justify-end">
      <Sidebar />
      <div className="w-full bg-zinc-50">
        <nav className="py-4 flex items-center justify-between border-b-[1px] border-zinc-200 px-4 lg:px-10 bg-white">
          <ul className="flex items-center gap-5">
            <li>
              <Link href={"/dashboard"} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Batches
              </Link>
            </li>
            <li>
              <Link href={"/dashboard"} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Notifications
              </Link>
            </li>
          </ul>
          {user && (
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
                <Link href="/profile">
                  {user.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                </Link>
              </div>
              <Link 
                href="/profile" 
                className="hidden lg:block text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {user.name}
              </Link>
            </div>
          )}
        </nav>
        <div className="">{children}</div>
      </div>
    </div>
  );
}
