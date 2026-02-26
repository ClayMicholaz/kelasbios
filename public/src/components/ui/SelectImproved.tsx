import { SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  variant?: "default" | "compact";
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      children,
      onChange,
      label,
      error,
      variant = "default",
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      // Base styles
      "relative w-full rounded-lg border bg-white text-gray-900 transition-all duration-200",
      "appearance-none",
      // Variant-specific styles
      variant === "default"
        ? [
            "h-11 px-4 py-2 text-sm pr-12",
            "border-gray-300 shadow-sm",
            "hover:border-gray-400",
            "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none",
          ]
        : [
            "h-9 px-3 py-1 text-sm pr-10",
            "border-gray-300",
            "hover:border-gray-400",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none",
          ],
      // State styles
      {
        "border-red-300 focus:border-red-500 focus:ring-red-100": error,
        "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200": disabled,
        "hover:border-gray-400": !disabled && !error,
      },
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={baseClasses}
            ref={ref}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          {/* Custom arrow overlay untuk efek hover yang lebih baik */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={clsx(
                "w-4 h-4 transition-colors duration-200",
                disabled
                  ? "text-gray-400"
                  : "text-gray-500 group-hover:text-gray-700"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
