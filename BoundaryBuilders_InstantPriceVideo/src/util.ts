import {Easing, interpolate} from 'remotion';
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** 0 -> 1 over [start, start+dur] with easing, clamped outside */
export const ramp = (t: number, start: number, dur: number, easing: (x: number) => number = easeOut) =>
  interpolate(t, [start, start + Math.max(dur, 1e-6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
/** fade + small upward slide */
export const rise = (t: number, start: number, dur: number, dy = 16): React.CSSProperties => {
  const p = ramp(t, start, dur);
  return {opacity: p, transform: `translateY(${(1 - p) * dy}px)`};
};
/** a single soft bump: 1 -> 1+amount -> 1 over dur */
export const bump = (t: number, start: number, dur: number, amount: number) => {
  const p = (t - start) / dur;
  if (p <= 0 || p >= 1) return 1;
  return 1 + amount * Math.sin(Math.PI * p);
};
