/**
 * Paint tool icons — small 16×16 pictures in the XP Paint style.
 * @param {{ id: string, size?: number }} props
 */
export default function ToolIcon({ id, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden
      className="block"
      stroke="#000"
      strokeWidth="0.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {ICONS[id] ?? null}
    </svg>
  )
}

const ICONS = {
  pencil: (
    <g transform="rotate(45 8 8)">
      <rect x="6.5" y="1" width="3" height="1.6" fill="#e88a8a" />
      <rect x="6.5" y="2.6" width="3" height="7.4" fill="#f5d33c" />
      <polygon points="6.5,10 9.5,10 8,13.6" fill="#f2d2b0" />
      <polygon points="7.2,12.4 8.8,12.4 8,13.6" fill="#000" />
    </g>
  ),
  brush: (
    <g>
      <path d="M2.2 13.8 L8 8" stroke="#8b5a2b" strokeWidth="2" fill="none" />
      <path d="M7.4 8.6 L9.6 6.4" stroke="#bfbfbf" strokeWidth="2.6" fill="none" />
      <path d="M9 6.9 Q10.6 3.2 13.8 2.2 Q13.2 5.2 10.2 7.6 Z" fill="#2b6fd6" />
    </g>
  ),
  airbrush: (
    <g>
      <rect x="2.5" y="8" width="5" height="6" rx="1" fill="#c0c0c0" />
      <path d="M7.5 8.5 L7.5 5 L11 5 L12.5 6.4 L11 7.4 L7.5 7.4" fill="#e6e6e6" />
      <path d="M4.5 8 L4.5 5.5" stroke="#000" fill="none" />
      <circle cx="13.6" cy="2.4" r="0.7" fill="#000" />
      <circle cx="14.4" cy="4.6" r="0.6" fill="#000" />
      <circle cx="11.8" cy="1.6" r="0.5" fill="#000" />
      <circle cx="10.6" cy="3.2" r="0.5" fill="#000" />
    </g>
  ),
  eraser: (
    <g strokeWidth="0.6">
      <polygon points="3.5,6.2 10,3 14.2,5 7.6,8.2" fill="#ffffff" />
      <polygon points="3.5,6.2 7.6,8.2 7.6,13 3.5,11" fill="#d9534f" />
      <polygon points="7.6,8.2 14.2,5 14.2,10 7.6,13" fill="#f08a7e" />
    </g>
  ),
  fill: (
    <g>
      <path d="M2.2 7.2 L8 4.4 L11.2 8.6 L5.4 11.6 Z" fill="#c0c0c0" />
      <path d="M4.6 6.2 Q5.4 2.2 8.9 3.6" fill="none" strokeWidth="1" />
      <path
        d="M11.2 9.2 Q12.9 10.2 12.4 12.2 Q13.9 12.8 13.4 14.4 Q11.4 15.2 10.8 13.2 Q9.6 11.2 11.2 9.2 Z"
        fill="#2b6fd6"
        stroke="none"
      />
      <ellipse cx="11.8" cy="14.6" rx="2.6" ry="1" fill="#2b6fd6" stroke="none" />
    </g>
  ),
  eyedropper: (
    <g>
      <path d="M3 13 L9.2 6.8" stroke="#555" strokeWidth="2" fill="none" />
      <ellipse cx="10.8" cy="5.2" rx="1.6" ry="2.6" transform="rotate(45 10.8 5.2)" fill="#ffffff" />
      <circle cx="2.4" cy="13.6" r="0.9" fill="#000" />
    </g>
  ),
  magnify: (
    <g>
      <circle cx="6.8" cy="6.8" r="4.4" fill="#cfe8ff" />
      <path d="M10 10 L14 14" stroke="#7a4a1e" strokeWidth="2" fill="none" />
    </g>
  ),
  hand: (
    <path
      d="M4 14 L4 8.6 L2.8 7.4 L4.2 6.6 L5.4 8.2 L5.4 3.8 Q5.4 3 6.2 3 Q7 3 7 3.8 L7 7.6 L7.4 3.2 Q7.4 2.4 8.2 2.4 Q9 2.4 9 3.2 L9 7.6 L9.6 4.2 Q9.8 3.5 10.6 3.6 Q11.4 3.8 11.2 4.6 L10.9 8.2 L12.4 6.4 Q13 5.8 13.6 6.4 Q14 7 13.4 7.8 L12.4 10 L12.2 14 Z"
      fill="#f5c28b"
    />
  ),
  text: (
    <text x="8" y="13" fontSize="12" fontWeight="bold" fontFamily="serif" textAnchor="middle" stroke="none" fill="#000">
      A
    </text>
  ),
  line: <path d="M2 13.5 L14 2.5" stroke="#000" strokeWidth="1.6" fill="none" />,
  rect: <rect x="2.5" y="4" width="11" height="8" fill="none" />,
  ellipse: <ellipse cx="8" cy="8" rx="6" ry="4.6" fill="none" />,
}
