'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/shared/Headers/Header';
import Footer from '@/components/shared/Footer';
import LeftSideBar from '@/components/visitor-dashboard/LeftSideBar';
import BottomNavigationBar from '@/components/visitor-dashboard/BottomNavigationBar';
import { useAuth } from '@/contexts/VisitorAuthContext';
import { getVendorRecommendations } from '@/api/recommendation/vendorRecommendation.api';
import categories from '@/utils/category.json';

type RecommendationItem = {
  offeringId: string;
  offeringName: string;
  category: string;
  vendorName: string;
  city: string;
  location: string;
  rating: number;
  minPackagePrice: number | null;
  deterministicScore: number;
  reason: string;
  aiReview?: string;
};

const categoryOptions = categories;

const RecommendationPage = () => {
  const { visitor, accessToken, isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState<'rules' | 'ai' | 'ai+rules' | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  const canRequest = useMemo(() => isAuthenticated && !!accessToken, [isAuthenticated, accessToken]);

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!accessToken) {
      setError('Please log in as a visitor to get recommendations.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await getVendorRecommendations(
        {
          location,
          budget: budget ? Number(budget) : undefined,
          categories,
          notes,
          limit: 8,
        },
        accessToken,
      );

      setRecommendations(response.recommendations || []);
      setSource(response.source || 'rules');
    } catch {
      setError('Unable to load recommendations right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canRequest) {
    return (
      <div className="min-h-screen bg-lightYellow">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold font-title mb-4">Visitor login required</h1>
          <p className="mb-6">This recommendation feature is only available for logged-in registered visitors.</p>
          <Link href="/visitor-login" className="inline-block bg-primary px-6 py-3 rounded-md font-semibold">
            Go to Visitor Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightYellow">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div
            className={`
              hidden md:block transition-all duration-300 ease-in-out
              ${isSidebarCollapsed ? 'md:col-span-1' : 'md:col-span-2 lg:col-span-2'}
              pt-2
            `}
          >
            <div className="sticky top-4 pb-4">
              <LeftSideBar
                visitorId={visitor?.id || null}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            </div>
          </div>

          <div
            className={`
              col-span-12 transition-all duration-300 ease-in-out
              ${isSidebarCollapsed ? 'md:col-span-11' : 'md:col-span-10 lg:col-span-10'}
            `}
          >
            <h1 className="font-title text-3xl font-bold">AI Vendor Recommendations</h1>
            <p className="text-gray-700 mt-2 mb-6">
              Tell us your wedding preferences, and we will recommend vendors using hybrid matching.
            </p>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Preferred Location</label>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Ex: Colombo"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Budget (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    placeholder="Ex: 250000"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Needed Services</label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => {
                    const selected = categories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          selected
                            ? 'bg-primary border-primary text-black'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Style Notes (optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ex: candid photography, elegant decor, live acoustic music"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary px-5 py-2.5 rounded-md font-semibold disabled:opacity-70"
              >
                {isLoading ? 'Finding best vendors...' : 'Get Recommendations'}
              </button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>

            <div className="mt-6 pb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-title font-semibold">Recommended Vendors</h2>
                {source && (
                  <span className="text-xs font-semibold px-2 py-1 bg-white border rounded-md">
                    Source: {source === 'ai' || source === 'ai+rules' ? 'AI' : 'Rules'}
                  </span>
                )}
              </div>

              {recommendations.length === 0 ? (
                <div className="bg-white rounded-lg p-5 text-gray-600">
                  No recommendations yet. Fill your preferences and run matching.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((item) => (
                    <div key={item.offeringId} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-lg">{item.offeringName}</h3>
                          <p className="text-sm text-gray-700">{item.vendorName}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 border border-orange-200 h-fit">
                          {item.category}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-gray-700 space-y-1">
                        <p>
                          <strong>Location:</strong> {item.city || item.location || 'N/A'}
                        </p>
                        <p>
                          <strong>Rating:</strong> {item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
                        </p>
                        <p>
                          <strong>Starting Price:</strong>{' '}
                          {item.minPackagePrice !== null
                            ? `LKR ${Number(item.minPackagePrice).toLocaleString()}`
                            : 'Contact vendor'}
                        </p>
                        <p>
                          <strong>Flex:</strong> {item.reason}
                        </p>
                        {source === 'ai' && item.aiReview && (
                          <p className="mt-1 text-sm text-gray-600">
                            <strong>AI Review:</strong> {item.aiReview}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/services/${item.offeringId}`}
                        className="inline-block mt-4 text-sm font-semibold underline"
                      >
                        View vendor details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigationBar />
      <Footer />
    </div>
  );
};

export default RecommendationPage;
