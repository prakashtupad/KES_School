import React, { useId } from 'react';

let htmlUidCounter = 0;

/**
 * Pure vector SVG Official Institutional Rubber Stamp Seal (No raster image required).
 * Renders crisp concentric Navy rings, curved circular text, open book + knowledge lamp,
 * "KHANATTI (MUDALGI TQ)", and "ESTD. 2025".
 */
function buildOfficialStampSvgInner(uid) {
  const topArcId = `kes-stamp-top-${uid}`;
  const bottomArcId = `kes-stamp-bot-${uid}`;

  return `
    <defs>
      <path id="${topArcId}" d="M 18,64 A 46,46 0 1,1 110,64" fill="none" />
      <path id="${bottomArcId}" d="M 112,66 A 48,48 0 1,1 16,66" fill="none" />
    </defs>

    <!-- Concentric Rubber Stamp Rings -->
    <circle cx="64" cy="64" r="61" fill="#ffffff" fill-opacity="0.88" stroke="#1A365D" stroke-width="2.4" />
    <circle cx="64" cy="64" r="57.5" fill="none" stroke="#1A365D" stroke-width="0.9" />
    <circle cx="64" cy="64" r="39.5" fill="none" stroke="#1A365D" stroke-width="1.35" />

    <!-- Side Separator Dots -->
    <circle cx="14.5" cy="64" r="1.8" fill="#1A365D" />
    <circle cx="113.5" cy="64" r="1.8" fill="#1A365D" />

    <!-- Top Curved Text -->
    <text font-family="Arial, Helvetica, sans-serif" font-size="6.9" font-weight="700" fill="#1A365D" letter-spacing="0.9">
      <textPath href="#${topArcId}" startOffset="50%" text-anchor="middle">KHANATTI EDUCATION SOCIETY&apos;S</textPath>
    </text>

    <!-- Bottom Curved Text -->
    <text font-family="Arial, Helvetica, sans-serif" font-size="5.35" font-weight="700" fill="#1A365D" letter-spacing="0.45">
      <textPath href="#${bottomArcId}" startOffset="50%" text-anchor="middle">SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL</textPath>
    </text>

    <!-- Inner Top Location -->
    <text x="64" y="38.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="6.6" font-weight="800" fill="#1A365D" letter-spacing="0.5">KHANATTI</text>
    <text x="64" y="45.8" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="5.4" font-weight="700" fill="#1A365D" letter-spacing="0.3">(MUDALGI TQ)</text>

    <!-- Center Emblem: Knowledge Flame (Jyoti) & Open Book -->
    <!-- Flame -->
    <path d="M64 49.5 C66.8 53.5, 67.5 57, 64 60.2 C60.5 57, 61.2 53.5, 64 49.5 Z" fill="#1A365D" />
    <path d="M64 53.2 C65.2 55.2, 65.4 57.2, 64 58.6 C62.6 57.2, 62.8 55.2, 64 53.2 Z" fill="#ffffff" />
    <!-- Lamp Bowl -->
    <path d="M56.5 62.5 Q64 60.5 71.5 62.5 Q69.5 68.2 64 68.8 Q58.5 68.2 56.5 62.5 Z" fill="#1A365D" />
    <!-- Open Book Pages -->
    <path d="M47 64 C52.5 62, 58.5 63.5, 64 67.5 C69.5 63.5, 75.5 62, 81 64 L81 79.5 C75.5 77.5, 69.5 79, 64 82.2 C58.5 79, 52.5 77.5, 47 79.5 Z" fill="none" stroke="#1A365D" stroke-width="1.9" stroke-linejoin="round" />
    <line x1="64" y1="67.5" x2="64" y2="82.2" stroke="#1A365D" stroke-width="1.5" />
    <path d="M50.5 68.5 Q56 67.5 61 70.5 M50.5 72.5 Q56 71.5 61 74.5 M50.5 76.2 Q56 75.2 61 78" fill="none" stroke="#1A365D" stroke-width="0.9" stroke-linecap="round" />
    <path d="M77.5 68.5 Q72 67.5 67 70.5 M77.5 72.5 Q72 71.5 67 74.5 M77.5 76.2 Q72 75.2 67 78" fill="none" stroke="#1A365D" stroke-width="0.9" stroke-linecap="round" />

    <!-- Inner Bottom Est. -->
    <text x="64" y="93.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="6.1" font-weight="800" fill="#1A365D" letter-spacing="0.6">ESTD. 2025</text>
  `;
}

