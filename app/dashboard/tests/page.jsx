"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      if (res.ok) {
        console.log('Fetched tests:', data.data);
        setTests(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch tests');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError(error.message || 'Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchTests}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-2xl font-bold mb-6">Available Tests</h1>
        {!tests || tests.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No tests available at the moment
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <div key={test.id} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{test.title}</h2>
                    {test.description && (
                      <p className="text-gray-600 mt-1">{test.description}</p>
                    )}
                    {test.createdAt && (
                      <p className="text-sm text-gray-400 mt-2">
                        Created: {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/tests/${test.id}`}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Take Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
