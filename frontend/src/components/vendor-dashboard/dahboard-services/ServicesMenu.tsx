import { ServicesMenuProps } from "@/types/serviceTypes";
import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import {
  FiInfo,
  FiShare2,
  FiImage,
  FiPackage,
  FiLayers,
  FiArrowLeft,
} from "react-icons/fi";

const ServicesMenu: React.FC<ServicesMenuProps> = ({
  setActiveSection,
  activeSection = "publicProfile",
}) => {
  const params = useParams();
  const id = params?.id;

  const menuItems = [
    {
      id: "publicProfile",
      label: "General",
      description: "Basic info & details",
      icon: FiInfo,
    },
    {
      id: "socialContact",
      label: "Social Links",
      description: "Social media & website",
      icon: FiShare2,
    },
    {
      id: "portfolio",
      label: "Photos & Media",
      description: "Banner & showcase gallery",
      icon: FiImage,
    },
    {
      id: "packages",
      label: "Packages",
      description: "Package tiers & pricing",
      icon: FiPackage,
    },
  ];

  return (
    <>
      {/* ── Mobile: horizontal tab strip (hidden on lg+) ── */}
      <div className="lg:hidden bg-white dark:bg-darkSurface shadow-sm border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden mb-1">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange/10 flex items-center justify-center text-orange shrink-0">
              <FiLayers className="text-sm" />
            </div>
            <span className="font-title font-bold text-sm text-gray-900 dark:text-zinc-100">
              Edit Sections
            </span>
          </div>

          <Link
            href={`/services/${id}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400 hover:text-orange transition-colors"
          >
            <FiArrowLeft className="text-xs" />
            <span>Back to Service</span>
          </Link>
        </div>

        <nav className="flex overflow-x-auto scrollbar-none font-body">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap text-xs font-semibold border-b-2 transition-all duration-150 flex-1 justify-center ${
                  isActive
                    ? "border-orange text-orange bg-orange/5 dark:bg-orange/10"
                    : "border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Icon className="text-sm flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Desktop: vertical sidebar (hidden below lg) ── */}
      <div className="hidden lg:block bg-white dark:bg-darkSurface shadow-sm border border-gray-100 dark:border-zinc-800 rounded-2xl p-6">
        <div className="mb-4">
          <Link
            href={`/services/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-orange transition-colors mb-3 group"
          >
            <FiArrowLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Service</span>
          </Link>

          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
              <FiLayers className="text-lg" />
            </div>
            <div>
              <h2 className="font-title font-bold text-xl text-gray-900 dark:text-zinc-100">
                Edit Service
              </h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Manage listing details
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 font-body">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? "bg-orange text-white shadow-md shadow-orange/20 font-medium"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-darkElevated hover:text-gray-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon
                  className={`text-lg flex-shrink-0 ${
                    isActive ? "text-white" : "text-gray-400 dark:text-zinc-500"
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-base font-semibold">{item.label}</span>
                  <span
                    className={`text-xs ${
                      isActive
                        ? "text-white/80"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default ServicesMenu;
