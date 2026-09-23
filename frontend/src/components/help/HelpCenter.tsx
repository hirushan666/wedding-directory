"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useAuth as useVisitorAuth } from "@/contexts/VisitorAuthContext";
import {
  FiSearch,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiMessageSquare,
  FiShoppingBag,
  FiChevronDown,
  FiArrowRight,
  FiUsers,
  FiStar,
  FiSettings,
  FiGrid,
  FiX,
  FiHeart,
  FiBriefcase,
  FiExternalLink,
} from "react-icons/fi";

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

// Vendor FAQs Data
const VENDOR_FAQS: FAQItem[] = [
  {
    id: "v-1",
    category: "storefront",
    question: "How do I add a new wedding service or package listing?",
    answer:
      "Navigate to your Vendor Dashboard and click the '+ Add New Service' button in the top right header. Fill in your service name, choose a primary wedding category (e.g., Photography, Venue, Bridal Wear, Catering), set your pricing structure, detail package inclusions, and upload high-resolution showcase photos. Once saved, your service immediately becomes discoverable to couples searching the platform.",
    tags: ["service", "package", "create", "listing", "storefront"],
  },
  {
    id: "v-2",
    category: "storefront",
    question: "Can I edit or update my existing packages, pricing, and bio?",
    answer:
      "Yes, you have full control over your offerings. In your Vendor Dashboard, locate the service under 'Services by You' and click 'View Details' or edit directly. To update your business description, phone, or location, go to 'Settings' > 'General' or 'Profile' from the top navigation.",
    tags: ["edit", "update", "price", "profile", "bio"],
  },
  {
    id: "v-3",
    category: "storefront",
    question: "What image resolutions and formats work best for service galleries?",
    answer:
      "We recommend clear, high-resolution images in JPG, PNG, or WebP format with a 16:9 or 4:3 aspect ratio (minimum 1200 x 800 px). High-quality cover banners and gallery photos substantially increase couple engagement and booking inquiries.",
    tags: ["images", "gallery", "photos", "banner", "quality"],
  },
  {
    id: "v-4",
    category: "bookings",
    question: "How do couple booking requests and approvals work?",
    answer:
      "When an interested couple selects one of your packages and submits a booking request for their wedding date, it appears on your dashboard under 'Approval Requests'. You can review the couple's details, requested date, guest count, and package selection, then approve or decline with a single click.",
    tags: ["booking", "approval", "requests", "date", "calendar"],
  },
  {
    id: "v-5",
    category: "bookings",
    question: "How does the Booking Calendar prevent double-booking?",
    answer:
      "Your integrated Booking Calendar displays all confirmed wedding bookings, pending requests, and blocked dates. Once a booking is approved and the advance payment is completed, that date is locked to prevent double-booking conflicts.",
    tags: ["calendar", "schedule", "availability", "double booking"],
  },
  {
    id: "v-6",
    category: "bookings",
    question: "Can I block out personal dates or holidays when I am unavailable?",
    answer:
      "Yes! You can manage your availability directly from your calendar by marking specific dates as busy or blocked. Couples will not be able to request reservations for dates marked unavailable.",
    tags: ["block dates", "holidays", "unavailability", "vacation"],
  },
  {
    id: "v-7",
    category: "payments",
    question: "How does the 20% client advance booking deposit work?",
    answer:
      "To confirm and reserve their wedding date, couples pay a 20% advance booking deposit through our secure payment gateway. This guarantees commitment from the couple and protects your business from last-minute cancellations.",
    tags: ["advance", "deposit", "payment", "20 percent", "security"],
  },
  {
    id: "v-8",
    category: "payments",
    question: "When and how do I receive payouts to my bank account?",
    answer:
      "All client transactions are recorded in your 'Payments' tab. Completed advance deposits are remitted directly to your registered bank account according to the payout schedule configured in your account settings.",
    tags: ["payout", "bank", "transfer", "earnings", "revenue"],
  },
  {
    id: "v-9",
    category: "payments",
    question: "Where can I download receipts and financial statements?",
    answer:
      "Visit the 'Payments' page from your vendor navigation and click 'Export Statement'. You can instantly generate and download formatted PDF or Excel statements containing complete transaction histories for your accounting and tax records.",
    tags: ["export", "pdf", "excel", "statement", "receipt", "taxes"],
  },
  {
    id: "v-10",
    category: "messages",
    question: "How do I chat with couples who inquire about my services?",
    answer:
      "Click the message bubble icon in your top navigation to access the Chats center. You can converse directly with couples, answer queries, share customized estimates, and clarify wedding schedule details in real time.",
    tags: ["chat", "messages", "inquiries", "communication", "couples"],
  },
  {
    id: "v-11",
    category: "messages",
    question: "Will I receive notifications when a new message or booking arrives?",
    answer:
      "Yes. Say I Do provides instant in-app alerts (with unread counter badges on the navigation bar) and automated email notifications so you never miss an inquiry or urgent booking request.",
    tags: ["notifications", "alerts", "email", "unread"],
  },
  {
    id: "v-12",
    category: "reviews",
    question: "How are couple reviews and star ratings verified?",
    answer:
      "Reviews can only be submitted by verified couples who have booked or completed a service with your business on Say I Do. This protects vendors against fraudulent or spam reviews and highlights your authentic reputation.",
    tags: ["reviews", "ratings", "feedback", "verified", "reputation"],
  },
];

