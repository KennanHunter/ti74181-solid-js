import { createSignal, createMemo, createEffect, For, onMount, Show } from "solid-js";
import schematicRaw from "./schematic.svg?raw";
import { simulate, type Inputs } from "./simulator";
import type { Bit, SignalName } from "./signals";
import { PIN_MAP, functionLabel } from "./pin-map";

export interface ALU74181Props {
  highColor?: string;
  lowColor?: string;
  bgColor?: string;
}

const PIN_RADIUS = 1.6;

export function ALU74181(props: ALU74181Props = {}) {
  const high = () => props.highColor ?? "#2ca02c";
  const low = () => props.lowColor ?? "#000000";
  const bg = () => props.bgColor ?? "#ffffff";

  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);
  const [s, setS] = createSignal(9); // A + B by default
  const [m, setM] = createSignal<Bit>(0);
  const [cn, setCn] = createSignal<Bit>(1); // no carry in

  const inputs = createMemo<Inputs>(() => ({ a: a(), b: b(), s: s(), m: m(), cn: cn() }));
  const result = createMemo(() => simulate(inputs()));
  const signals = createMemo(() => result().signals);

  // The input-pin writers: toggling pin X mutates the corresponding scalar input.
  const toggleSignal = (sig: SignalName) => {
    if (sig === "m") return setM((m() ^ 1) as Bit);
    if (sig === "cn") return setCn((cn() ^ 1) as Bit);
    const bitSetter = (
      name: "a" | "b" | "s",
      get: () => number,
      set: (v: number) => void,
      idx: number,
    ) => set(get() ^ (1 << idx));
    const match = /^([abs])([0-3])$/.exec(sig);
    if (!match) return;
    const [, name, i] = match;
    const idx = Number(i);
    if (name === "a") return bitSetter("a", a, setA, idx);
    if (name === "b") return bitSetter("b", b, setB, idx);
    return bitSetter("s", s, setS, idx);
  };

  let svgHost!: HTMLDivElement;

  onMount(() => {
    const svg = svgHost.querySelector("svg");
    if (!svg) return;
    // Force background + a subtle base style so "low" rendering is black-on-white
    // consistent with the component's palette regardless of what the source file
    // specified.
    svg.setAttribute("style", `background:${bg()};width:100%;height:auto;max-width:900px`);
    svg.style.setProperty("background", bg());

    // For each labeled pin in the schematic, wrap it with reactive affordances:
    //   - the <text> label gets its fill driven by the signal value
    //   - a clickable overlay <circle> is drawn at the label's anchor point
    for (const [textId, meta] of Object.entries(PIN_MAP)) {
      const textEl = svg.querySelector(`#${textId}`) as SVGTextElement | null;
      if (!textEl) continue;
      const x = Number(textEl.getAttribute("x"));
      const y = Number(textEl.getAttribute("y"));
      if (Number.isNaN(x) || Number.isNaN(y)) continue;

      // Position the overlay dot on the opposite side of the chip body from the label text
      // (inputs on top → dot is above label; outputs on bottom → dot is below label; side pins
      // → dot is to the right of label).
      let cx = x + 2;
      let cy = y - 4;
      if (meta.kind === "output") cy = y + 2;
      // Right-edge S pins: labels sit to the right of the chip, so put the dot to the left.
      if (/^s[0-3]$/.test(meta.signal)) {
        cx = x - 3;
        cy = y - 1;
      }

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", String(cx));
      dot.setAttribute("cy", String(cy));
      dot.setAttribute("r", String(PIN_RADIUS));
      dot.setAttribute("data-signal", meta.signal);
      dot.setAttribute("data-kind", meta.kind);
      dot.setAttribute("stroke", low());
      dot.setAttribute("stroke-width", "0.4");
      if (meta.kind === "input") {
        dot.style.cursor = "pointer";
        dot.addEventListener("click", () => toggleSignal(meta.signal));
      } else {
        dot.style.pointerEvents = "none";
      }
      svg.appendChild(dot);

      // Reactive fill on both the overlay dot and the label text.
      createEffect(() => {
        const v = signals()[meta.signal];
        const fill = v === 1 ? high() : low();
        dot.setAttribute("fill", fill);
        textEl.style.fill = fill;
      });
    }
  });

  const fBits = () => result().f.toString(2).padStart(4, "0");
  const opName = () => functionLabel(s(), m(), cn());

  const bitChecks = (value: number, set: (v: number) => void) => (
    <div style={{ display: "flex", gap: "4px" }}>
      <For each={[3, 2, 1, 0]}>
        {(i) => (
          <label style={{ display: "inline-flex", "align-items": "center", gap: "2px", "font-family": "monospace" }}>
            <span style={{ opacity: 0.6 }}>{i}</span>
            <input
              type="checkbox"
              checked={((value >> i) & 1) === 1}
              onChange={() => set(value ^ (1 << i))}
            />
          </label>
        )}
      </For>
    </div>
  );

  const nib = (v: number) => (v & 0xf).toString(2).padStart(4, "0");

  return (
    <div style={{
      "font-family": "system-ui, sans-serif",
      padding: "16px",
      background: bg(),
      color: low(),
      display: "flex",
      "flex-direction": "column",
      gap: "16px",
      "min-height": "100vh",
      "box-sizing": "border-box",
    }}>
      <h1 style={{ margin: 0, "font-size": "20px" }}>74181 ALU — interactive schematic</h1>

      <div style={{ display: "flex", gap: "24px", "align-items": "flex-start", "flex-wrap": "wrap" }}>
        <div
          ref={svgHost}
          innerHTML={schematicRaw}
          style={{ flex: "1 1 600px", "min-width": "480px", background: bg(), padding: "8px", border: "1px solid #ddd", "border-radius": "6px" }}
        />

        <aside style={{
          flex: "0 0 320px",
          display: "flex",
          "flex-direction": "column",
          gap: "12px",
          padding: "12px",
          border: "1px solid #ddd",
          "border-radius": "6px",
        }}>
          <h2 style={{ margin: 0, "font-size": "16px" }}>Controls</h2>

          <label style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
            <span>Mode (M)</span>
            <select value={m()} onChange={(e) => setM((Number(e.currentTarget.value) & 1) as Bit)}>
              <option value={0}>0 — Arithmetic</option>
              <option value={1}>1 — Logic</option>
            </select>
          </label>

          <label style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
            <span>Function select (S)</span>
            <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
              <input
                type="number"
                min={0}
                max={15}
                value={s()}
                onInput={(e) => setS(clamp(Number(e.currentTarget.value), 0, 15))}
                style={{ width: "60px" }}
              />
              {bitChecks(s(), setS)}
            </div>
            <code style={{ "font-size": "12px", opacity: 0.75 }}>
              S = {nib(s())}  →  F = {opName()}
            </code>
          </label>

          <label style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
            <span>Carry in (Cn)</span>
            <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
              <input
                type="checkbox"
                checked={cn() === 0}
                onChange={(e) => setCn((e.currentTarget.checked ? 0 : 1) as Bit)}
              />
              <code style={{ "font-size": "12px" }}>Cn = {cn()} ({cn() === 1 ? "no carry" : "+1 carry"})</code>
            </div>
          </label>

          <label style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
            <span>A</span>
            <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
              <input
                type="number"
                min={0}
                max={15}
                value={a()}
                onInput={(e) => setA(clamp(Number(e.currentTarget.value), 0, 15))}
                style={{ width: "60px" }}
              />
              {bitChecks(a(), setA)}
              <code style={{ "font-size": "12px", opacity: 0.75 }}>{nib(a())}</code>
            </div>
          </label>

          <label style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
            <span>B</span>
            <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
              <input
                type="number"
                min={0}
                max={15}
                value={b()}
                onInput={(e) => setB(clamp(Number(e.currentTarget.value), 0, 15))}
                style={{ width: "60px" }}
              />
              {bitChecks(b(), setB)}
              <code style={{ "font-size": "12px", opacity: 0.75 }}>{nib(b())}</code>
            </div>
          </label>

          <hr style={{ width: "100%", border: "none", "border-top": "1px solid #ddd" }} />

          <div style={{ display: "grid", "grid-template-columns": "auto 1fr", gap: "6px 12px", "font-family": "monospace", "font-size": "13px" }}>
            <strong>F</strong><span>{result().f} ({fBits()})</span>
            <strong>Cn+4</strong><span>{result().cout} {result().cout === 1 ? "(carry)" : "(no carry)"}</span>
            <strong>P</strong><span>{result().pOut}</span>
            <strong>G</strong><span>{result().gOut}</span>
            <strong>A = B</strong><span>{result().aeqb}</span>
          </div>
        </aside>
      </div>

      <footer style={{ "font-size": "12px", opacity: 0.75 }}>
        Schematic by{" "}
        <a href="https://commons.wikimedia.org/wiki/File:74181aluschematic.svg" target="_blank" rel="noreferrer">
          CrowbarBarbarian
        </a>
        ,{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>
        , via Wikimedia Commons. Click any input pin dot to toggle that bit.
      </footer>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}
