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
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-8 ${className}`}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-title text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100">
            {title}
          </h1>
          {badge}
        </div>
        <p className="hidden sm:block text-gray-500 dark:text-zinc-400 font-body text-sm mt-1 max-w-2xl">
          {subtitle}
        </p>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default VendorPageHeader;
