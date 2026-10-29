const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": true,
} as const;

export function ArrowIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...iconProps} width={14} height={14}>
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg {...iconProps}>
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}
