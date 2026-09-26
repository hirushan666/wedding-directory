import React from "react";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";
import { Metadata } from "next";
import { FiShield, FiMail, FiPhone, FiMapPin, FiCalendar, FiLock, FiCheck } from "react-icons/fi";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Say I Do collects, uses, and safeguards your personal information.",
};

const PrivacyPolicy = () => {
  const sections = [
    {
      id: "1",
      title: "Introduction",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          Welcome to <strong className="text-gray-900 dark:text-zinc-100 font-semibold">Say I Do</strong>. We are dedicated to respecting and protecting your privacy while ensuring that your personal data is handled securely and responsibly. This Privacy Policy details our practices concerning the collection, storage, utilization, and disclosure of your information when you browse our platform or use our wedding planning and vendor services.
        </p>
      ),
    },
    {
      id: "2",
      title: "Information We Collect",
      content: (
        <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          <p>We may collect information you provide directly or generate automatically when using our website and services:</p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Personal Identification:</strong> Name, email address, phone number, wedding date, and partner details.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Account Credentials:</strong> Securely hashed passwords, username, and profile preferences.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Booking & Payment Details:</strong> Transaction records, invoices, booking reference IDs, and payment statuses (processed securely via regulated payment gateways).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Planning Data:</strong> Wedding checklists, budget items, guest lists, and vendor messages.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Usage & Technical Data:</strong> IP address, browser type, device information, and interaction history.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "3",
      title: "How We Use Your Information",
      content: (
        <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          <p>Your information is used strictly to facilitate a smooth, personalized wedding planning experience:</p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>To provide, operate, and enhance wedding planning tools, checklists, budgeters, and vendor inquiries.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>To power hybrid AI and personalized vendor recommendations tailored to your style, budget, and location.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>To process vendor bookings, confirm appointments, and generate transaction receipts.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>To transmit critical service notices, security updates, and administrative notifications.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span>To protect our users against fraudulent, malicious, or unauthorized activity.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "4",
      title: "Sharing & Disclosure of Data",
      content: (
        <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          <p>We respect your personal privacy. We do not sell your personal data. We disclose information only under the following conditions:</p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span><strong className="text-gray-900 dark:text-zinc-100">Wedding Vendors:</strong> When you request quotes, book services, or message vendors, relevant planning details are shared to fulfill your request.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span><strong className="text-gray-900 dark:text-zinc-100">Service Providers:</strong> Verified third-party providers who support infrastructure, database hosting, analytics, and payment gateways.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 shrink-0" />
              <span><strong className="text-gray-900 dark:text-zinc-100">Legal Compliance:</strong> When required by statutory obligations, court orders, or governmental bodies in Sri Lanka.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "5",
      title: "Data Security & Retention",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          We implement industry-standard encryption, SSL protocols, and access controls to protect your data from unauthorized disclosure, theft, or misuse. Payment transactions are processed through tokenized, PCI-compliant gateways. We retain your information as long as your account remains active or as needed to comply with legal record-keeping obligations.
        </p>
      ),
    },
    {
      id: "6",
      title: "Your Rights & Preferences",
      content: (
        <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          <p>As a user of Say I Do, you are entitled to exercise the following rights regarding your data:</p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Access & Correction:</strong> Review and update your profile details and planning preferences directly via your account settings.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Data Deletion:</strong> Request full erasure of your account and personal records by contacting our support team.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <FiCheck size={12} />
              </span>
              <span><strong className="text-gray-900 dark:text-zinc-100">Communication Preferences:</strong> Opt out of promotional newsletters while continuing to receive essential transaction notices.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "7",
      title: "Policy Updates",
      content: (
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-zinc-300">
          We may revise this Privacy Policy periodically to reflect technological, operational, or legal developments. Updated versions will be published on this page with a revised effective date. Continued usage of Say I Do after updates constitute agreement to the terms.
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
            <FiShield size={28} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange/10 dark:bg-orange/20 text-orange border border-orange/20 mb-3">
            <FiCalendar size={13} />
            <span>Effective Date: October 12, 2024</span>
          </span>

          <h1 className="font-title text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-zinc-100 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-body text-xs sm:text-sm max-w-lg mx-auto">
            Your trust is our priority. Discover how Say I Do manages, secures, and respects your privacy.
          </p>
        </div>

        {/* Policy Content Card */}
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

          {/* Contact Support Box */}
          <div className="mt-8 pt-6 border-t border-orange/15 dark:border-zinc-800 bg-orange/[0.03] dark:bg-orange/[0.06] border border-orange/20 dark:border-orange/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-orange font-bold text-sm font-title">
                <FiLock size={16} />
                <span>Questions About Your Privacy?</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
                Our team is here to assist with any data inquiries or privacy concerns.
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
          <Link href="/terms-of-use" className="hover:text-orange transition-colors underline">
            Read our Terms of Use &rarr;
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

export default PrivacyPolicy;
