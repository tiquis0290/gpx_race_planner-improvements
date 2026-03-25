import { useMemo } from 'react';
import type { GpxPoint } from '../types';

const HEIGHT         = 235;
const PADDING_LEFT   = 55;
const PADDING_RIGHT  = 15;
const PADDING_TOP    = 10;
const PADDING_BOTTOM = 35;
const BASE_PX_PER_KM = 120;

export interface ElevationGeometry {
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  totalDist: number;
  chartW: number;
  chartH: number;
  minZoom: number;
  minElev: number;
  maxElev: number;
  toX: (dist: number) => number;
  toY: (elev: number) => number;
  pathData: string;
  xTicks: { x: number; label: string; major: boolean }[];
  yTicks: { y: number; v: number }[];
}

export function useElevationGeometry(
  points: GpxPoint[],
  zoom: number,
  containerWidth: number,
): ElevationGeometry {
  const totalDist = points.length > 0 ? (points[points.length - 1].distance || 1) : 1;
  const totalKm   = totalDist / 1000;
  const chartH    = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const minZoom   = totalKm > 0 ? (containerWidth - PADDING_RIGHT) / (totalKm * BASE_PX_PER_KM) : 1;
  const chartW    = Math.max(containerWidth - PADDING_RIGHT, totalKm * BASE_PX_PER_KM * zoom);

  const { minElev, maxElev } = useMemo(() => {
    if (points.length === 0) return { minElev: 0, maxElev: 100 };
    let min = Infinity, max = -Infinity;
    for (const p of points) {
      if (p.elevation < min) min = p.elevation;
      if (p.elevation > max) max = p.elevation;
    }
    const pad = (max - min) * 0.1 || 10;
    return { minElev: min - pad, maxElev: max + pad };
  }, [points]);

  const toX = (dist: number) => (dist / totalDist) * chartW;
  const toY = (elev: number) => PADDING_TOP + chartH - ((elev - minElev) / (maxElev - minElev)) * chartH;

  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    const line = points.map((p) => `${toX(p.distance)},${toY(p.elevation)}`).join(' L ');
    const bottom = PADDING_TOP + chartH;
    return `M ${toX(0)},${bottom} L ${line} L ${toX(totalDist)},${bottom} Z`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, minElev, maxElev, totalDist, chartW]);

  const pxPerKm = BASE_PX_PER_KM * zoom;
  const use100m = pxPerKm >= 300;

  const xTicks = useMemo(() => {
    const ticks: { x: number; label: string; major: boolean }[] = [];
    if (use100m) {
      const total100m = Math.floor(totalDist / 100);
      for (let i = 0; i <= total100m; i++) {
        const distM = i * 100;
        const major = i % 10 === 0;
        const label = major ? `${distM / 1000} km` : '';
        ticks.push({ x: toX(distM), label, major });
      }
    } else {
      const totalKmFloor = Math.floor(totalDist / 1000);
      for (let km = 0; km <= totalKmFloor; km++) {
        ticks.push({ x: toX(km * 1000), label: `${km} km`, major: true });
      }
    }
    return ticks;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDist, chartW, use100m]);

  const yTicks = useMemo(() => {
    const range = maxElev - minElev;
    const step = Math.ceil(range / 5 / 10) * 10 || 10;
    const ticks = [];
    const startVal = Math.ceil(minElev / step) * step;
    for (let v = startVal; v <= maxElev; v += step) ticks.push({ y: toY(v), v: Math.round(v) });
    return ticks;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minElev, maxElev]);

  return {
    height: HEIGHT,
    paddingLeft: PADDING_LEFT,
    paddingRight: PADDING_RIGHT,
    paddingTop: PADDING_TOP,
    paddingBottom: PADDING_BOTTOM,
    totalDist,
    chartW,
    chartH,
    minZoom,
    minElev,
    maxElev,
    toX,
    toY,
    pathData,
    xTicks,
    yTicks,
  };
}
