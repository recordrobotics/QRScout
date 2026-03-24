export function Logo() {
  return (
    <svg
      viewBox="0 0 220 52"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Record Robotics"
    >
      <defs>
        <linearGradient id="rr-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef3340" />
          <stop offset="100%" stopColor="#b31b1b" />
        </linearGradient>

        <linearGradient id="rr-grad-groove" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8222e" />
          <stop offset="100%" stopColor="#8b1515" />
        </linearGradient>
      </defs>

      <g transform="translate(4, 1)">
        <g transform="translate(25, 25)">
          <g opacity="1">
            <rect
              x="-2"
              y="-12"
              width="3"
              height="18"
              rx="1.5"
              fill="url(#rr-grad-main)"
            />
            <path
              d="M 1,-12 Q 12,-10 10,-2"
              fill="none"
              stroke="url(#rr-grad-main)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <ellipse
              cx="-4"
              cy="6"
              rx="5"
              ry="3.5"
              fill="url(#rr-grad-main)"
              transform="rotate(-20 -4 6)"
            />
          </g>
        </g>

        <text
          x="56"
          y="23"
          fontFamily="'SF Sports Night', 'Arial Black', sans-serif"
          fontSize="22"
          fontWeight="900"
          fill="url(#rr-grad-main)"
          letterSpacing="1.5"
        >
          RECORD
        </text>

        <text
          x="57"
          y="42"
          fontFamily="'SF Sports Night NS', Arial, sans-serif"
          fontSize="15"
          fontWeight="700"
          fill="url(#rr-grad-main)"
          fillOpacity="0.75"
          letterSpacing="5"
        >
          ROBOTICS
        </text>
      </g>
    </svg>
  );
}
