'use client';

export type OniPose = 'idle' | 'punch' | 'hurt' | 'victory';

/**
 * Bold, chibi-style oni (Japanese ogre) mascot for the Arcade section.
 * Deliberately built from flat geometric shapes rather than fine detail —
 * reads clearly at a glance and holds up at both poster size and thumbnail
 * size, the way arcade-cabinet mascot art usually does.
 */
export function OniMascot({ pose = 'idle', className = '' }: { pose?: OniPose; className?: string }) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={`oni-mascot oni-pose-${pose} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* back fist (punch pose swings this one forward) */}
      <g className="oni-fist-back">
        <ellipse cx="230" cy="190" rx="34" ry="30" fill="#FFD400" stroke="#141018" strokeWidth="6" />
        <path d="M204 176 L256 176" stroke="#141018" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* body */}
      <ellipse cx="150" cy="215" rx="72" ry="58" fill="#E8283A" stroke="#141018" strokeWidth="7" />

      {/* head */}
      <circle cx="150" cy="128" r="82" fill="#E8283A" stroke="#141018" strokeWidth="7" />

      {/* horn */}
      <path d="M150 46 L134 84 L166 84 Z" fill="#FFF6E5" stroke="#141018" strokeWidth="6" strokeLinejoin="round" />

      {/* eyebrows */}
      <path d="M96 108 L134 122" stroke="#141018" strokeWidth="9" strokeLinecap="round" className="oni-brow-l" />
      <path d="M204 108 L166 122" stroke="#141018" strokeWidth="9" strokeLinecap="round" className="oni-brow-r" />

      {/* eyes */}
      <g className="oni-eyes">
        <circle cx="120" cy="132" r="11" fill="#141018" />
        <circle cx="180" cy="132" r="11" fill="#141018" />
      </g>
      {/* hurt eyes (x_x), hidden unless pose=hurt */}
      <g className="oni-eyes-hurt">
        <path d="M110 123 L130 141 M130 123 L110 141" stroke="#141018" strokeWidth="6" strokeLinecap="round" />
        <path d="M170 123 L190 141 M190 123 L170 141" stroke="#141018" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* mouth + fang */}
      <path d="M120 168 Q150 194 180 168" stroke="#141018" strokeWidth="8" fill="none" strokeLinecap="round" className="oni-mouth" />
      <path d="M140 170 L145 188 L152 170 Z" fill="#FFF6E5" stroke="#141018" strokeWidth="3" strokeLinejoin="round" />

      {/* cheeks */}
      <circle cx="104" cy="152" r="10" fill="#FF6B87" opacity="0.7" />
      <circle cx="196" cy="152" r="10" fill="#FF6B87" opacity="0.7" />

      {/* front fist (the one that leads the punch) */}
      <g className="oni-fist-front">
        <ellipse cx="70" cy="190" rx="36" ry="32" fill="#FFD400" stroke="#141018" strokeWidth="6" />
        <path d="M44 176 L96 176" stroke="#141018" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
