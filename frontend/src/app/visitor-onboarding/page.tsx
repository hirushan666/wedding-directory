'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/shared/Headers/Header';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/VisitorAuthContext';
import { useQuery, useMutation } from '@apollo/client';
import { GET_VISITOR_BY_ID } from '@/graphql/queries';
import { UPDATE_VISITOR, SET_WEDDING_DATE } from '@/graphql/mutations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CityInput from '@/components/vendor-signup/CityInput';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { formatCoupleName } from '@/utils/formatCoupleName';
import { sendVisitorOnboardingWelcome } from '@/api/auth/signup-otp.api';
import {
  Heart,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function VisitorOnboardingPage() {
  const router = useRouter();
  const { visitor, isAuthenticated } = useAuth();

  const [visitorFname, setVisitorFname] = useState('');
  const [visitorLname, setVisitorLname] = useState('');
  const [partnerFname, setPartnerFname] = useState('');
  const [partnerLname, setPartnerLname] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [engagedDate, setEngagedDate] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Fetch current visitor info (pre-populates if signed up via Google or previous draft)
  const { data, loading: fetchingVisitor } = useQuery(GET_VISITOR_BY_ID, {
    variables: { id: visitor?.id },
    skip: !visitor?.id,
    fetchPolicy: 'network-only',
  });

  const [updateVisitor, { loading: isUpdating }] = useMutation(UPDATE_VISITOR);
  const [setWeddingDateChecklist, { loading: isSettingDate }] = useMutation(SET_WEDDING_DATE);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated && !visitor) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) router.push('/visitor-login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, visitor, router]);

  useEffect(() => {
    if (data?.findVisitorById && !initialized) {
      const v = data.findVisitorById;
      if (v.visitor_fname && v.visitor_fname !== 'Visitor') {
        setVisitorFname(v.visitor_fname);
      }
      if (v.visitor_lname) setVisitorLname(v.visitor_lname);
      if (v.partner_fname) setPartnerFname(v.partner_fname);
      if (v.partner_lname) setPartnerLname(v.partner_lname);
      if (v.wed_date) setWeddingDate(v.wed_date.split('T')[0]);
      if (v.engaged_date) setEngagedDate(v.engaged_date.split('T')[0]);
      if (v.city || v.wed_venue) setCity(v.city || v.wed_venue);
      if (v.phone) setPhone(v.phone);
      setInitialized(true);
    }
  }, [data, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);

    const trimmedFname = visitorFname.trim();
    if (!trimmedFname) {
      setNameError('Please enter your name (required).');
      toast.error('Your name is required to set up your profile.', {
        style: { background: '#333', color: '#fff' },
      });
      return;
    }

    if (!visitor?.id) {
      toast.error('Session expired. Please log in again.');
      router.push('/visitor-login');
      return;
    }

    try {
      const inputToSave: any = {
        visitor_fname: trimmedFname,
        isOnboarded: true,
      };

      if (visitorLname.trim()) inputToSave.visitor_lname = visitorLname.trim();
      if (partnerFname.trim()) inputToSave.partner_fname = partnerFname.trim();
      if (partnerLname.trim()) inputToSave.partner_lname = partnerLname.trim();
      if (city.trim()) {
        inputToSave.city = city.trim();
        inputToSave.wed_venue = city.trim();
      }
      if (phone.trim()) inputToSave.phone = phone.trim();
      if (engagedDate) inputToSave.engaged_date = engagedDate;

      await updateVisitor({
        variables: {
          id: visitor.id,
          input: inputToSave,
        },
      });

      if (weddingDate) {
        try {
          await setWeddingDateChecklist({
            variables: {
              visitorId: visitor.id,
              weddingDate: new Date(weddingDate).toISOString(),
            },
          });
        } catch (dateErr) {
          console.warn('Checklist date init notice:', dateErr);
        }
      }

      // Send welcome email with personalized names formatted via the helper function
      const formattedName = formatCoupleName({
        visitor_fname: trimmedFname,
        visitor_lname: visitorLname,
        partner_fname: partnerFname,
        partner_lname: partnerLname,
      });

      sendVisitorOnboardingWelcome(visitor.id, formattedName).catch((emailErr) => {
        console.warn('Visitor welcome email notice:', emailErr);
      });

      toast.success('Wedding profile setup complete! Welcome to Say I Do.', {
        style: { background: '#333', color: '#fff' },
      });

      router.push('/visitor-dashboard');
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      toast.error(err?.message || 'Failed to save profile details. Please try again.');
    }
  };

  if (fetchingVisitor) {
    return (
      <div className="relative w-full min-h-screen bg-lightYellow dark:bg-darkBg font-body overflow-x-clip animate-fade-in flex flex-col">
        <div className="sticky top-0 z-30 w-full">
          <Header />
        </div>
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
          <div className="bg-white dark:bg-darkSurface rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="bg-white dark:bg-darkSurface rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col items-center space-y-2 mb-8">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSubmitting = isUpdating || isSettingDate;

  return (
    <div className="relative w-full min-h-screen bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 font-body overflow-x-clip transition-colors duration-200 flex flex-col">
      <div className="sticky top-0 z-30 w-full">
        <Header />
      </div>

      {/* Ambient Brand Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-orange/15 dark:bg-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-orange/10 dark:bg-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        {/* Progress indicator mirroring vendor onboarding */}
        <div className="mb-6 bg-white dark:bg-darkSurface rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange/10 dark:bg-orange/20 flex items-center justify-center text-orange font-bold text-sm">
              2/2
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange">Final Step</p>
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Set Up Your Wedding Profile</h2>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Account Verified
            </span>
            <span>&rarr;</span>
            <span className="text-orange font-semibold">Couple Profile</span>
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-orange/20 dark:border-zinc-800 transition-colors">
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="w-12 h-12 bg-orange/10 dark:bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-3 text-orange">
              <Heart className="w-6 h-6 fill-orange/30 text-orange" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
              Tell us about your wedding plans
            </h1>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2">
              We&apos;ll personalize your wedding planning checklist, budgeter, and vendor recommendations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: VISITOR NAME (COMPULSORY) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-orange/5 dark:bg-orange/10 border border-orange/20 space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Your Name
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Your Name / First Name <span className="text-orange font-bold">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Kasun or Sarah"
                    value={visitorFname}
                    onChange={(e) => {
                      setVisitorFname(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    className={`h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:ring-0 focus:border-orange dark:focus:border-orange transition-colors ${
                      nameError
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-200 dark:border-zinc-700/80'
                    }`}
                    required
                  />
                  {nameError && (
                    <p className="text-xs text-red-500 mt-1">{nameError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Last Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Last name"
                    value={visitorLname}
                    onChange={(e) => setVisitorLname(e.target.value)}
                    className="h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PARTNER DETAILS (OPTIONAL) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Partner&apos;s Information <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Partner&apos;s First Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Ruwan or Emily"
                    value={partnerFname}
                    onChange={(e) => setPartnerFname(e.target.value)}
                    className="h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Partner&apos;s Last Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Partner's last name"
                    value={partnerLname}
                    onChange={(e) => setPartnerLname(e.target.value)}
                    className="h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: DATES (OPTIONAL) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Important Dates <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Wedding Date <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 outline-none focus:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                    Setting this automatically creates your wedding checklist tasks.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Engagement Date <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="date"
                    value={engagedDate}
                    onChange={(e) => setEngagedDate(e.target.value)}
                    className="h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 outline-none focus:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                    You can always update this later from your profile.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 4: LOCATION & CONTACT (OPTIONAL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Wedding City / Destination <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="rounded-xl overflow-hidden">
                  <CityInput
                    placeholder={city || "Select your primary wedding city"}
                    onCityChange={(selectedCity) => setCity(selectedCity)}
                    className="border-2 border-gray-200 dark:border-zinc-700/80 rounded-xl flex flex-row space-y-1.5 bg-white dark:bg-darkElevated hover:border-orange dark:hover:border-orange transition-colors h-12"
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                  Helps us suggest vendors available near your location.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. 077 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                />
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                  Used if vendors need to reach out regarding quotes.
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-white font-semibold hover:bg-orange/90 bg-orange text-base shadow-sm shadow-orange/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Saving details...</span>
                ) : (
                  <>
                    <span>Complete Setup & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
