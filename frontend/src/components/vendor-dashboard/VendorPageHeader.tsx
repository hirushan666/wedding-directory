import React, { ReactNode } from "react";

interface VendorPageHeaderProps {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const VendorPageHeader: React.FC<VendorPageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-8 ${className}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="font-title text-xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 truncate">
            {title}
          </h1>
          {badge}
        </div>
        <p className="hidden sm:block text-gray-500 dark:text-zinc-400 font-body text-sm mt-1 max-w-2xl">
          {subtitle}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default VendorPageHeader;
