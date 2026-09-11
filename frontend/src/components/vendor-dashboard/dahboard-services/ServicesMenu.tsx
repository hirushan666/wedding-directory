import { ServicesMenuProps } from "@/types/serviceTypes";
import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import {
  FiInfo,
  FiShare2,
  FiImage,
  FiPackage,
  FiSettings,
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
    {
      id: "serviceSettings",
      label: "Settings",
      description: "Service options & visibility",
      icon: FiSettings,
    },
  ];

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
      <div className="mb-4">
        <Link
          href={`/services/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange transition-colors mb-3 group"
        >
          <FiArrowLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Service</span>
        </Link>

        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
            <FiLayers className="text-lg" />
          </div>
          <div>
            <h2 className="font-title font-bold text-xl text-gray-900">Edit Service</h2>
            <p className="text-xs text-gray-400">Manage listing details</p>
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
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`text-lg flex-shrink-0 ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span
                  className={`text-[11px] ${
                    isActive ? "text-white/80" : "text-gray-400"
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
  );
};

export default ServicesMenu;
