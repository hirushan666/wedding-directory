'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import BottomNavigationBar from '@/components/visitor-dashboard/BottomNavigationBar';
import { useAuth } from '@/contexts/VisitorAuthContext';
import { getVendorRecommendations } from '@/api/recommendation/vendorRecommendation.api';
import categories from '@/utils/category.json';
import { Sparkles } from 'lucide-react';
import {
  FiMapPin,
  FiDollarSign,
  FiLayers,
  FiFeather,
  FiSliders,
  FiAlertCircle,
  FiArrowRight,
  FiStar,
} from 'react-icons/fi';

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
  const { accessToken, isAuthenticated } = useAuth();
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState<'rules' | 'ai' | 'ai+rules' | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  const canRequest = useMemo(() => isAuthenticated && !!accessToken, [isAuthenticated, accessToken]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
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
          categories: selectedCategories,
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
      <div className="w-full max-w-lg mx-auto py-16">
        <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 dark:bg-orange/20 flex items-center justify-center text-orange mx-auto">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
            Visitor Login Required
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 font-body">
            This AI recommendation feature is only available for registered visitors.
          </p>
          <Link
            href="/visitor-login"
            className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm text-sm"
          >
            Go to Visitor Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Hero Card */}
      <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <div className="space-y-3">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/visitor-dashboard' },
              {
                label: 'AI Recommendations',
                href: '/visitor-dashboard/recommendations',
              },
            ]}
          />
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange/10 dark:bg-orange/20 flex items-center justify-center text-orange shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                AI Vendor Recommendations
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body">
                Tell us your wedding preferences, and we will recommend vendors using smart hybrid matching.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Preferences Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2 pb-4 border-b border-orange/15 dark:border-zinc-800">
          <FiSliders className="text-orange" size={20} />
          <h2 className="text-lg sm:text-xl font-bold font-title text-gray-900 dark:text-zinc-100">
            Wedding Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 font-body flex items-center gap-1.5">
              <FiMapPin className="text-orange" size={14} />
              <span>Preferred Location</span>
            </label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Ex: Colombo, Kandy, Galle"
              className="w-full h-11 border border-orange/25 dark:border-zinc-700 dark:bg-darkElevated dark:text-zinc-100 dark:placeholder:text-zinc-500 rounded-xl px-4 text-sm font-body focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 font-body flex items-center gap-1.5">
              <FiDollarSign className="text-orange" size={14} />
              <span>Target Budget (LKR)</span>
            </label>
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="Ex: 250000"
              className="w-full h-11 border border-orange/25 dark:border-zinc-700 dark:bg-darkElevated dark:text-zinc-100 dark:placeholder:text-zinc-500 rounded-xl px-4 text-sm font-body focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2.5 font-body flex items-center gap-1.5">
            <FiLayers className="text-orange" size={14} />
            <span>Needed Services</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => {
              const selected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                    selected
                      ? 'bg-orange border-orange text-white shadow-xs'
                      : 'bg-white dark:bg-darkElevated border-orange/20 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-orange hover:text-orange'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 font-body flex items-center gap-1.5">
            <FiFeather className="text-orange" size={14} />
            <span>Style Notes (optional)</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ex: candid photography, elegant decor, live acoustic music"
            className="w-full border border-orange/25 dark:border-zinc-700 dark:bg-darkElevated dark:text-zinc-100 dark:placeholder:text-zinc-500 rounded-xl p-3.5 text-sm font-body focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-body">
            <FiAlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 flex justify-start">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-all text-sm font-body cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Finding best vendors...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Get Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 3. Recommended Vendors */}
      <div className="space-y-4 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold font-title text-gray-900 dark:text-zinc-100">
              Recommended Vendors
            </h2>
          </div>
          {source && (
            <span className="text-xs font-semibold px-3 py-1 bg-orange/10 dark:bg-orange/20 border border-orange/20 dark:border-orange/30 text-orange rounded-full flex items-center gap-1.5 font-body">
              <Sparkles size={12} />
              <span>
                Source: {source === 'ai' || source === 'ai+rules' ? 'AI' : 'Rules'}
              </span>
            </span>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange/10 dark:bg-orange/20 flex items-center justify-center text-orange mx-auto mb-3 shadow-xs">
              <Sparkles size={26} />
            </div>
            <h3 className="font-title text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">
              No recommendations yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body max-w-md mx-auto">
              Fill in your wedding preferences above and click &quot;Get Recommendations&quot; to discover matched vendors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((item) => (
              <div
                key={item.offeringId}
                className="bg-white dark:bg-darkSurface rounded-2xl p-6 shadow-sm border border-orange/20 dark:border-zinc-800 hover:border-orange/40 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-orange/10 dark:border-zinc-800">
                    <div>
                      <h3 className="font-bold font-title text-lg text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors">
                        {item.offeringName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body mt-0.5">
                        {item.vendorName}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-orange/10 dark:bg-orange/20 text-orange border border-orange/20 font-semibold shrink-0">
                      {item.category}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-gray-700 dark:text-zinc-300 font-body">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-orange shrink-0" size={15} />
                      <span className="text-gray-500 dark:text-zinc-400">Location:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {item.city || item.location || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiStar className="text-amber-500 fill-amber-400 shrink-0" size={15} />
                      <span className="text-gray-500 dark:text-zinc-400">Rating:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {item.rating > 0 ? `${item.rating.toFixed(1)} / 5.0` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiDollarSign className="text-orange shrink-0" size={15} />
                      <span className="text-gray-500 dark:text-zinc-400">Starting Price:</span>
                      <span className="font-bold text-orange font-title">
                        {item.minPackagePrice !== null
                          ? `LKR ${Number(item.minPackagePrice).toLocaleString()}`
                          : 'Contact vendor'}
                      </span>
                    </div>

                    {item.reason && (
                      <div className="mt-2 pt-2 border-t border-orange/10 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-400">
                        <span className="font-semibold text-gray-800 dark:text-zinc-200">Highlight: </span>
                        {item.reason}
                      </div>
                    )}

                    {source === 'ai' && item.aiReview && (
                      <div className="mt-2 p-2.5 rounded-xl bg-orange/[0.04] dark:bg-orange/[0.08] border border-orange/15 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-300">
                        <span className="font-semibold text-orange block mb-0.5">AI Review:</span>
                        {item.aiReview}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-orange/10 dark:border-zinc-800 flex items-center justify-between">
                  <Link
                    href={`/services/${item.offeringId}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-orange hover:text-orange/80 transition-colors"
                  >
                    <span>View vendor details</span>
                    <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigationBar />
    </div>
  );
};

export default RecommendationPage;
