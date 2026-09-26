import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength = 2000, showCount = false, value, onChange, ...props }, ref) => {
    const currentLength = typeof value === "string" ? value.length : 0;
    const isNearLimit = maxLength ? currentLength >= maxLength * 0.9 : false;
    const isAtLimit = maxLength ? currentLength >= maxLength : false;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          className={cn(
            "flex min-h-[90px] w-full rounded-xl border border-orange/20 dark:border-zinc-700 bg-white dark:bg-darkElevated px-3 py-2 text-sm text-gray-800 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:border-orange focus:ring-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            isAtLimit && "border-red-400 dark:border-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {showCount && typeof maxLength === "number" && (
          <div className="flex justify-end items-center mt-1 text-xs">
            <span
              className={cn(
                "transition-colors font-medium font-body",
                isAtLimit
                  ? "text-red-500 font-semibold"
                  : isNearLimit
                  ? "text-amber-500"
                  : "text-gray-400 dark:text-zinc-500"
              )}
            >
              {currentLength} / {maxLength}
              {isAtLimit && " (Limit reached)"}
            </span>
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
