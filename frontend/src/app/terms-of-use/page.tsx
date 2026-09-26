import React from "react";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";
import { Metadata } from "next";
import { FiFileText, FiCalendar, FiMail, FiPhone, FiAlertCircle, FiCheck } from "react-icons/fi";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions governing the use of the Say I Do multivendor wedding directory and planning platform.",
};

const TermsOfUse = () => {
  const sections = [
    {
      id: "1",
      title: "Acceptance of Terms",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          Welcome to <strong className="text-gray-900 dark:text-zinc-100 font-semibold">Say I Do</strong>, Sri Lanka&apos;s premier multivendor wedding planning directory. By accessing or using our website, services, mobile interfaces, or planning tools (collectively, the &ldquo;Services&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not access or use the platform.
        </p>
      ),
    },
    {
      id: "2",
      title: "Eligibility & Account Registration",
      content: (
        <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          <p>
            To unlock planning tools (such as wedding checklists, budgeters, chats, and vendor bookings), you must register for an account:
          </p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span>You must provide accurate, current, and complete registration information.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span>You are solely responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span>You must immediately notify Say I Do of any unauthorized security breach or compromise.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "3",
      title: "Use of Platform & Planning Tools",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          Say I Do provides an interactive marketplace and suite of planning features intended for engaged couples and authorized wedding vendors. You agree to use the Services solely for legitimate wedding planning and vendor discovery purposes. Misuse, automated scraping, or unauthorized reverse-engineering of our matching engines or proprietary directories is strictly prohibited.
        </p>
      ),
    },
    {
      id: "4",
      title: "Vendor Services & Marketplace Relationship",
      content: (
        <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          <p>
            Say I Do connects couples with independent third-party wedding vendors (venues, photographers, caterers, florists, videographers, decorators, and more):
          </p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>Vendors operate as independent business entities and are exclusively responsible for the quality, delivery, and performance of their booked services.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>While Say I Do verifies profiles and provides transparent client reviews, we do not directly employ vendors or guarantee their individual service execution.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>Specific contractual deliverables, timelines, and package terms are established directly between the couple and the respective vendor.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "5",
      title: "Payments, Bookings & Invoicing",
      content: (
        <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          <p>
            Payments made through Say I Do are facilitated through regulated, secure payment gateways:
          </p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>All prices, quotes, and packages listed in Sri Lankan Rupees (LKR) are set by the respective vendors.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>Official digital invoices and payment confirmation receipts are generated within your Payments History tab upon transaction completion.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>Refund policies, milestone advance deposits, and cancellation terms are subject to each vendor&apos;s published service agreement.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "6",
      title: "User Reviews & Content Guidelines",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          Users may post honest reviews, vendor ratings, planning notes, and ceremony imagery. By submitting reviews or media, you grant Say I Do a non-exclusive, royalty-free license to display this content across our directory. Content that is fraudulent, defamatory, discriminatory, infringing on copyrights, or promotional spam is subject to immediate moderation and removal.
        </p>
      ),
    },
    {
      id: "7",
      title: "Intellectual Property",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          The Say I Do trademark, logo, design system, algorithms, text, and visual assets are the exclusive intellectual property of Say I Do and its creators. Unauthorized reproduction, redistribution, or modification of any platform assets without explicit written authorization is prohibited under applicable IP laws.
        </p>
      ),
    },
    {
      id: "8",
      title: "Limitation of Liability",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          To the maximum extent permitted by applicable law in Sri Lanka, Say I Do and its directors, employees, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from vendor performance disputes, service delays, event cancellations, or technical disruptions.
        </p>
      ),
    },
    {
      id: "9",
      title: "Governing Law & Dispute Resolution",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with the substantive laws of the Democratic Socialist Republic of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 font-body transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-6 sm:space-y-8">
        {/* Hero Card */}
        <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center mx-auto mb-4 border border-orange/20 shadow-xs">
            <FiFileText size={28} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange/10 dark:bg-orange/20 text-orange border border-orange/20 mb-3">
            <FiCalendar size={13} />
            <span>Effective Date: October 12, 2024</span>
          </span>

          <h1 className="font-title text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-zinc-100 mb-3">
            Terms of Use
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-body text-xs sm:text-sm max-w-lg mx-auto">
            Please read these terms and conditions carefully before utilizing Say I Do and its wedding directory services.
          </p>
        </div>

        {/* Terms Content Card */}
        <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-6 sm:p-10 space-y-8">
          {sections.map((section) => (
            <section key={section.id} className="space-y-3 pb-6 border-b border-orange/10 dark:border-zinc-800 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-orange/10 dark:bg-orange/20 text-orange font-bold font-title text-xs flex items-center justify-center shrink-0 border border-orange/20">
                  {section.id}
                </span>
                <h2 className="font-title text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-100">
                  {section.title}
                </h2>
              </div>
              <div className="pl-10">
                {section.content}
              </div>
            </section>
          ))}

          {/* Contact Box */}
          <div className="mt-8 pt-6 border-t border-orange/15 dark:border-zinc-800 bg-orange/[0.03] dark:bg-orange/[0.06] border border-orange/20 dark:border-orange/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-orange font-bold text-sm font-title">
                <FiAlertCircle size={16} />
                <span>Need Clarification on Our Terms?</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
                Reach out to our legal and customer support team with any questions.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <a
                href="mailto:sayidolk@gmail.com"
                className="inline-flex items-center gap-2 text-orange hover:underline font-semibold"
              >
                <FiMail size={14} />
                <span>sayidolk@gmail.com</span>
              </a>
              <a
                href="tel:+94477864913"
                className="inline-flex items-center gap-2 text-orange hover:underline font-semibold"
              >
                <FiPhone size={14} />
                <span>+94 47 786 4913</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Link */}
        <div className="flex items-center justify-between px-2 text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
          <Link href="/privacy-policy" className="hover:text-orange transition-colors underline">
            &larr; Read our Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-orange transition-colors underline">
            Contact Support &rarr;
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
