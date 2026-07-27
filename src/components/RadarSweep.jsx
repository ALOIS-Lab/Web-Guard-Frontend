import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SIZE = 200;
const CENTER = SIZE / 2;
const BLIP = 8;
/** Keep blips inside the outermost ring */
const MIN_R = 28;
const MAX_R = 78;

/**
 * RadarSweep — circular live-status visualization.
 *
 * @param {{ sites: Array<{ id: string|number, url: string, status: string, response_ms?: number|null }> }} props
 */
export default function RadarSweep({ sites = [] }) {
  const navigate = useNavigate();
  const [hoverId, setHoverId] = useState(null);

  const blips = useMemo(() => positionBlips(sites), [sites]);
  const hovered = blips.find((b) => b.id === hoverId);

  return (
    <div className="radar-sweep-wrap relative inline-flex select-none" style={{ width: SIZE, height: SIZE }}>
      <div className="radar-sweep" aria-label="Live website status radar" role="img">
        <div className="radar-sweep__rings" aria-hidden="true" />
        <div className="radar-sweep__beam" aria-hidden="true" />

        {blips.map((blip) => {
          const isDown = blip.status === 'down';
          const isSlow = blip.status === 'slow';
          const isChecking = blip.status === 'checking';
          const tone = isDown ? 'down' : isSlow ? 'slow' : isChecking ? 'checking' : 'healthy';

          return (
            <button
              key={blip.id}
              type="button"
              className={`radar-sweep__blip radar-sweep__blip--${tone}`}
              style={{
                left: blip.x,
                top: blip.y,
                width: BLIP,
                height: BLIP,
              }}
              title={`${blip.url} — ${blip.status}`}
              aria-label={`${blip.url}, status ${blip.status}`}
              onMouseEnter={() => setHoverId(blip.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(blip.id)}
              onBlur={() => setHoverId(null)}
              onClick={() => navigate(`/app/websites/${blip.id}`)}
            />
          );
        })}
      </div>

      {hovered && (
        <div
          className="radar-sweep__tooltip"
          style={{
            left: Math.min(SIZE - 8, Math.max(8, hovered.x)),
            top: Math.max(8, hovered.y - 14),
          }}
          role="tooltip"
        >
          <span className="radar-sweep__tooltip-url">{hovered.url}</span>
          <span className={`radar-sweep__tooltip-status radar-sweep__tooltip-status--${hovered.status}`}>
            {hovered.status}
          </span>
        </div>
      )}
    </div>
  );
}

function positionBlips(sites) {
  const n = sites.length;
  if (!n) return [];

  const times = sites
    .map((s) => (typeof s.response_ms === 'number' ? s.response_ms : null))
    .filter((t) => t != null);
  const minT = times.length ? Math.min(...times) : 0;
  const maxT = times.length ? Math.max(...times) : 0;

  return sites.map((site, index) => {
    const angle = (index / n) * Math.PI * 2 - Math.PI / 2;
    let radius = (MIN_R + MAX_R) / 2;

    if (typeof site.response_ms === 'number' && maxT > minT) {
      // Faster response → closer to center
      const t = (site.response_ms - minT) / (maxT - minT);
      radius = MIN_R + t * (MAX_R - MIN_R);
    } else if (typeof site.response_ms === 'number') {
      radius = MIN_R + 20;
    } else {
      // No latency data — slight ring variance by index so blips don't stack
      radius = MIN_R + 18 + (index % 3) * 12;
    }

    const x = CENTER + Math.cos(angle) * radius - BLIP / 2;
    const y = CENTER + Math.sin(angle) * radius - BLIP / 2;

    return {
      id: site.id,
      url: site.url,
      status: site.status || 'checking',
      response_ms: site.response_ms ?? null,
      x,
      y,
    };
  });
}
