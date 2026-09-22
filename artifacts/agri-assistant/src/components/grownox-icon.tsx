import React from "react";

export function GrownoxIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Curved outer circle segment symbolizing intelligence & growth */}
      <path
        d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.2 20.88 10.42 20.66 9.68"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Central Agricultural Sprout */}
      <path
        d="M12 18V10.5C12 10.5 9.2 8 9.2 11.2C9.2 13 10.4 14.2 12 14.2C13.6 14.2 14.8 13 14.8 11.2C14.8 8 12 10.5 12 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* AI Sparkle Star */}
      <path
        d="M18.5 2.5L19.2 4.6L21.3 5.3L19.2 6L18.5 8.1L17.8 6L15.7 5.3L17.8 4.6L18.5 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