// Visitor / Couple FAQs Data
const VISITOR_FAQS: FAQItem[] = [
  {
    id: "c-1",
    category: "vendors",
    question: "How do I search, filter, and compare wedding vendors?",
    answer:
      "Use our Vendor Search page to browse vendors by category (Venues, Photographers, Planners, Bridal Salons, Caterers, Musicians, and more), location/city, and pricing. You can click on any vendor to explore their photo galleries, package inclusions, and verified couple reviews.",
    tags: ["search", "filter", "vendors", "venues", "photographers"],
  },
  {
    id: "c-2",
    category: "vendors",
    question: "Can I save vendors to compare them later?",
    answer:
      "Yes! When browsing vendors, click 'Save' or add them to your 'My Vendors' list on your Visitor Dashboard. This allows you to track preferred vendors side-by-side and keep your wedding dream team organized in one place.",
    tags: ["save", "favorite", "my vendors", "compare"],
  },
  {
    id: "c-3",
    category: "vendors",
    question: "How do I contact a vendor before deciding to book?",
    answer:
      "Every vendor profile features direct messaging. Click 'Send Message' or 'Contact' on their listing to initiate a chat. You can ask specific questions about your date, request custom package options, and discuss your wedding vision.",
    tags: ["contact", "chat", "quote", "inquiry", "message"],
  },
  {
    id: "c-4",
    category: "planning",
    question: "How does the Wedding Budgeter tool work?",
    answer:
      "Our interactive Budgeter tool on your dashboard lets you set your total overall budget, allocate maximum spend targets for each category (e.g. Venue, Catering, Attire, Photography), and record payments made. The tool automatically updates your remaining budget and displays percentage progress.",
    tags: ["budget", "budgeter", "expenses", "costs", "planning"],
  },
  {
    id: "c-5",
    category: "planning",
    question: "How do I use the Wedding Checklist?",
    answer:
      "The Wedding Checklist outlines essential planning milestones arranged by timeline (12 months, 6 months, 3 months, 1 month out, and wedding week). You can mark tasks complete, edit deadlines, and add custom personal to-dos.",
    tags: ["checklist", "tasks", "timeline", "to do", "milestones"],
  },
  {
    id: "c-6",
    category: "guests",
    question: "How do I manage my Guest List and track RSVPs?",
    answer:
      "In the Guest List tool, you can add invited guests, assign them to Bride or Groom sides, record dietary restrictions, and track real-time attendance status (Invited, Attending, Declined).",
    tags: ["guests", "guest list", "rsvp", "attendance", "dietary"],
  },
  {
    id: "c-7",
    category: "payments",
    question: "How does booking a vendor work with the 20% advance deposit?",
    answer:
      "To officially secure and lock in your wedding date with a vendor, you pay a 20% advance deposit through our secure payment gateway. Once confirmed, your booking is guaranteed on the vendor's schedule, and you will receive a digital receipt in your payment history.",
    tags: ["booking", "advance", "deposit", "20 percent", "payment"],
  },
  {
    id: "c-8",
    category: "payments",
    question: "Are payments safe and secure on Say I Do?",
    answer:
      "Yes, all payments are protected with 256-bit SSL encryption and processed through certified payment gateways. Your financial credentials are never stored on our servers, and every transaction generates an official receipt.",
    tags: ["security", "safety", "payment gateway", "receipt"],
  },
  {
    id: "c-9",
    category: "payments",
    question: "What happens if we need to reschedule our wedding date?",
    answer:
      "If you need to change your date, message the vendor directly through Say I Do Chats as early as possible. Most vendors will happily work with you to accommodate alternative available dates according to their rescheduling policy.",
    tags: ["reschedule", "cancellation", "date change", "refund"],
  },
  {
    id: "c-10",
    category: "reviews",
    question: "Are vendor reviews and ratings authentic?",
    answer:
      "Yes! Say I Do ensures all reviews come from genuine couples who have interacted with or booked the vendor through the platform. This guarantees truthful reviews you can rely on when making important wedding decisions.",
    tags: ["reviews", "ratings", "authentic", "trust", "feedback"],
  },
  {
    id: "c-11",
    category: "account",
    question: "How do I update our wedding date, location, and couple names?",
    answer:
      "Click your profile icon in the top right corner and choose 'Profile' or 'Wedding Details'. You can edit your wedding date, partner's name, wedding city, and profile photos at any time.",
    tags: ["profile", "wedding date", "account", "partner", "settings"],
  },
];

