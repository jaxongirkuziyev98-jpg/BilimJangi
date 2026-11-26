import { QuestionVisualId } from '../shared/types';

interface QuestionVisualProps {
  visualId: QuestionVisualId;
  zoomed?: boolean;
  className?: string;
}

export function QuestionVisual({
  visualId,
  zoomed = false,
  className = '',
}: QuestionVisualProps) {
  const renderArtwork = () => {
    switch (visualId) {
      case 'limewater_co2':
        // Matches reference lab apparatus (image_28e77e4c.png): beaker with limewater + bubbling tube + clamped flask
        return (
          <svg viewBox="0 0 280 175" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="co2Tube" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
              <linearGradient id="flaskWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#7DD3FC" />
              </linearGradient>
            </defs>
            {/* Stand Base & Rod */}
            <rect x="165" y="148" width="90" height="10" rx="3" fill="#475569" />
            <rect x="234" y="25" width="7" height="125" rx="2" fill="#94A3B8" />
            {/* Clamp holding flask */}
            <rect x="195" y="64" width="42" height="6" rx="2" fill="#64748B" />
            <rect x="188" y="59" width="12" height="15" rx="3" fill="#475569" />
            {/* Conical Erlenmeyer Flask */}
            <path
              d="M185 52 L203 52 L203 74 L224 126 Q226 135 215 137 L173 137 Q162 135 164 126 L185 74 Z"
              fill="#F0F9FF"
              stroke="#64748B"
              strokeWidth="2.5"
            />
            <path
              d="M174 106 L214 106 L223 126 Q224 134 214 135 L174 135 Q164 134 165 126 Z"
              fill="url(#flaskWater)"
              opacity="0.85"
            />
            <circle cx="187" cy="122" r="2.5" fill="#FFF" opacity="0.9" />
            <circle cx="198" cy="116" r="2" fill="#FFF" opacity="0.9" />
            <circle cx="204" cy="126" r="3" fill="#FFF" opacity="0.8" />
            <rect x="184" y="45" width="20" height="8" rx="2" fill="#64748B" />

            {/* Left Gas Delivery Tube */}
            <path
              d="M10 132 C38 132, 48 92, 66 54"
              fill="none"
              stroke="url(#co2Tube)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Connecting Arch Tube */}
            <path
              d="M84 54 C105 18, 175 18, 194 46"
              fill="none"
              stroke="url(#co2Tube)"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Left Beaker with Bubbling Limewater */}
            <path
              d="M52 62 L52 140 Q52 148 62 148 L96 148 Q106 148 106 140 L106 62"
              fill="#F8FAFC"
              stroke="#64748B"
              strokeWidth="2.5"
            />
            <path
              d="M54 92 L104 92 L104 139 Q104 146 95 146 L63 146 Q54 146 54 139 Z"
              fill="#E0F2FE"
            />
            {/* Rubber Stopper & Glass Dipping Tubes */}
            <rect x="57" y="52" width="44" height="12" rx="3" fill="#475569" />
            <rect x="69" y="64" width="4" height="62" fill="#CBD5E1" />
            <rect x="83" y="64" width="4" height="32" fill="#CBD5E1" />
            {/* Bubbles rising inside limewater */}
            <circle cx="71" cy="132" r="2.6" fill="#38BDF8" opacity="0.7" />
            <circle cx="74" cy="120" r="2" fill="#0284C7" opacity="0.6" />
            <circle cx="69" cy="108" r="2.8" fill="#38BDF8" opacity="0.7" />
            <text x="79" y="164" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0F172A">
              CO₂ + Ca(OH)₂
            </text>
          </svg>
        );

      case 'water_molecule':
        return (
          <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
            <line x1="110" y1="62" x2="62" y2="108" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
            <line x1="110" y1="62" x2="158" y2="108" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
            <circle cx="110" cy="60" r="30" fill="#EF4444" stroke="#B91C1C" strokeWidth="3" />
            <text x="110" y="67" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#FFF">
              O
            </text>
            <circle cx="60" cy="110" r="20" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
            <text x="60" y="116" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0F172A">
              H
            </text>
            <circle cx="160" cy="110" r="20" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
            <text x="160" y="116" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0F172A">
              H
            </text>
            <text x="110" y="142" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">
              104.5°
            </text>
          </svg>
        );

      case 'atom_bohr':
        return (
          <svg viewBox="0 0 200 160" className="w-full h-full" aria-hidden="true">
            <ellipse cx="100" cy="80" rx="72" ry="26" fill="none" stroke="#3B82F6" strokeWidth="2.5" transform="rotate(30 100 80)" />
            <ellipse cx="100" cy="80" rx="72" ry="26" fill="none" stroke="#8B5CF6" strokeWidth="2.5" transform="rotate(-30 100 80)" />
            <ellipse cx="100" cy="80" rx="72" ry="26" fill="none" stroke="#06B6D4" strokeWidth="2.5" transform="rotate(90 100 80)" />
            <circle cx="95" cy="76" r="9" fill="#EF4444" />
            <circle cx="106" cy="77" r="9" fill="#64748B" />
            <circle cx="99" cy="87" r="9" fill="#EF4444" />
            <circle cx="108" cy="85" r="8" fill="#94A3B8" />
            <circle cx="40" cy="46" r="6" fill="#2563EB" />
            <circle cx="160" cy="114" r="6" fill="#7C3AED" />
            <circle cx="100" cy="12" r="6" fill="#0891B2" />
          </svg>
        );

      case 'ph_scale':
        return (
          <svg viewBox="0 0 260 120" className="w-full h-full" aria-hidden="true">
            {[
              '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
              '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
              '#8B5CF6', '#A855F7', '#7E22CE',
            ].map((c, idx) => (
              <g key={idx}>
                <rect x={12 + idx * 15.8} y="38" width="14.5" height="36" rx="3" fill={c} />
                <text x={19 + idx * 15.8} y="88" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#475569">
                  {idx}
                </text>
              </g>
            ))}
            <polygon points="129,22 122,34 136,34" fill="#0F172A" />
            <text x="129" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#059669">
              pH = ?
            </text>
          </svg>
        );

      case 'gold_ingot':
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full" aria-hidden="true">
            <rect x="52" y="20" width="96" height="100" rx="14" fill="#FEF08A" stroke="#D97706" strokeWidth="4" />
            <text x="68" y="42" fontSize="14" fontWeight="bold" fill="#92400E">79</text>
            <text x="100" y="84" textAnchor="middle" fontSize="42" fontWeight="bold" fill="#78350F">?</text>
            <text x="100" y="106" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400E">196.97</text>
          </svg>
        );

      case 'ohm_circuit':
        return (
          <svg viewBox="0 0 240 140" className="w-full h-full" aria-hidden="true">
            <rect x="35" y="28" width="170" height="84" rx="10" fill="none" stroke="#334155" strokeWidth="4" />
            {/* Battery on left */}
            <rect x="27" y="54" width="16" height="32" fill="#F8FAFC" />
            <line x1="20" y1="62" x2="50" y2="62" stroke="#EF4444" strokeWidth="4" />
            <line x1="28" y1="78" x2="42" y2="78" stroke="#0F172A" strokeWidth="4" />
            {/* Resistor on top */}
            <rect x="86" y="18" width="68" height="20" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
            <text x="120" y="32" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400E">R</text>
            {/* Voltmeter / Ammeter */}
            <circle cx="120" cy="112" r="17" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3" />
            <text x="120" y="117" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1D4ED8">I, U</text>
          </svg>
        );

      case 'newton_force':
        return (
          <svg viewBox="0 0 240 140" className="w-full h-full" aria-hidden="true">
            <line x1="20" y1="110" x2="220" y2="110" stroke="#64748B" strokeWidth="4" />
            <rect x="50" y="54" width="64" height="54" rx="8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
            <text x="82" y="87" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#FFF">m</text>
            <line x1="118" y1="80" x2="188" y2="80" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
            <polygon points="204,80 182,68 182,92" fill="#EF4444" />
            <text x="155" y="64" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#DC2626">F = ?</text>
          </svg>
        );

      case 'magnet_poles':
        return (
          <svg viewBox="0 0 240 140" className="w-full h-full" aria-hidden="true">
            <path d="M55 44 C120 12, 120 12, 185 44" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 4" />
            <path d="M55 96 C120 128, 120 128, 185 96" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 4" />
            <rect x="44" y="48" width="76" height="44" rx="6" fill="#EF4444" />
            <rect x="120" y="48" width="76" height="44" rx="6" fill="#2563EB" />
            <text x="82" y="77" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#FFF">N</text>
            <text x="158" y="77" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#FFF">S</text>
          </svg>
        );

      case 'plant_cell':
        return (
          <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
            <rect x="28" y="20" width="164" height="110" rx="28" fill="#DCFCE7" stroke="#15803D" strokeWidth="6" />
            <rect x="38" y="30" width="144" height="90" rx="20" fill="#BBF7D0" stroke="#22C55E" strokeWidth="2" />
            <ellipse cx="75" cy="64" rx="22" ry="18" fill="#7E22CE" opacity="0.85" />
            <ellipse cx="140" cy="82" rx="34" ry="24" fill="#38BDF8" opacity="0.7" />
            <ellipse cx="72" cy="102" rx="14" ry="8" fill="#16A34A" />
            <ellipse cx="145" cy="46" rx="14" ry="8" fill="#16A34A" />
            <ellipse cx="108" cy="48" rx="12" ry="7" fill="#16A34A" />
          </svg>
        );

      case 'human_heart':
        return (
          <svg viewBox="0 0 180 150" className="w-full h-full" aria-hidden="true">
            <path d="M90 128 C35 94 28 52 54 34 C72 22 86 36 90 46 C94 36 108 22 126 34 C152 52 145 94 90 128 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="4" />
            <path d="M74 22 L74 42 M106 20 L106 42" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" />
            <path d="M90 50 L90 110 M62 72 L118 72" stroke="#FCA5A5" strokeWidth="3" strokeDasharray="4 3" />
          </svg>
        );

      case 'dna_helix':
        return (
          <svg viewBox="0 0 220 140" className="w-full h-full" aria-hidden="true">
            <path d="M30 40 Q75 100 110 70 T190 40" fill="none" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
            <path d="M30 100 Q75 40 110 70 T190 100" fill="none" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />
            {[50, 72, 148, 170].map((x, i) => (
              <line key={i} x1={x} y1="48" x2={x} y2="92" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            ))}
          </svg>
        );

      case 'earth_equator':
      case 'zoom_globe':
        return (
          <svg viewBox="0 0 180 150" className="w-full h-full" aria-hidden="true">
            <circle cx="90" cy="75" r="56" fill="#0EA5E9" stroke="#0369A1" strokeWidth="3" />
            <path d="M58 42 Q82 32 95 54 Q88 76 62 72 Z" fill="#22C55E" />
            <path d="M108 46 Q135 56 128 84 Q108 92 100 72 Z" fill="#22C55E" />
            <path d="M68 88 Q88 94 84 116 Q64 112 62 96 Z" fill="#22C55E" />
            <ellipse cx="90" cy="75" rx="56" ry="14" fill="none" stroke="#FACC15" strokeWidth="3" strokeDasharray="6 4" />
          </svg>
        );

      case 'ozone_shield':
        return (
          <svg viewBox="0 0 220 140" className="w-full h-full" aria-hidden="true">
            <circle cx="110" cy="135" r="70" fill="#38BDF8" />
            <path d="M25 110 Q110 42 195 110" fill="none" stroke="#8B5CF6" strokeWidth="10" opacity="0.65" />
            <line x1="55" y1="22" x2="78" y2="68" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <line x1="78" y1="68" x2="48" y2="54" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <line x1="165" y1="22" x2="142" y2="68" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <line x1="142" y1="68" x2="172" y2="54" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'compass_wind':
        return (
          <svg viewBox="0 0 180 150" className="w-full h-full" aria-hidden="true">
            <circle cx="90" cy="75" r="52" fill="#F8FAFC" stroke="#0F172A" strokeWidth="4" />
            <polygon points="90,28 100,75 80,75" fill="#EF4444" />
            <polygon points="90,122 100,75 80,75" fill="#3B82F6" />
            <circle cx="90" cy="75" r="6" fill="#0F172A" />
            <text x="90" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0F172A">N</text>
          </svg>
        );

      case 'binary_bits':
        return (
          <svg viewBox="0 0 220 140" className="w-full h-full" aria-hidden="true">
            <rect x="65" y="25" width="90" height="90" rx="14" fill="#1E293B" stroke="#6366F1" strokeWidth="4" />
            <text x="110" y="64" textAnchor="middle" fontSize="22" fontFamily="monospace" fontWeight="bold" fill="#38BDF8">1010</text>
            <text x="110" y="92" textAnchor="middle" fontSize="16" fontFamily="monospace" fontWeight="bold" fill="#A5B4FC">0101</text>
            {[40, 65, 90].map((y, i) => (
              <g key={i}>
                <line x1="42" y1={y} x2="65" y2={y} stroke="#6366F1" strokeWidth="4" />
                <line x1="155" y1={y} x2="178" y2={y} stroke="#6366F1" strokeWidth="4" />
              </g>
            ))}
          </svg>
        );

      case 'triangle_math':
        return (
          <svg viewBox="0 0 220 140" className="w-full h-full" aria-hidden="true">
            <polygon points="48,112 172,112 48,32" fill="#DBEAFE" stroke="#2563EB" strokeWidth="4" strokeLinejoin="round" />
            <rect x="48" y="96" width="16" height="16" fill="none" stroke="#2563EB" strokeWidth="2.5" />
            <text x="110" y="130" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1E40AF">b</text>
            <text x="34" y="74" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1E40AF">a</text>
            <text x="122" y="68" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#DC2626">c = ?</text>
          </svg>
        );

      case 'zoom_cat':
        // Ginger cat close-up inspired by image_915eb23a.png!
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#FED7AA" />
            {/* Fur stripes */}
            <path d="M0 30 Q90 55 180 25" stroke="#EA580C" strokeWidth="14" opacity="0.35" fill="none" />
            <path d="M0 70 Q90 85 180 65" stroke="#C2410C" strokeWidth="10" opacity="0.25" fill="none" />
            {/* Ear tips when zoomed out */}
            <polygon points="20,42 36,6 64,34" fill="#FB923C" />
            <polygon points="160,42 144,6 116,34" fill="#FB923C" />
            {/* Green cat eye */}
            <ellipse cx="90" cy="86" rx="34" ry="26" fill="#BEF264" stroke="#3F6212" strokeWidth="3" />
            <ellipse cx="90" cy="86" rx="9" ry="22" fill="#0F172A" />
            <circle cx="84" cy="76" r="5" fill="#FFF" />
            {/* Pink nose & whiskers */}
            <polygon points="78,128 102,128 90,142" fill="#FB7185" />
            <path d="M22 132 L66 135 M22 146 L66 142 M114 135 L158 132 M114 142 L158 146" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'zoom_sun':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#BAE6FD" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="90"
                y1="90"
                x2={90 + Math.cos((deg * Math.PI) / 180) * 74}
                y2={90 + Math.sin((deg * Math.PI) / 180) * 74}
                stroke="#F59E0B"
                strokeWidth="12"
                strokeLinecap="round"
              />
            ))}
            <circle cx="90" cy="90" r="46" fill="#FACC15" stroke="#EA580C" strokeWidth="4" />
            <circle cx="76" cy="82" r="5" fill="#92400E" />
            <circle cx="104" cy="82" r="5" fill="#92400E" />
            <path d="M76 102 Q90 114 104 102" stroke="#92400E" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );

      case 'zoom_moon':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#0F172A" />
            <circle cx="34" cy="34" r="2.5" fill="#FDE047" />
            <circle cx="145" cy="40" r="3" fill="#FDE047" />
            <circle cx="42" cy="144" r="2" fill="#FDE047" />
            <circle cx="90" cy="90" r="52" fill="#FDE047" />
            <circle cx="114" cy="76" r="44" fill="#0F172A" />
            <circle cx="64" cy="82" r="7" fill="#EAB308" opacity="0.6" />
            <circle cx="72" cy="112" r="5" fill="#EAB308" opacity="0.6" />
          </svg>
        );

      case 'zoom_leaf':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#ECFDF5" />
            <path d="M40 140 C38 62, 95 28, 146 34 C150 90, 118 144, 40 140 Z" fill="#22C55E" stroke="#15803D" strokeWidth="4" />
            <path d="M32 148 L134 46" stroke="#DCFCE7" strokeWidth="5" strokeLinecap="round" />
            <path d="M72 108 L64 76 M96 84 L88 54 M82 98 L112 104 M106 74 L132 80" stroke="#DCFCE7" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        );

      case 'zoom_key':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#EFF6FF" />
            <circle cx="56" cy="90" r="28" fill="none" stroke="#D97706" strokeWidth="12" />
            <line x1="84" y1="90" x2="152" y2="90" stroke="#D97706" strokeWidth="12" strokeLinecap="round" />
            <line x1="126" y1="90" x2="126" y2="116" stroke="#D97706" strokeWidth="10" strokeLinecap="round" />
            <line x1="146" y1="90" x2="146" y2="122" stroke="#D97706" strokeWidth="10" strokeLinecap="round" />
          </svg>
        );

      case 'zoom_apple':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#FEF2F2" />
            <path d="M90 52 C60 44, 34 70, 44 110 C52 142, 76 146, 90 138 C104 146, 128 142, 136 110 C146 70, 120 44, 90 52 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="4" />
            <path d="M90 52 Q92 32 102 24" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M92 38 Q122 24 128 46 Q106 54 92 38 Z" fill="#22C55E" />
            <ellipse cx="64" cy="84" rx="8" ry="16" fill="#FCA5A5" opacity="0.6" transform="rotate(-15 64 84)" />
          </svg>
        );

      case 'zoom_eye':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#F8FAFC" />
            <path d="M18 90 Q90 34 162 90 Q90 146 18 90 Z" fill="#FFF" stroke="#334155" strokeWidth="5" />
            <circle cx="90" cy="90" r="30" fill="#0284C7" />
            <circle cx="90" cy="90" r="14" fill="#0F172A" />
            <circle cx="80" cy="80" r="6" fill="#FFF" />
          </svg>
        );

      case 'zoom_rocket':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#1E1B4B" />
            <path d="M90 22 C116 52, 118 96, 108 124 L72 124 C62 96, 64 52, 90 22 Z" fill="#F8FAFC" />
            <path d="M72 96 L48 124 L72 124 Z" fill="#EF4444" />
            <path d="M108 96 L132 124 L108 124 Z" fill="#EF4444" />
            <circle cx="90" cy="72" r="14" fill="#38BDF8" stroke="#1E40AF" strokeWidth="4" />
            <polygon points="78,124 102,124 90,162" fill="#F97316" />
          </svg>
        );

      case 'zoom_crown':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#FFFBEB" />
            <polygon points="28,132 22,56 62,92 90,42 118,92 158,56 152,132" fill="#FACC15" stroke="#B45309" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="90" cy="102" r="10" fill="#EF4444" />
            <circle cx="52" cy="108" r="7" fill="#2563EB" />
            <circle cx="128" cy="108" r="7" fill="#10B981" />
          </svg>
        );

      case 'zoom_flask':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#ECFDF5" />
            <path d="M74 30 L106 30 L106 64 L142 134 Q146 146 132 146 L48 146 Q34 146 38 134 L74 64 Z" fill="#FFFFFF" stroke="#0F766E" strokeWidth="5" />
            <path d="M56 104 L124 104 L138 134 Q140 142 128 142 L52 142 Q40 142 42 134 Z" fill="#10B981" />
            <circle cx="80" cy="122" r="5" fill="#ECFDF5" />
            <circle cx="102" cy="114" r="4" fill="#ECFDF5" />
          </svg>
        );

      case 'zoom_clock':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#F1F5F9" />
            <circle cx="90" cy="90" r="56" fill="#FFFFFF" stroke="#0F172A" strokeWidth="7" />
            <line x1="90" y1="90" x2="90" y2="50" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <line x1="90" y1="90" x2="122" y2="106" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <circle cx="90" cy="90" r="6" fill="#0F172A" />
          </svg>
        );

      case 'zoom_magnet':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#EFF6FF" />
            <path d="M50 42 L50 100 A40 40 0 0 0 130 100 L130 42" fill="none" stroke="#EF4444" strokeWidth="26" strokeLinecap="butt" />
            <rect x="37" y="36" width="26" height="22" fill="#CBD5E1" />
            <rect x="117" y="36" width="26" height="22" fill="#CBD5E1" />
          </svg>
        );

      case 'zoom_diamond':
        return (
          <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
            <rect width="180" height="180" fill="#ECFEFF" />
            <polygon points="52,44 128,44 156,80 90,146 24,80" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" strokeLinejoin="round" />
            <polygon points="52,44 90,80 128,44" fill="#BAE6FD" />
            <polygon points="90,80 52,80 90,146" fill="#0EA5E9" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center ${className}`}
    >
      <div
        className={`w-full h-full transition-transform duration-500 ${
          zoomed ? 'scale-[1.75] origin-center' : 'scale-100'
        }`}
      >
        {renderArtwork()}
      </div>
    </div>
  );
}
