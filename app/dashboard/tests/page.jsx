"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      if (res.ok) {
        console.log('Fetched tests:', data.tests);
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div> */}
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl mb-2">Tests</h1>
        {tests.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No tests available at the moment
          </div>
        ) : (
          tests.map((test) => (
            <div key={test._id} className="mt-5 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded">
              <div className="flex gap-4 items-center">
                <h1 className="font-semibold">{test.title}</h1>
              </div>
              <div className="text-sm text-zinc-500 flex flex-col gap-1 mt-1">
                <p>{test.description}</p>
                <p className="text-xs text-gray-400">Created at: {new Date(test.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-sm flex flex-col w-fit mt-7 gap-2">
                <Link 
                  href={`/dashboard/tests/${test._id}`} 
                  className="text-white bg-primary py-2 px-4 rounded hover:bg-primary/90 transition-colors"
                >
                  Take Test
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
