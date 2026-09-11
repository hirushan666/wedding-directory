import React from "react";
import { ServicesMenuProps } from "@/types/serviceTypes";
import { FiBriefcase, FiUser, FiLock, FiSettings } from "react-icons/fi";

const SettingsMenu: React.FC<ServicesMenuProps> = ({ setActiveSection, activeSection = "general" }) => {
  const menuItems = [
    {
      id: "general",
      label: "General",
      description: "Business details & location",
      icon: FiBriefcase,
    },
    {
      id: "profile",
      label: "Profile",
      description: "Personal info & photo",
      icon: FiUser,
    },
    {
      id: "account",
      label: "Account",
      description: "Email & security credentials",
      icon: FiLock,
    },
  ];

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
          <FiSettings className="text-lg" />
        </div>
        <div>
          <h2 className="font-title font-bold text-xl text-gray-900">Settings</h2>
          <p className="text-xs text-gray-400">Preferences & account</p>
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
              <Icon className={`text-lg flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={`text-[11px] ${isActive ? "text-white/80" : "text-gray-400"}`}>
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

export default SettingsMenu;