/**
 * Clean cursive handwritten signature SVG for "Mahesh Tuppad" in Navy Ink (#1A365D).
 */
function buildSignatureSvgInner() {
  return `
    <g transform="rotate(-3.5 96 20)">
      <text
        x="4"
        y="28"
        font-family="'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', 'Snell Roundhand', Georgia, cursive"
        font-size="22"
        font-style="italic"
        font-weight="600"
        fill="#1A365D"
        letter-spacing="-0.3"
      >Mahesh Tuppad</text>
      <path d="M8 34 C58 29, 128 28, 184 31" fill="none" stroke="#1A365D" stroke-width="1.35" stroke-linecap="round" opacity="0.85" />
    </g>
  `;
}

/**
 * Reusable Pure-SVG Official Digital Signature, Circular Rubber Stamp & Verified Emblem
 * for Fee Receipts, Digital Marks Cards, Admission Profiles, and Certificates.
 */
export default function OfficialDigitalSignature({
  compact = false,
  size,
  className = '',
}) {
  const reactUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const resolvedSize = size || (compact ? 'compact' : 'default');

  if (resolvedSize === 'mini') {
    return (
      <div className={`inline-flex items-center gap-1 select-none mb-0.5 ${className}`}>
        <svg
          viewBox="0 0 128 128"
          width={28}
          height={28}
          className="flex-shrink-0 opacity-95"
          aria-label="Khanatti Education Society Official Seal"
          dangerouslySetInnerHTML={{ __html: buildOfficialStampSvgInner(reactUid) }}
        />
        <div className="text-center leading-none -ml-1">
          <svg
            viewBox="0 0 194 40"
            className="w-[70px] h-[15px] block mx-auto overflow-visible"
            aria-label="Digital signature of Mahesh Tuppad"
            dangerouslySetInnerHTML={{ __html: buildSignatureSvgInner() }}
          />
          <div className="text-[6.2px] font-bold text-[#1A365D] tracking-tight leading-none mt-0.5">
            Mahesh Tuppad
          </div>
          <div className="text-[4.8px] font-semibold uppercase tracking-wide text-slate-600 leading-none mt-[1px]">
            CHAIRMAN • KES KHANATTI
          </div>
        </div>
      </div>
    );
  }

  const isCompact = resolvedSize === 'compact';
  const stampSize = isCompact ? 54 : 70;

  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${
        isCompact ? 'mb-1' : 'mb-1.5'
      } ${className}`}
    >
      {/* 1. Pure Vector SVG Circular Institutional Stamp */}
      <svg
        viewBox="0 0 128 128"
        width={stampSize}
        height={stampSize}
        className="flex-shrink-0 opacity-95"
        aria-label="Khanatti Education Society Official Seal"
        dangerouslySetInnerHTML={{ __html: buildOfficialStampSvgInner(reactUid) }}
      />

      {/* 2. Handwritten Signature & Signatory Designation */}
      <div className="text-center leading-tight -ml-2">
        <svg
          viewBox="0 0 194 40"
          className={`${isCompact ? 'w-32 h-7' : 'w-36 sm:w-40 h-8'} block mx-auto overflow-visible`}
          aria-label="Digital signature of Mahesh Tuppad"
          dangerouslySetInnerHTML={{ __html: buildSignatureSvgInner() }}
        />
        <div className="text-[10.5px] font-bold text-[#1A365D] tracking-tight leading-tight">
          Mahesh Tuppad
        </div>
        <div className="text-[7.5px] font-semibold uppercase tracking-wider text-slate-600 leading-tight">
          CHAIRMAN / AUTHORIZED SIGNATORY
        </div>
        <div className="text-[7px] font-semibold uppercase tracking-wide text-slate-500 leading-tight">
          KHANATTI EDUCATION SOCIETY • KES KHANATTI
        </div>
      </div>

      {/* 3. Compact Verified Trust Badge (visible on standard/non-compact layouts) */}
      {!isCompact && (
        <div className="hidden sm:flex flex-col items-start pl-2 border-l border-slate-200/80 text-left leading-tight">
          <span className="text-[7px] font-extrabold uppercase tracking-wider text-[#1A365D] mb-0.5">
            DIGITALLY SIGNED &amp; VERIFIED
          </span>
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
              <circle cx="10" cy="10" r="9.5" fill="#059669" />
              <path
                d="M5.8 10.2 L8.7 13.1 L14.4 7.3"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-[7px] text-slate-600 leading-tight">
              <div className="font-mono font-semibold text-slate-700">Reg: DRBG/SOR/1243</div>
              <div className="font-semibold text-emerald-700">Authenticity Verified</div>
            </div>
          </div>
          <div className="w-full h-[1.5px] bg-gradient-to-r from-[#D97706]/80 via-[#F59E0B] to-transparent mt-1 rounded-full" />
        </div>
      )}
    </div>
  );
}

/**
 * Self-contained pure-SVG inline-styled HTML snippet for browser popup print templates
 * (A4 Fee Receipt Counterfoils, Digital Report Card Print, Admission Summary Print).
 */
export function getOfficialDigitalSignatureHtml(_logoSrc, { compact = false } = {}) {
  htmlUidCounter += 1;
  const uid = `html-${htmlUidCounter}`;
  const stampSize = compact ? 54 : 66;
  const sigW = compact ? 132 : 154;
  const sigH = compact ? 27 : 32;

  return `
    <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:4px;user-select:none;">
      <svg viewBox="0 0 128 128" width="${stampSize}" height="${stampSize}" style="display:block;flex-shrink:0;opacity:0.95;">
        ${buildOfficialStampSvgInner(uid)}
      </svg>
      <div style="text-align:center;line-height:1.15;margin-left:-6px;">
        <svg viewBox="0 0 194 40" width="${sigW}" height="${sigH}" style="display:block;margin:0 auto;overflow:visible;">
          ${buildSignatureSvgInner()}
        </svg>
        <div style="font-family:Arial,sans-serif;font-size:${compact ? '9.5px' : '10.5px'};font-weight:700;color:#1A365D;letter-spacing:-0.2px;line-height:1.15;">
          Mahesh Tuppad
        </div>
        <div style="font-family:Arial,sans-serif;font-size:${compact ? '6.8px' : '7.5px'};font-weight:600;text-transform:uppercase;letter-spacing:0.35px;color:#475569;line-height:1.15;">
          CHAIRMAN / AUTHORIZED SIGNATORY
        </div>
        <div style="font-family:Arial,sans-serif;font-size:${compact ? '6.4px' : '7px'};font-weight:600;text-transform:uppercase;color:#047857;line-height:1.15;">
          KES KHANATTI • DIGITALLY VERIFIED
        </div>
      </div>
    </div>
  `;
}

/**
 * Draws the pure-vector Circular Institutional Rubber Stamp + Handwritten "Mahesh Tuppad"
 * Signature + Verified Designation directly onto an HTML5 Canvas (zero external images).
 */
export function drawOfficialDigitalSignatureOnCanvas(
  ctx,
  _logoImg,
  { centerX, baselineY, scale = 1 }
) {
  ctx.save();

  const sealRadius = 31 * scale;
  const blockWidth = 278 * scale;
  const startX = centerX - blockWidth / 2;
  const sealX = startX + sealRadius + 2 * scale;
  const sealY = baselineY - sealRadius - 6 * scale;

  // 1. Vector Circular Rubber Stamp Seal
  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#1A365D';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, sealRadius - 2.6 * scale, 0, Math.PI * 2);
  ctx.lineWidth = 0.8 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, sealRadius - 10 * scale, 0, Math.PI * 2);
  ctx.lineWidth = 1.1 * scale;
  ctx.stroke();

  // Top & Bottom Arc Labels inside outer band (crisp micro-arc text)
  const drawArcText = (text, radius, startAngle, endAngle, isBottom) => {
    const chars = text.split('');
    const step = (endAngle - startAngle) / Math.max(1, chars.length - 1);
    ctx.fillStyle = '#1A365D';
    ctx.font = `bold ${4.8 * scale}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    chars.forEach((ch, i) => {
      const angle = startAngle + step * i;
      ctx.save();
      ctx.translate(sealX + Math.cos(angle) * radius, sealY + Math.sin(angle) * radius);
      ctx.rotate(angle + (isBottom ? -Math.PI / 2 : Math.PI / 2));
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  };

  drawArcText("KHANATTI EDUCATION SOCIETY'S", sealRadius - 6.2 * scale, -Math.PI * 0.86, -Math.PI * 0.14, false);
  drawArcText('SHRI SIDDHAROODHA EMS', sealRadius - 6.2 * scale, Math.PI * 0.84, Math.PI * 0.16, true);

  // Inner seal text + Open Book & Flame emblem
  ctx.fillStyle = '#1A365D';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold ${5.2 * scale}px Arial, sans-serif`;
  ctx.fillText('KHANATTI', sealX, sealY - 10 * scale);
  ctx.font = `bold ${4.1 * scale}px Arial, sans-serif`;
  ctx.fillText('(MUDALGI TQ)', sealX, sealY - 5 * scale);

  // Mini Flame & Open Book
  ctx.beginPath();
  ctx.moveTo(sealX, sealY - 3 * scale);
  ctx.quadraticCurveTo(sealX + 3 * scale, sealY + 1 * scale, sealX, sealY + 3.5 * scale);
  ctx.quadraticCurveTo(sealX - 3 * scale, sealY + 1 * scale, sealX, sealY - 3 * scale);
  ctx.fill();

  ctx.strokeStyle = '#1A365D';
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  ctx.moveTo(sealX - 10 * scale, sealY + 3 * scale);
  ctx.quadraticCurveTo(sealX - 4 * scale, sealY + 2 * scale, sealX, sealY + 5 * scale);
  ctx.quadraticCurveTo(sealX + 4 * scale, sealY + 2 * scale, sealX + 10 * scale, sealY + 3 * scale);
  ctx.lineTo(sealX + 10 * scale, sealY + 11 * scale);
  ctx.quadraticCurveTo(sealX + 4 * scale, sealY + 10 * scale, sealX, sealY + 12.5 * scale);
  ctx.quadraticCurveTo(sealX - 4 * scale, sealY + 10 * scale, sealX - 10 * scale, sealY + 11 * scale);
  ctx.closePath();
  ctx.stroke();

  ctx.font = `bold ${4.5 * scale}px Arial, sans-serif`;
  ctx.fillText('ESTD. 2025', sealX, sealY + 18 * scale);
  ctx.restore();

  // 2. Handwritten "Mahesh Tuppad" Signature + Designation
  const sigCenterX = sealX + sealRadius + 96 * scale;

  ctx.save();
  ctx.translate(sigCenterX, baselineY - 43 * scale);
  ctx.rotate((-3.5 * Math.PI) / 180);
  ctx.fillStyle = '#1A365D';
  ctx.textAlign = 'center';
  ctx.font = `italic 600 ${21 * scale}px "Segoe Script", "Brush Script MT", Georgia, cursive`;
  ctx.fillText('Mahesh Tuppad', 0, 0);
  ctx.strokeStyle = '#1A365D';
  ctx.lineWidth = 1.2 * scale;
  ctx.globalAlpha = 0.82;
  ctx.beginPath();
  ctx.moveTo(-74 * scale, 6 * scale);
  ctx.quadraticCurveTo(0, 2 * scale, 76 * scale, 4 * scale);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1A365D';
  ctx.font = `bold ${11.5 * scale}px Arial, sans-serif`;
  ctx.fillText('Mahesh Tuppad', sigCenterX, baselineY - 25 * scale);

  ctx.fillStyle = '#475569';
  ctx.font = `600 ${8.2 * scale}px Arial, sans-serif`;
  ctx.fillText('CHAIRMAN / AUTHORIZED SIGNATORY', sigCenterX, baselineY - 14.5 * scale);

  ctx.fillStyle = '#047857';
  ctx.font = `600 ${7.8 * scale}px Arial, sans-serif`;
  ctx.fillText('✓ KES KHANATTI • DIGITALLY VERIFIED', sigCenterX, baselineY - 4.5 * scale);

  ctx.restore();
}
