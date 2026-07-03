/**
 * Decorative side columns for wide screens (lg+).
 * Mechanical switches — pastel keycap hovering over a visible colored
 * stem + housing on a plate — pressing themselves on a loop with a
 * synced underglow pulse. Scattered floating letter tiles and layered
 * blush glows fill the full height of both margins.
 *
 * Pure CSS animations (see .deco-* rules in index.css), aria-hidden,
 * pointer-events-none. Hidden below lg so mobile is untouched.
 * Reduced-motion rules freeze all of it automatically.
 */

interface SwitchProps {
  letter: string;
  /** keycap gradient */
  cap: string;
  capDeep: string;
  /** switch stem color (the "MX red / blue / brown" part) — also the glow color */
  stem: string;
  delay: number;
  /** press loop duration in seconds — vary so the typing feels organic */
  duration: number;
  /** vertical position as % of viewport height */
  top: number;
  /** horizontal inset within the side column, px */
  inset?: number;
  scale?: number;
}

function MechSwitch({ letter, cap, capDeep, stem, delay, duration, top, inset = 0, scale = 1 }: SwitchProps) {
  const timing = {
    '--deco-t': `${duration}s`,
    '--deco-d': `${delay}s`,
    top: `${top}%`,
    marginLeft: inset,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
  } as React.CSSProperties;
  return (
    <div className="deco-switch" style={timing}>
      <div className="deco-switch-glow" style={{ background: `radial-gradient(ellipse at center, ${stem} 0%, transparent 70%)` }} />
      <div className="deco-switch-plate" />
      <div className="deco-switch-housing" />
      <div className="deco-switch-stem" style={{ backgroundColor: stem }} />
      <div
        className="deco-switch-cap"
        style={{
          background: `linear-gradient(180deg, ${cap} 0%, ${capDeep} 100%)`,
          boxShadow: `0 10px 22px -6px ${stem}66, 0 3px 6px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -3px 0 rgba(0,0,0,0.12)`,
        }}
      >
        <span className="deco-switch-cap-gloss" />
        {letter}
      </div>
    </div>
  );
}

interface TileProps {
  letter: string;
  delay: number;
  duration: number;
  top: number;
  inset?: number;
  size?: 'sm' | 'md';
  rotate?: number;
}

function FloatTile({ letter, delay, duration, top, inset = 0, size = 'md', rotate = 0 }: TileProps) {
  return (
    <div
      className="deco-float-tile"
      style={{
        top: `${top}%`,
        marginLeft: inset,
        width: size === 'sm' ? 36 : 46,
        height: size === 'sm' ? 36 : 46,
        fontSize: size === 'sm' ? 14 : 18,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        '--deco-rot': `${rotate}deg`,
      } as React.CSSProperties}
    >
      {letter}
    </div>
  );
}

export default function SideDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 hidden lg:block overflow-hidden">
      {/* layered blush glows — warm the whole margin, not just spots */}
      <div className="deco-blob absolute -left-24 top-[-4%] size-96" />
      <div className="deco-blob absolute left-[2%] top-[38%] size-[26rem]" />
      <div className="deco-blob absolute -left-16 bottom-[-6%] size-80" />
      <div className="deco-blob absolute -right-24 top-[6%] size-[24rem]" />
      <div className="deco-blob absolute right-[1%] top-[48%] size-96" />
      <div className="deco-blob absolute -right-16 bottom-[-8%] size-[26rem]" />

      {/* left rail */}
      <div className="deco-rail left-[3%]">
        <FloatTile letter="T" top={6} inset={34} delay={0} duration={7} rotate={-6} />
        <MechSwitch letter="A" top={15} inset={0} cap="#e8a49c" capDeep="#c17b73" stem="#e0433f" delay={0.4} duration={3.1} />
        <FloatTile letter="R" top={27} inset={72} delay={2.2} duration={9} size="sm" rotate={5} />
        <MechSwitch letter="S" top={35} inset={28} cap="#a9c6ee" capDeep="#7d97c2" stem="#3b7dd8" delay={1.7} duration={3.7} scale={0.9} />
        <FloatTile letter="W" top={48} inset={4} delay={1.1} duration={8} rotate={-4} />
        <MechSwitch letter="M" top={57} inset={64} cap="#b3d9b6" capDeep="#84ab88" stem="#3f9e4d" delay={0.9} duration={4.3} />
        <FloatTile letter="E" top={70} inset={20} delay={3.1} duration={7.4} size="sm" rotate={7} />
        <MechSwitch letter="K" top={78} inset={0} cap="#f0b8c8" capDeep="#c68a9c" stem="#e05a86" delay={2.0} duration={3.3} scale={0.92} />
        <FloatTile letter="Y" top={91} inset={56} delay={0.8} duration={8.8} size="sm" rotate={-8} />
      </div>

      {/* right rail */}
      <div className="deco-rail right-[3%]">
        <MechSwitch letter="R" top={8} inset={20} cap="#d9bfa4" capDeep="#a98e70" stem="#8a5a3b" delay={1.3} duration={3.4} />
        <FloatTile letter="O" top={20} inset={78} delay={0.6} duration={8.5} rotate={5} />
        <MechSwitch letter="D" top={29} inset={0} cap="#d8b4dd" capDeep="#a886ad" stem="#9a4fd8" delay={2.4} duration={4.1} scale={0.9} />
        <FloatTile letter="L" top={42} inset={44} delay={1.8} duration={7.5} rotate={-5} />
        <MechSwitch letter="W" top={51} inset={70} cap="#f2c9a9" capDeep="#c99d78" stem="#e89890" delay={0.2} duration={3.9} />
        <FloatTile letter="A" top={64} inset={8} delay={2.7} duration={9.2} size="sm" rotate={6} />
        <MechSwitch letter="E" top={72} inset={36} cap="#a8dcd8" capDeep="#7cb0ac" stem="#2aa8a0" delay={1.0} duration={3.6} scale={0.94} />
        <FloatTile letter="N" top={85} inset={64} delay={0.3} duration={7.8} size="sm" rotate={-7} />
        <FloatTile letter="I" top={94} inset={16} delay={1.5} duration={8.2} size="sm" rotate={4} />
      </div>
    </div>
  );
}