interface HelpCenterProps {
  initialRole?: "vendor" | "visitor";
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ initialRole }) => {
  const searchParams = useSearchParams();
  const { vendor } = useVendorAuth();
  const { visitor } = useVisitorAuth();

  // Determine role based on props, query parameters, or logged-in state
  const roleParam = searchParams.get("role");
  const defaultRole =
    initialRole ||
    (roleParam === "vendor" || roleParam === "visitor" ? roleParam : null) ||
    (vendor ? "vendor" : visitor ? "visitor" : "visitor");

  const [activeRole, setActiveRole] = useState<"vendor" | "visitor">(
    defaultRole
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Sync if role query param or auth state changes
  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    } else if (vendor) {
      setActiveRole("vendor");
    } else if (visitor) {
      setActiveRole("visitor");
    } else if (roleParam === "vendor" || roleParam === "visitor") {
      setActiveRole(roleParam);
    }
  }, [vendor, visitor, initialRole, roleParam]);

  // Categories config for Vendor
  const vendorCategories = [
    { id: "all", label: "All Topics", icon: FiGrid },
    { id: "storefront", label: "Storefront & Services", icon: FiShoppingBag },
    { id: "bookings", label: "Bookings & Calendar", icon: FiCalendar },
    { id: "payments", label: "Payments & Payouts", icon: FiDollarSign },
    { id: "messages", label: "Messages & Inquiries", icon: FiMessageSquare },
    { id: "reviews", label: "Reviews & Reputation", icon: FiStar },
  ];

  // Categories config for Visitor
  const visitorCategories = [
    { id: "all", label: "All Topics", icon: FiGrid },
    { id: "vendors", label: "Finding Vendors", icon: FiShoppingBag },
    { id: "planning", label: "Budget & Checklist", icon: FiCalendar },
    { id: "guests", label: "Guest List & RSVPs", icon: FiUsers },
    { id: "payments", label: "Payments & Deposits", icon: FiDollarSign },
    { id: "reviews", label: "Reviews & Safety", icon: FiStar },
    { id: "account", label: "Couple Account", icon: FiHeart },
  ];

  const currentCategories =
    activeRole === "vendor" ? vendorCategories : visitorCategories;
  const currentFaqList = activeRole === "vendor" ? VENDOR_FAQS : VISITOR_FAQS;

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return currentFaqList.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      const inQuestion = faq.question.toLowerCase().includes(q);
      const inAnswer = faq.answer.toLowerCase().includes(q);
      const inTags = faq.tags.some((t) => t.toLowerCase().includes(q));
      return inQuestion || inAnswer || inTags;
    });
  }, [currentFaqList, selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-grow flex flex-col font-body">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Minimized Header Banner */}
        <div className="mb-6 pb-4 border-b border-orange/15 dark:border-zinc-800">
          <h1 className="font-title text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100">
            {activeRole === "vendor" ? "Vendor Help & Support" : "Couple Help & Support"}
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-body text-xs sm:text-sm mt-1 max-w-2xl">
            {activeRole === "vendor"
              ? "Everything you need to know about managing your storefront, services, booking calendar, payments, and client communications."
              : "Find answers and guidance for finding the best vendors, planning your wedding budget, managing your guest list, and booking securely."}
          </p>
        </div>

        {/* Search Bar Card */}
        <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 dark:border-zinc-800 p-5 sm:p-6 mb-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-title text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-1.5">
              How can we help you today?
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm mb-5">
              Search by question, keyword, or topic to find quick answers.
            </p>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                <FiSearch size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeRole === "vendor"
                    ? "Search packages, calendar, advance payments, payouts, chat..."
                    : "Search finding vendors, budgeter, deposits, checklist, RSVPs..."
                }
                className="w-full pl-11 pr-10 py-3 bg-gray-50/80 dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs - Wrapped to eliminate horizontal scrolling */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {currentCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === "all"
                  ? currentFaqList.length
                  : currentFaqList.filter((f) => f.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? "bg-orange text-white border-orange shadow-sm ring-2 ring-orange/20"
                      : "bg-white dark:bg-darkSurface text-gray-700 dark:text-zinc-300 border-orange/20 dark:border-zinc-800 hover:border-orange hover:bg-orange/5 dark:hover:bg-darkElevated hover:text-orange shadow-xs"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-orange"} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-orange/10 text-orange"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout: FAQs (Left) + Quick Help Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* FAQ Accordion List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-title text-xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Frequently Asked Questions</span>
                <span className="text-xs font-normal text-gray-400 dark:text-zinc-500">
                  ({filteredFaqs.length} {filteredFaqs.length === 1 ? "answer" : "answers"})
                </span>
              </h2>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs text-orange font-semibold hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-3.5">
                {filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`bg-white dark:bg-darkSurface rounded-2xl transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? "border-2 border-orange shadow-md"
                          : "border border-orange/20 dark:border-zinc-800 hover:border-orange/60 dark:hover:border-orange/60 shadow-xs hover:shadow-sm"
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                              isExpanded
                                ? "bg-orange border-orange text-white"
                                : "bg-orange/10 border-orange/20 text-orange group-hover:bg-orange group-hover:text-white"
                            }`}
                          >
                            <FiHelpCircle size={15} />
                          </div>
                          <div>
                            <span
                              className={`font-title text-base sm:text-lg font-bold block transition-colors ${
                                isExpanded
                                  ? "text-orange"
                                  : "text-gray-900 dark:text-zinc-100 group-hover:text-orange dark:group-hover:text-orange"
                              }`}
                            >
                              {faq.question}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-gray-400 dark:text-zinc-500 capitalize font-medium">
                                Category: {faq.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`p-2 rounded-xl border transition-all duration-200 flex-shrink-0 ${
                            isExpanded
                              ? "rotate-180 border-orange bg-orange text-white"
                              : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-darkElevated text-gray-400 dark:text-zinc-400 group-hover:border-orange/40 group-hover:text-orange"
                          }`}
                        >
                          <FiChevronDown size={16} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 sm:px-6 pb-6 pt-3 text-gray-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed border-t border-orange/15 dark:border-zinc-800 bg-orange/[0.02] dark:bg-darkElevated/40">
                          <p className="mt-1">{faq.answer}</p>
                          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-orange/10 dark:border-zinc-800">
                            {faq.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-orange font-medium shadow-2xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-darkSurface rounded-2xl p-12 text-center border border-orange/20 dark:border-zinc-800 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center mx-auto mb-4">
                  <FiSearch size={26} />
                </div>
                <h3 className="font-title text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">
                  No matching questions found
                </h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm max-w-md mx-auto mb-4">
                  We couldn&apos;t find any FAQs matching &ldquo;{searchQuery}&rdquo;. Try another search term or reach out directly to our support team.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="bg-orange text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-orange/90 transition-all shadow-sm cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Quick Support & Dashboard Links (Right Column) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Direct Support Card */}
            <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 dark:border-zinc-800 p-6">
              <div className="flex items-center gap-2 text-orange mb-3">
                <FiMail size={20} />
                <h3 className="font-title text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Still Need Help?
                </h3>
              </div>
              <p className="text-gray-500 dark:text-zinc-400 text-xs leading-relaxed mb-5">
                Our support team is available Mon - Sat from 9:00 AM to 6:00 PM to assist you with any questions or technical issues.
              </p>

              <div className="space-y-4 text-sm">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-darkElevated border border-gray-100 dark:border-zinc-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange/10 text-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMail size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Email Support</p>
                    <a
                      href="mailto:sayidolk@gmail.com"
                      className="font-semibold text-gray-900 dark:text-zinc-100 hover:text-orange dark:hover:text-orange transition-colors truncate block"
                    >
                      sayidolk@gmail.com
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-darkElevated border border-gray-100 dark:border-zinc-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange/10 text-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiPhone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Customer Hotline</p>
                    <a
                      href="tel:+94477864913"
                      className="font-semibold text-gray-900 dark:text-zinc-100 hover:text-orange dark:hover:text-orange transition-colors"
                    >
                      +94 47 786 4913
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-darkElevated border border-gray-100 dark:border-zinc-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange/10 text-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Headquarters</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                      Hapugala, Galle, Sri Lanka
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
                >
                  <span>Contact Form & Inquiries</span>
                  <FiArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Quick Navigation Shortcuts based on role */}
            <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 dark:border-zinc-800 p-6">
              <h3 className="font-title text-base font-bold text-gray-900 dark:text-zinc-100 mb-3">
                {activeRole === "vendor"
                  ? "Vendor Quick Tools"
                  : "Couple Planning Tools"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                Jump directly to your relevant dashboard pages:
              </p>

              <div className="flex flex-col gap-2 text-xs font-semibold">
                {activeRole === "vendor" ? (
                  <>
                    <Link
                      href="/vendor-dashboard"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiGrid size={14} /> Vendor Dashboard
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                    <Link
                      href="/vendor-dashboard/payments"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiDollarSign size={14} /> Payments & Statements
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                    <Link
                      href="/vendor-dashboard/chats"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiMessageSquare size={14} /> Client Inquiries & Chats
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                    <Link
                      href="/vendor-dashboard/settings"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiSettings size={14} /> Storefront Settings
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/visitor-dashboard"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiHeart size={14} /> Wedding Dashboard
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                    <Link
                      href="/services"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiShoppingBag size={14} /> Find & Filter Services
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                    <Link
                      href="/guest-list"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiUsers size={14} /> Guest List & RSVP Manager
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                    <Link
                      href="/visitor-dashboard/budgeter"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange text-gray-700 dark:text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FiDollarSign size={14} /> Wedding Budget Tool
                      </span>
                      <FiExternalLink size={12} className="text-gray-400 dark:text-zinc-500" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
