/**
 * Decorative side columns for wide screens (xl+).
 * Mechanical switches — pastel keycap hovering over a visible colored
 * stem + housing on a plate — pressing themselves on a loop with a
 * synced RGB-style underglow pulse. Plus floating letter tiles and
 * soft blush glows to fill the margins around the game column.
 *
 * Pure CSS animations (see .deco-* rules in index.css), aria-hidden,
 * pointer-events-none. Hidden below xl so mobile is untouched.
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
}

function MechSwitch({ letter, cap, capDeep, stem, delay, duration }: SwitchProps) {
  const timing = { '--deco-t': `${duration}s`, '--deco-d': `${delay}s` } as React.CSSProperties;
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

function FloatTile({ letter, delay, duration }: { letter: string; delay: number; duration: number }) {
  return (
    <div
      className="deco-float-tile"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      {letter}
    </div>
  );
}

export default function SideDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 hidden xl:block overflow-hidden">
      {/* soft blush glows */}
      <div className="deco-blob absolute -left-24 top-16 size-96" />
      <div className="deco-blob absolute -right-28 bottom-10 size-[28rem]" />

      {/* left column — MX red + blue, pink house switch */}
      <div className="absolute left-[6%] top-28 flex flex-col items-center gap-14">
        <FloatTile letter="T" delay={0} duration={7} />
        <MechSwitch letter="A" cap="#e8a49c" capDeep="#c17b73" stem="#e0433f" delay={0.4} duration={3.1} />
        <MechSwitch letter="S" cap="#a9c6ee" capDeep="#7d97c2" stem="#3b7dd8" delay={1.7} duration={3.7} />
        <FloatTile letter="R" delay={2.2} duration={9} />
      </div>
      <div className="absolute left-[13%] top-[54%] flex flex-col items-center gap-14">
        <MechSwitch letter="M" cap="#b3d9b6" capDeep="#84ab88" stem="#3f9e4d" delay={0.9} duration={4.3} />
        <FloatTile letter="W" delay={1.1} duration={8} />
      </div>

      {/* right column — brown, purple, brand pink */}
      <div className="absolute right-[6%] top-36 flex flex-col items-center gap-14">
        <MechSwitch letter="R" cap="#d9bfa4" capDeep="#a98e70" stem="#8a5a3b" delay={1.3} duration={3.4} />
        <FloatTile letter="O" delay={0.6} duration={8.5} />
        <MechSwitch letter="D" cap="#d8b4dd" capDeep="#a886ad" stem="#9a4fd8" delay={2.4} duration={4.1} />
      </div>
      <div className="absolute right-[13%] top-[60%] flex flex-col items-center gap-14">
        <FloatTile letter="L" delay={1.8} duration={7.5} />
        <MechSwitch letter="W" cap="#f2c9a9" capDeep="#c99d78" stem="#e89890" delay={0.2} duration={3.9} />
      </div>
    </div>
  );
}
