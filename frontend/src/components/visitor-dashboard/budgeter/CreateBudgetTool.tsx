import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { CREATE_BUDGET_TOOL } from '@/graphql/mutations';
import { Input } from '@/components/ui/input';
import Breadcrumbs from '@/components/Breadcrumbs';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FiPieChart, FiArrowRight, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { CreateBudgetToolProps } from '@/types/budgeterTypes';

const CreateBudgetTool: React.FC<CreateBudgetToolProps> = ({ visitorId }) => {
  const [totalBudget, setTotalBudget] = useState<string>('');

  const [createBudget, { loading }] = useMutation(CREATE_BUDGET_TOOL, {
    onCompleted: () => {
      toast.success('Budget created successfully!');
      // Reload the page after successful creation
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate input
    const budgetValue = parseFloat(totalBudget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    createBudget({
      variables: {
        input: {
          totalBudget: budgetValue,
          visitorId: visitorId,
        },
      },
    });
  };

  return (
    <div className="w-full bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-6 sm:p-10 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange/5 dark:bg-orange/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Dashboard Button */}
      <div className="mb-6 relative z-10">
        <Link
          href="/visitor-dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange bg-orange/5 dark:bg-darkElevated hover:bg-orange/15 dark:hover:bg-orange/15 border border-orange/20 dark:border-zinc-800 transition-all duration-200 active:scale-95 group w-fit"
        >
          <FiArrowLeft className="text-base sm:text-sm transition-transform group-hover:-translate-x-1 text-orange" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
        {/* Left Form Section */}
        <div className="flex-1 w-full max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-orange/10 text-orange mb-3">
            <FiPieChart size={14} />
            <span>Wedding Budget Planner</span>
          </div>

          <h1 className="font-title text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight mb-3">
            Get started with adding your budget
          </h1>

          <p className="font-body text-gray-600 dark:text-zinc-400 text-sm sm:text-base mb-6 leading-relaxed">
            Plan your wedding expenses effectively, monitor vendor costs, and stay comfortably within budget for your dream celebration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-zinc-200 mb-2 font-body">
                Your Target Budget
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="e.g. 1500000"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full h-12 text-base font-semibold bg-orange/[0.02] dark:bg-darkElevated border-2 border-orange/20 dark:border-zinc-700 focus:border-orange rounded-xl focus:ring-2 focus:ring-orange/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 transition-all"
                    required
                  />
                </div>
                <div className="flex items-center justify-center px-4 h-12 bg-orange/10 border-2 border-orange/20 dark:border-orange/30 rounded-xl text-orange font-bold text-sm tracking-wider shrink-0">
                  LKR
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !totalBudget}
              className="w-full h-12 bg-orange hover:bg-orange/90 text-white font-semibold text-base rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Setting up budget...</span>
                </>
              ) : (
                <>
                  <span>Manage My Budget</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick value props */}
          <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-orange/15 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="text-orange" size={14} />
              Category expense breakdowns
            </span>
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="text-orange" size={14} />
              Real-time payment tracking
            </span>
          </div>
        </div>

        {/* Right Illustration Section */}
        <div className="flex-1 w-full max-w-md flex justify-center items-center">
          <div className="w-full p-6 sm:p-8 bg-orange/[0.03] dark:bg-darkElevated/50 rounded-3xl border-2 border-orange/15 dark:border-zinc-800 shadow-2xs">
            <Image
              src="/images/budgeter.png"
              alt="Budget Management Illustration"
              width={500}
              height={400}
              className="w-full h-auto object-contain drop-shadow-sm"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetTool;