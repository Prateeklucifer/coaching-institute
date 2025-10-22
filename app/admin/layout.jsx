"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { ToastProvider } from "../components/ToastContext";
import AdminPannel from "../components/AdminPannel";
import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from 'next/navigation'


export default function RootLayout({ children }) {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const fetchUser = async(req, res)=>{
    let user = await fetch("/api/auth/user")
    let data = await user.json()
    setUser(data.user.isAdmin)
  }

    // useEffect(() => {
    //   checkAuth();
    // }, []);
  
    // const checkAuth = async () => {
    //   try {
    //     const res = await fetch('/api/auth/user');
    //     const data = await res.json();
        
    //     if (res.ok && data.user) {
    //       // If user is admin, redirect to admin page
    //       if (data.user.isAdmin) {
    //         router.replace('/admin');
    //         return;
    //       }
    //       setUser(data.user);
    //     } else {
    //       router.replace('/login');
    //     }
    //   } catch (error) {
    //     console.error('Auth check failed:', error);
    //     router.replace('/login');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

  useEffect(() => {
    fetchUser()
    checkAuth()

    if(user === false){
      router.replace('/login')
    }
  },[user])


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
    
    }
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen overflow-hidden lg:pl-[300px] lg:justify-end">
        <AdminPannel />
        <div className="w-full bg-zinc-50 min-h-screen overflow-auto">
          <div className="">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
