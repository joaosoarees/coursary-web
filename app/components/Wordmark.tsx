export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 34 34" aria-hidden="true">
        <rect
          x="1.5"
          y="5.5"
          width="31"
          height="21"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M7 20 C 11 16, 14 18, 18 14"
          fill="none"
          className="stroke-chalk-yellow"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M10 30.5 h14"
          className="stroke-shell-muted"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-2xl font-extrabold tracking-tight">
        Coursary
      </span>
    </span>
  );
}
