import React from "react";

interface GrownoxAiAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnlineStatus?: boolean;
  statusOnline?: boolean;
}

export function GrownoxAiAvatar({
  size = "md",
  className = "",
  showOnlineStatus = false,
  statusOnline = true,
}: GrownoxAiAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 rounded-md",
    sm: "w-8 h-8 rounded-lg",
    md: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl",
    lg: "w-12 h-12 rounded-xl",
    xl: "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl",
  };

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const dotSizes = {
    xs: "w-2 h-2 -bottom-0.5 -right-0.5",
    sm: "w-2.5 h-2.5 -bottom-0.5 -right-0.5 border-[1.5px]",
    md: "w-3.5 h-3.5 -bottom-0.5 -right-0.5 border-2",
    lg: "w-3.5 h-3.5 -bottom-0.5 -right-0.5 border-2",
    xl: "w-4 h-4 -bottom-1 -right-1 border-2",
  };

  return (
    <div className="relative inline-flex flex-shrink-0 items-center justify-center">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-tr from-[#2E7D32] to-[#66BB6A] text-white flex items-center justify-center shadow-xs flex-shrink-0 ${className}`}
        aria-label="Grownox AI Avatar"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSizes[size]} text-white`}
        >
          {/* Outer Agricultural Arc / Canopy */}
          <path
            d="M4.5 12C4.5 7.85786 7.85786 4.5 12 4.5C14.0711 4.5 15.9461 5.33946 17.3033 6.6967"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Main Stem with Leaf Pair */}
          <path
            d="M12 20V10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Left Leaf */}
          <path
            d="M12 14.5C10 14.5 7.8 13.2 7.8 11C7.8 9.2 10.2 9.5 12 11.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Leaf */}
          <path
            d="M12 12.8C14 12.8 16.2 11.5 16.2 9.3C16.2 7.5 13.8 7.8 12 9.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* AI Sparkle / Star Node at Top Right */}
          <path
            d="M19.5 3.5L20.1 5.2L21.8 5.8L20.1 6.4L19.5 8.1L18.9 6.4L17.2 5.8L18.9 5.2L19.5 3.5Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {showOnlineStatus && (
        <span
          className={`absolute ${dotSizes[size]} ${
            statusOnline ? "bg-[#15803D]" : "bg-zinc-400"
          } border-white rounded-full shadow-xs`}
          title={statusOnline ? "Grownox AI Online" : "Grownox AI Offline"}
        />
      )}
    </div>
  );
}
