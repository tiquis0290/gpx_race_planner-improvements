import { useState, useMemo } from 'react';
import type { MouseEvent } from 'react';
import type { GpxPoint, Segment } from '../types';
import { useHoveredSegment } from '../contexts/HoveredSegment';

export function useElevationCursor(
  points: GpxPoint[],
  segments: Segment[],
  toY: (elev: number) => number,
  chartW: number,
  totalDist: number,
) {
  const { hoveredId, setHoveredId } = useHoveredSegment();
  const [cursorX, setCursorX] = useState<number | null>(null);

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const clampedX = Math.max(0, Math.min(chartW, svgX));
    setCursorX(clampedX);

    const dist = (clampedX / chartW) * totalDist;
    const nextHoveredId =
      segments.find((seg) => dist >= seg.startDistance && dist <= seg.endDistance)?.id ?? null;
    if (nextHoveredId !== hoveredId) setHoveredId(nextHoveredId);
  };

  const cursorDist = useMemo(() => {
    if (cursorX === null) return null;
    return (cursorX / chartW) * totalDist;
  }, [cursorX, chartW, totalDist]);

  const cursorElev = useMemo(() => {
    if (cursorDist === null || points.length === 0) return null;
    if (cursorDist <= points[0].distance) return points[0].elevation;
    if (cursorDist >= points[points.length - 1].distance) return points[points.length - 1].elevation;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i], p2 = points[i + 1];
      if (cursorDist >= p1.distance && cursorDist <= p2.distance) {
        const span = p2.distance - p1.distance;
        if (span <= 0) return p1.elevation;
        const frac = (cursorDist - p1.distance) / span;
        return p1.elevation + (p2.elevation - p1.elevation) * frac;
      }
    }
    return null;
  }, [cursorDist, points]);

  const cursorMarkerY = useMemo(() => {
    if (cursorElev === null) return null;
    return toY(cursorElev);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorElev]);

  const cursorGrade = useMemo(() => {
    if (cursorDist === null || points.length === 0) return null;
    if (cursorDist <= points[0].distance) return 0;
    if (cursorDist >= points[points.length - 1].distance) return 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i], p2 = points[i + 1];
      if (cursorDist >= p1.distance && cursorDist <= p2.distance) {
        const span = p2.distance - p1.distance;
        if (span <= 0) return 0;
        return (p2.elevation - p1.elevation) / span;
      }
    }
    return null;
  }, [cursorDist, points]);

  const segment = useMemo(() => {
    if (hoveredId === null) return null;
    return segments.find((s) => s.id === hoveredId) || null;
  }, [hoveredId, segments]);

  return {
    hoveredId,
    setHoveredId,
    cursorX,
    setCursorX,
    cursorDist,
    cursorElev,
    cursorMarkerY,
    cursorGrade,
    segment,
    handleMouseMove,
  };
}
