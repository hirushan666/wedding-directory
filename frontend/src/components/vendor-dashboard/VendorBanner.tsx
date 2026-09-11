import React from 'react'
import Image from 'next/image'
import { VendorProps } from '@/types/vendorTypes'
import Link from 'next/link'
import { FiSettings, FiMessageSquare, FiCreditCard, FiBarChart2, FiChevronRight } from 'react-icons/fi'
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

const VendorBanner = ({ vendor }: VendorProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 15) return "Good Afternoon";
    return "Good Evening";
  };

  const quickLinks = [
    {
      title: "Storefront & Settings",
      description: "Manage profile, banner, and bio",
      href: "/vendor-dashboard/settings",
      icon: FiSettings,
    },
    {
      title: "Client Chats & Inquiries",
      description: "Reply to customer messages",
      href: "/vendor-dashboard/chats",
      icon: FiMessageSquare,
    },
    {
      title: "Payments & Invoices",
      description: "Track earnings and transactions",
      href: "/vendor-dashboard/payments",
      icon: FiCreditCard,
    },
    {
      title: "Analytics & Views",
      description: "Check listing performance",
      href: "/vendor-dashboard/analytics",
      icon: FiBarChart2,
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col items-center text-center">
      {/* Profile Image with subtle ring */}
      <div className="relative mb-3">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-orange/10 overflow-hidden shadow-sm relative">
          <Image
            src={vendor?.profile_pic_url || vendor?.profilePic || '/images/visitorPlaceholder.png'}
            alt={vendor?.busname || 'Vendor profile'}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Greeting & Business Name */}
      <div className="mb-5">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-orange mb-1">
          {getGreeting()}, {vendor?.fname || 'Vendor'}!
        </span>
        <h2 className="font-title text-2xl font-bold text-gray-900 leading-tight">
          {vendor?.busname || 'Your Business'}
        </h2>
      </div>

      {/* Contact Details Card */}
      <div className="w-full bg-gray-50/70 border border-gray-100 rounded-xl p-3.5 mb-6 text-left flex flex-col gap-2.5 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center flex-shrink-0">
            <FaLocationDot size={13} />
          </div>
          <span className="truncate">{vendor?.city || "Location not provided"}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center flex-shrink-0">
            <FaPhoneAlt size={12} />
          </div>
          <span className="truncate">{vendor?.phone || "Phone not provided"}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center flex-shrink-0">
            <FaEnvelope size={12} />
          </div>
          <span className="truncate">{vendor?.email || "Email not provided"}</span>
        </div>
      </div>

      {/* Portal Quick Links */}
      <div className="w-full text-left">
        <h3 className="font-title text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
          Quick Links
        </h3>
        <div className="flex flex-col gap-2">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-orange/30 hover:bg-orange/5 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0 group-hover:bg-orange group-hover:text-white transition-colors">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-orange transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {item.description}
                    </div>
                  </div>
                </div>
                <FiChevronRight className="text-gray-400 group-hover:text-orange group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" size={16} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default VendorBanner
