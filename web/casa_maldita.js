// LA CASA MALDITA — panel temático para workflows de ComfyUI
// gustaafvito.creador.ia
import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const BASE = new URL(".", import.meta.url).href;
const ID_ROOT = "cm-root";
const ID_FAB = "cm-fab";

const cache = {};            // id -> config
let current = null;          // { id, cfg, state, graph, els }
let graphHidden = false;

// ───────────────────────── utilidades grafo ─────────────────────────
const G = () => { try { return app.canvas ? app.graph : null; } catch { return null; } };
const nodes = () => G()?._nodes ?? G()?.nodes ?? [];
const nodeByTitle = (t) => nodes().find((n) => n.title === t);
const widgetOf = (n, name) => n?.widgets?.find((w) => w.name === name);

function setWidget(title, name, value) {
  const n = nodeByTitle(title);
  const w = widgetOf(n, name);
  if (!w) { console.warn(`[casa_maldita] falta ${title}.${name}`); return false; }
  if (typeof value === "number" && w.options) {             // respeta los límites del nodo
    if (w.options.max != null && value > w.options.max) value = w.options.max;
    if (w.options.min != null && value < w.options.min) value = w.options.min;
  }
  w.value = value;
  try { w.callback?.(value, app.canvas, n); } catch (e) { /* callbacks opcionales */ }
  // nodos de AcademiaSD con caja propia: serializan la caja, no el widget
  if (name === "text" && typeof n.asdSetText === "function") n.asdSetText(value);
  n.setDirtyCanvas?.(true, true);
  return true;
}
function getWidget(title, name) { return widgetOf(nodeByTitle(title), name)?.value; }

function spiritId() {
  const ex = G()?.extra?.casa_maldita;
  if (ex?.espiritu) return ex.espiritu;
  const tag = nodes().find((n) => typeof n.title === "string" && n.title.startsWith("🕯 ESPIRITU:"));
  return tag ? tag.title.split(":")[1].trim() : null;
}

async function loadCfg(id) {
  if (cache[id]) return cache[id];
  const r = await fetch(`${BASE}espiritus/${id}.json?t=${Date.now()}`);
  if (!r.ok) throw new Error(`No existe espiritus/${id}.json`);
  cache[id] = await r.json();
  return cache[id];
}

// ───────────────────────── DOM helpers ─────────────────────────
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
}
const pick = (arr) => arr?.length ? arr[Math.floor(Math.random() * arr.length)] : "";
const rndSeed = () => Math.floor(Math.random() * 2 ** 48);
const isVideo = (f) => /\.(mp4|webm|mov|mkv)$/i.test(f);
const isAudio = (f) => /\.(wav|mp3|flac|ogg)$/i.test(f);

function loadCss() {
  if (document.getElementById("cm-css")) return;
  document.head.append(h("link", { id: "cm-css", rel: "stylesheet", href: `${BASE}casa_maldita.css` }));
}

// ───────────────────────── posición sobre el lienzo ─────────────────────────
function place(root) {
  let top = 0, left = 0, right = 0;
  for (const sel of [".comfyui-body-top", ".comfy-menu-bar", ".top-menubar", ".workflow-tabs-container", ".comfyui-menu"]) {
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.top < 160) top = Math.max(top, r.bottom);
    });
  }
  const side = document.querySelector(".side-tool-bar-container");
  if (side) { const r = side.getBoundingClientRect(); if (r.width && r.left < 80) left = r.right; }
  const bottomBar = document.querySelector(".comfyui-body-bottom");
  const bottom = bottomBar ? bottomBar.getBoundingClientRect().height : 0;
  Object.assign(root.style, { top: `${top}px`, left: `${left}px`, right: `${right}px`, bottom: `${bottom}px` });
  // en pantallas grandes el panel se escala para no verse pequeño
  const frame = root.querySelector(".cm-win > .cm-frame");
  if (frame) {
    const aw = innerWidth - left - right, ah = innerHeight - top - bottom;
    const s = Math.max(1, Math.min(2, Math.min(aw / 1600, ah / 900)));
    Object.assign(frame.style, { width: `${(aw - 80) / s}px`, height: `${(ah - 84) / s}px`, transform: `translateX(-50%) scale(${s})` });
  }
}

// ───────────────────────── estado ─────────────────────────
function saveState() {
  if (!current || !G()) return;
  app.graph.extra ??= {};
  app.graph.extra.casa_maldita = { ...(app.graph.extra.casa_maldita || {}), espiritu: current.id, state: current.state };
}

function initialState(cfg) {
  const saved = G()?.extra?.casa_maldita?.state || {};
  const st = {};
  for (const c of cfg.controles || []) {
    if (!c.id) continue;
    if (saved[c.id] !== undefined) { st[c.id] = saved[c.id]; continue; }
    if (c.default !== undefined) st[c.id] = c.default;
    else if (c.nodo && c.widget) st[c.id] = getWidget(c.nodo, c.widget);
    if (c.tipo === "presets" && st[c.id] === undefined) st[c.id] = 0;
    if (c.tipo === "semilla" && (typeof st[c.id] !== "object" || st[c.id] === null))
      st[c.id] = { modo: "azar", valor: Number.isFinite(st[c.id]) ? st[c.id] : rndSeed() };
  }
  return st;
}

// ───────────────────────── narrador ─────────────────────────

// ───────────────────────── voz del narrador ─────────────────────────
// Cada frase puede ser "texto" o { "t": "texto", "a": "url del audio" }.
let actx = null, voice = null, reverbBuf = null;
const muted = () => { try { return localStorage.getItem("cm-mute") === "1"; } catch { return false; } };
function setMuted(v) { try { localStorage.setItem("cm-mute", v ? "1" : "0"); } catch {} if (v) stopVoice(); paintMute(); }
function paintMute() { const b = current?.els?.muteBtn; if (b) b.textContent = muted() ? "🔇 Voz" : "🔊 Voz"; }
function stopVoice() { const v = voice; voice = null; try { v?.stop(); } catch {} if (v) agacharMusica(false); }
function impulse(ctx, secs = 2.6, decay = 2.8) {
  const len = ctx.sampleRate * secs, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}
const audioCache = new Map();
async function playVoice(url) {
  if (!url || muted()) return;
  try {
    actx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") await actx.resume();
    reverbBuf ??= impulse(actx);
    let buf = audioCache.get(url);
    if (!buf) { buf = await actx.decodeAudioData(await (await fetch(url)).arrayBuffer()); audioCache.set(url, buf); }
    stopVoice();
    const v = current?.cfg?.narrador?.voz || {};
    const g = (niveles[url.split("/").pop().split("?")[0]] ?? 1) * (v.volumen ?? 1);   // nivelación por archivo
    const src = actx.createBufferSource(); src.buffer = buf; src.playbackRate.value = v.tono ?? 1;
    const dry = actx.createGain(); dry.gain.value = g * 0.85;
    const wet = actx.createGain(); wet.gain.value = g * (v.eco ?? 0.35);
    const conv = actx.createConvolver(); conv.buffer = reverbBuf;
    src.connect(dry).connect(actx.destination);
    src.connect(conv).connect(wet).connect(actx.destination);
    src.onended = () => { if (voice === src) { voice = null; agacharMusica(false); } };
    agacharMusica(true); src.start(); voice = src;
  } catch (e) { console.warn("[casa_maldita] voz", e); }
}
const resolveUrl = (u) => (/^(\/|https?:)/.test(u) ? api.apiURL(u.replace(/^\/api/, "")) : `${BASE}${u}`);

let typing = null;
function say(kind, text) {
  if (!current) return;
  const raw = text ?? pick(current.cfg.narrador?.frases?.[kind]);
  const phrase = typeof raw === "object" && raw ? raw.t : raw;
  const el = current.els.bubbleText;
  if (!el || !phrase) return;
  if (raw?.a) playVoice(resolveUrl(raw.a));
  clearInterval(typing);
  el.textContent = "";
  let i = 0;
  typing = setInterval(() => {
    el.textContent = phrase.slice(0, ++i);
    if (i >= phrase.length) clearInterval(typing);
  }, 22);
}

// ───────────────────────── controles ─────────────────────────
function field(c, inner) {
  return h("div", { class: `cm-field cm-${c.tipo}` },
    h("div", { class: "cm-label" }, c.etiqueta || c.id, c.ayuda ? h("span", { class: "cm-help" }, c.ayuda) : null),
    inner);
}

// "duracion_a": {nodo, widget, max} en un control archivo de audio/vídeo: escribe su duración (s) en ese nodo
async function duracionesMedios() {
  for (const c of current.cfg.controles || []) {
    const d = c.duracion_a, name = current.state[c.id];
    if (!d || !name) continue;
    const secs = await new Promise((res) => {
      const m = document.createElement(c.medio === "video" ? "video" : "audio");
      m.preload = "metadata";
      m.onloadedmetadata = () => res(m.duration);
      m.onerror = () => res(null);
      m.src = inputURL(name);
    });
    if (secs && isFinite(secs)) setWidget(d.nodo, d.widget || "value", Math.min(secs, d.max ?? secs));
  }
}

// "liberar_memoria": true, o lista de títulos: solo si alguno de esos nodos está activo
function liberaMemoria() {
  const l = current.cfg.liberar_memoria;
  if (Array.isArray(l)) return l.some((t) => nodeByTitle(t)?.mode === 0);
  return l === true;
}

// "limita": {"otro_control": índice_máximo} en una opción de presets (p. ej. 8 s → calidad como mucho Normal)
function aplicarLimites() {
  const { cfg, state } = current;
  for (const c of cfg.controles || []) {
    if (c.tipo !== "presets") continue;
    const lim = c.opciones[state[c.id]]?.limita;
    for (const [id, max] of Object.entries(lim || {})) {
      if (typeof state[id] === "number" && state[id] > max) { state[id] = max; current.repintar?.[id]?.(); }
    }
  }
  saveState();
}

function buildControl(c) {
  const st = current.state;
  const set = (v) => {
    st[c.id] = v; saveState();
    // imagen/audio/vídeo: poner el archivo en el nodo al momento (así ComfyUI no lo marca como "entrada faltante")
    if ((c.tipo === "imagen" || c.tipo === "archivo") && c.nodo && v) { try { setWidget(c.nodo, c.widget || (c.medio === "video" ? "file" : c.medio === "audio" ? "audio" : "image"), v); } catch {} }
  };

  switch (c.tipo) {
    case "texto": {
      const ta = h("textarea", { rows: c.filas || 4, placeholder: c.placeholder || "" });
      ta.value = st[c.id] ?? "";
      ta.addEventListener("input", () => set(ta.value));
      ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) invocar(); });
      return field(c, ta);
    }
    case "presets": {
      const wrap = h("div", { class: "cm-chips" });
      const desc = h("div", { class: "cm-desc" });
      const paint = () => {
        [...wrap.children].forEach((b, i) => b.classList.toggle("on", i === st[c.id]));
        desc.textContent = c.opciones[st[c.id]]?.desc || "";
      };
      (current.repintar ||= {})[c.id] = paint;
      c.opciones.forEach((o, i) => wrap.append(
        h("button", { class: "cm-chip", title: o.desc || "", onclick: () => { set(i); paint(); aplicarLimites(); } },
          o.icono ? h("span", { class: "cm-ico" }, o.icono) : null, o.etiqueta)));
      paint();
      return field(c, h("div", {}, wrap, desc));
    }
    case "deslizador": {
      const out = h("output", {}, String(st[c.id]));
      const inp = h("input", { type: "range", min: c.min, max: c.max, step: c.paso || 1 });
      inp.value = st[c.id];
      inp.addEventListener("input", () => { const v = Number(inp.value); out.textContent = v; set(v); });
      return field(c, h("div", { class: "cm-range" }, inp, out));
    }
    case "lista": {
      const sel = h("select");
      const opts = c.opciones || widgetOf(nodeByTitle(c.nodo), c.widget)?.options?.values || [];
      for (const o of opts) {
        const v = typeof o === "object" ? o.valor : o;
        sel.append(h("option", { value: v }, typeof o === "object" ? o.etiqueta : o));
      }
      sel.value = st[c.id];
      sel.addEventListener("change", () => set(sel.value));
      return field(c, sel);
    }
    case "semilla": {
      const s = st[c.id];
      const num = h("input", { type: "number", value: s.valor });
      const lock = h("button", { class: "cm-mini" }, s.modo === "fija" ? "🔒 fija" : "🎲 azar");
      num.addEventListener("change", () => set({ ...st[c.id], valor: Number(num.value) }));
      lock.addEventListener("click", () => {
        const modo = st[c.id].modo === "fija" ? "azar" : "fija";
        set({ ...st[c.id], modo });
        lock.textContent = modo === "fija" ? "🔒 fija" : "🎲 azar";
      });
      current.els.seedInput = num;
      return field(c, h("div", { class: "cm-seed" }, num, lock));
    }
    case "lienzo_mascara": {
      // imagen + pincel para marcar la zona a coser (se pinta en el escenario grande)
      const M = { img: new Image(), base: h("canvas", { class: "cm-pt-base" }), mask: h("canvas", { class: "cm-pt-mask" }), painted: false, erase: false, size: c.pincel || 48 };
      current.els.masks ??= {}; current.els.masks[c.id] = M;
      const holder = h("div", { class: "cm-pt-holder" }, M.base, M.mask);
      const hint = h("div", { class: "cm-pt-empty" }, c.placeholder || "Arrastra aquí la imagen y pinta encima lo que quieres cambiar");
      const painter = h("div", { class: "cm-painter" }, hint, holder);
      current.els.painter = painter;
      const load = (name) => {
        if (!name) return;
        const parts = String(name).split("/"); const fn = parts.pop();
        M.img = new Image();
        M.img.onload = () => {
          for (const cv of [M.base, M.mask]) { cv.width = M.img.naturalWidth; cv.height = M.img.naturalHeight; }
          M.base.getContext("2d").drawImage(M.img, 0, 0);
          M.painted = false; hint.style.display = "none"; holder.style.display = ""; fit();
          current?.els?.showTab?.("tela");
        };
        M.img.src = api.apiURL(`/view?filename=${encodeURIComponent(fn)}&subfolder=${encodeURIComponent(parts.join("/"))}&type=input&t=${Date.now()}`);
      };
      const fit = () => {
        if (!M.base.width) return;
        // medidas de maquetación (sin el zoom del marco): con getBoundingClientRect la imagen salía gigante
        const W = painter.clientWidth, Hh = painter.clientHeight; if (!W || !Hh) return;
        const k = Math.min(W / M.base.width, Hh / M.base.height) * 0.96;
        holder.style.width = `${M.base.width * k}px`; holder.style.height = `${M.base.height * k}px`;
      };
      new ResizeObserver(fit).observe(painter);
      holder.style.display = "none";
      // pintar
      let down = false, last = null;
      const pos = (e) => { const r = M.mask.getBoundingClientRect(); return [(e.clientX - r.left) * M.mask.width / r.width, (e.clientY - r.top) * M.mask.height / r.height]; };
      const stroke = (a, b) => {
        const g = M.mask.getContext("2d");
        g.globalCompositeOperation = M.erase ? "destination-out" : "source-over";
        g.strokeStyle = "rgba(255,40,60,1)"; g.lineCap = "round"; g.lineJoin = "round";
        g.lineWidth = M.size * (M.mask.width / M.mask.getBoundingClientRect().width);
        g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
        if (!M.erase) M.painted = true;
      };
      M.mask.addEventListener("pointerdown", (e) => { down = true; M.mask.setPointerCapture(e.pointerId); last = pos(e); stroke(last, last); });
      M.mask.addEventListener("pointermove", (e) => { if (!down) return; const p2 = pos(e); stroke(last, p2); last = p2; });
      M.mask.addEventListener("pointerup", () => { down = false; });
      // subir imagen (arrastrar al escenario o al botón)
      const file = h("input", { type: "file", accept: "image/*", style: { display: "none" } });
      const upload = async (f) => {
        const fd = new FormData(); fd.append("image", f); fd.append("subfolder", "casa_maldita"); fd.append("overwrite", "true");
        const j = await (await api.fetchApi("/upload/image", { method: "POST", body: fd })).json();
        const name = j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
        set(name); load(name);
      };
      file.addEventListener("change", () => file.files[0] && upload(file.files[0]));
      for (const el of [painter]) {
        el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("over"); });
        el.addEventListener("dragleave", () => el.classList.remove("over"));
        el.addEventListener("drop", (e) => { e.preventDefault(); el.classList.remove("over"); if (e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]); });
      }
      hint.addEventListener("click", () => file.click());
      const sizeOut = h("output", {}, String(M.size));
      const sizeIn = h("input", { type: "range", min: 6, max: 200, step: 2 }); sizeIn.value = M.size;
      sizeIn.addEventListener("input", () => { M.size = Number(sizeIn.value); sizeOut.textContent = M.size; });
      const bPaint = h("button", { class: "cm-chip on" }, "🖌 Pintar");
      const bErase = h("button", { class: "cm-chip" }, "🧽 Borrar");
      const modeSet = (er) => { M.erase = er; bPaint.classList.toggle("on", !er); bErase.classList.toggle("on", er); current?.els?.showTab?.("tela"); };
      bPaint.onclick = () => modeSet(false); bErase.onclick = () => modeSet(true);
      const bClear = h("button", { class: "cm-chip", onclick: () => { M.mask.getContext("2d").clearRect(0, 0, M.mask.width, M.mask.height); M.painted = false; } }, "🗑 Limpiar");
      const bFile = h("button", { class: "cm-chip", onclick: () => file.click() }, "📁 Imagen");
      M.load = load;
      setTimeout(() => load(st[c.id]), 0);
      return field(c, h("div", {},
        h("div", { class: "cm-chips" }, bFile, bPaint, bErase, bClear),
        h("div", { class: "cm-range", style: { marginTop: "8px" } }, h("span", { class: "cm-help" }, "pincel"), sizeIn, sizeOut), file));
    }
    case "imagen":
    case "archivo": {
      const medio = c.medio || "imagen";
      const accept = { imagen: "image/*", video: "video/*", audio: "audio/*,video/*" }[medio];
      const prev = h("div", { class: `cm-drop cm-drop-${medio}` }, h("span", {}, c.placeholder || "Arrastra aquí el archivo"));
      const file = h("input", { type: "file", accept, style: { display: "none" } });
      const show = (name) => {
        if (!name) return;
        prev.innerHTML = "";
        const url = inputURL(name);
        if (medio === "video") prev.append(h("video", { src: url, muted: true, loop: true, autoplay: true, playsinline: true }));
        else if (medio === "audio") prev.append(h("div", { class: "cm-audio-name" }, "♪ " + String(name).split("/").pop()), h("audio", { src: url, controls: true }));
        else prev.append(h("img", { src: url }));
      };
      const upload = async (f) => {
        say("subiendo", "Un momento… lo estoy trayendo.");
        const fd = new FormData(); fd.append("image", f); fd.append("overwrite", "true");
        if (c.subcarpeta !== false) fd.append("subfolder", "casa_maldita");
        const j = await (await api.fetchApi("/upload/image", { method: "POST", body: fd })).json();
        const name = j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
        const w = widgetOf(nodeByTitle(c.nodo), c.widget || (medio === "video" ? "file" : medio === "audio" ? "audio" : "image"));
        if (w?.options?.values && !w.options.values.includes(name)) w.options.values.push(name);
        set(name); show(name); c.alCambiar?.(name);
        say("inicio");
      };
      prev.addEventListener("click", (e) => { if (e.target.tagName !== "AUDIO") file.click(); });
      prev.addEventListener("dragover", (e) => { e.preventDefault(); prev.classList.add("over"); });
      prev.addEventListener("dragleave", () => prev.classList.remove("over"));
      prev.addEventListener("drop", (e) => { e.preventDefault(); prev.classList.remove("over"); if (e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]); });
      file.addEventListener("change", () => file.files[0] && upload(file.files[0]));
      const quitar = c.obligatorio === false ? h("button", { class: "cm-mini", onclick: () => { set(""); prev.innerHTML = ""; prev.append(h("span", {}, c.placeholder || "Arrastra aquí el archivo")); } }, "✕ quitar") : null;
      show(st[c.id]);
      return field(c, h("div", {}, prev, file, quitar));
    }
    case "scail": {
      // vídeo de movimiento + personaje para Simple SCAIL 2 (usa su propia API de subida y análisis)
      const v = st[c.id] || {};
      const vidBox = h("div", { class: "cm-drop cm-drop-video" }, h("span", {}, "1 · Arrastra el vídeo con el movimiento"));
      const refBox = h("div", { class: "cm-drop" }, h("span", {}, "2 · Arrastra la imagen del personaje"));
      const info = h("div", { class: "cm-desc" });
      const paint = () => {
        const cur = st[c.id] || {};
        if (cur.video?.path) { vidBox.innerHTML = ""; vidBox.append(h("video", { src: inputURL(cur.video.path), muted: true, loop: true, autoplay: true })); info.textContent = `${cur.video.duration.toFixed(1)} s · ${cur.video.width}×${cur.video.height} · ${Math.round(cur.video.fps)} fps`; }
        if (cur.ref?.path) { refBox.innerHTML = ""; refBox.append(h("img", { src: inputURL(cur.ref.path) })); }
      };
      const up = async (f, kind) => {
        say("subiendo", "Un momento… lo estoy trayendo.");
        const fd = new FormData(); fd.append("file", f);
        const j = await (await api.fetchApi("/nghtdrp_scail/upload", { method: "POST", body: fd })).json();
        const cur = { ...(st[c.id] || {}) };
        if (kind === "video") cur.video = await (await api.fetchApi("/nghtdrp_scail/probe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: j.path }) })).json();
        else cur.ref = { path: j.path, name: j.name };
        set(cur); paint(); say("inicio");
      };
      for (const [box, kind] of [[vidBox, "video"], [refBox, "ref"]]) {
        const inp = h("input", { type: "file", accept: kind === "video" ? "video/*" : "image/*", style: { display: "none" } });
        inp.addEventListener("change", () => inp.files[0] && up(inp.files[0], kind));
        box.addEventListener("click", () => inp.click());
        box.addEventListener("dragover", (e) => { e.preventDefault(); box.classList.add("over"); });
        box.addEventListener("dragleave", () => box.classList.remove("over"));
        box.addEventListener("drop", (e) => { e.preventDefault(); box.classList.remove("over"); if (e.dataTransfer.files[0]) up(e.dataTransfer.files[0], kind); });
        box.append(inp);
      }
      setTimeout(paint, 0);
      return field(c, h("div", { class: "cm-scail" }, vidBox, refBox, info));
    }
    case "interruptor": {
      const b = h("button", { class: "cm-toggle" });
      const paint = () => { b.classList.toggle("on", !!st[c.id]); b.textContent = st[c.id] ? (c.si || "Activado") : (c.no || "Apagado"); };
      b.addEventListener("click", () => { set(!st[c.id]); paint(); });
      paint();
      return field(c, b);
    }
    default:
      return h("div", { class: "cm-warn" }, `Control desconocido: ${c.tipo}`);
  }
}

// aplica todos los controles a los widgets del grafo
// SaveVideo en "auto" guarda con muy poco bitrate (≈0,5 Mbps): forzar H.264 re-codificado con CRF
function calidadVideo(crf) {
  for (const n of nodes()) {
    if (n.type !== "SaveVideo" || n.mode === 2 || n.mode === 4) continue;
    for (const [k, v] of [["format", "mp4"], ["format.codec", "h264"], ["format.codec.encoding", "re-encode"], ["format.codec.encoding.crf", crf]]) {
      const w = n.widgets?.find((x) => x.name === k); if (!w) break;
      w.value = v; w.callback?.(v, app.canvas, n);
    }
  }
}

function aplicar() {
  const { cfg, state } = current;
  const missing = [];
  const put = (n, w, v) => { if (!setWidget(n, w, v)) missing.push(`${n} › ${w}`); };
  aplicarLimites();

  for (const c of cfg.controles || []) {
    const v = state[c.id];
    if (c.tipo === "texto" && c.nodo) {
      let txt = c.plantilla ? c.plantilla.replace(/\{(\w+)(?::(\w+))?\}/g, (_, k, campo) => resolveToken(k, campo)) : v;
      put(c.nodo, c.widget, txt.replace(/\s+,/g, ",").replace(/\.\s*,/g, ",").replace(/\.\s*\./g, ".").replace(/\s{2,}/g, " ").replace(/[,\s]+$/, "").trim());
    } else if (c.tipo === "presets") {
      const o = c.opciones[v] ?? c.opciones[0];
      for (const s of o.fija || []) put(s.nodo, s.widget, s.valor);
      for (const m of o.modos || []) { const n = nodeByTitle(m.nodo); if (n) n.mode = m.modo; }
    } else if (c.tipo === "semilla") {
      let seed = v.valor;
      const maxSeed = widgetOf(nodeByTitle(c.nodo), c.widget || "seed")?.options?.max ?? 2 ** 48;
      if (v.modo === "azar") seed = Math.floor(Math.random() * Math.min(maxSeed, 2 ** 48));
      seed = Math.min(seed, maxSeed);
      state[c.id] = { ...v, valor: seed }; if (current.els.seedInput) current.els.seedInput.value = seed;
      put(c.nodo, c.widget || "seed", seed);
      // fijar el modo para que el nodo no invente otra semilla al serializar (AcademiaSD_Noise usa "mode")
      const sn = nodeByTitle(c.nodo);
      const modo = widgetOf(sn, "mode");
      const ctl = widgetOf(sn, "control_after_generate") || (modo?.options?.values?.includes?.("fixed") ? modo : null);
      if (ctl) ctl.value = "fixed";
    } else if (c.tipo === "interruptor" && c.nodo && !c.widget) {
      const n = nodeByTitle(c.nodo);
      if (n) n.mode = v ? 0 : 4; else missing.push(c.nodo);
    } else if (c.tipo === "archivo" && c.obligatorio === false && !v) {
      /* vacío y opcional: se gestiona con "si_vacio" */
      for (const m of c.si_vacio || []) { const n = nodeByTitle(m.nodo); if (n) n.mode = m.modo; }
      for (const m of c.si_lleno || []) { const n = nodeByTitle(m.nodo); if (n) n.mode = 0; }
    } else if (c.tipo === "archivo") {
      put(c.nodo, c.widget || (c.medio === "video" ? "file" : c.medio === "audio" ? "audio" : "image"), v);
      for (const m of c.si_vacio || []) { const n = nodeByTitle(m.nodo); if (n) n.mode = 0; }
      for (const m of c.si_lleno || []) { const n = nodeByTitle(m.nodo); if (n) n.mode = m.modo; }
    } else if (c.tipo === "scail") {
      const n = nodeByTitle(c.nodo); const w = widgetOf(n, c.widget || "project_data");
      if (!w) { missing.push(`${c.nodo} › project_data`); continue; }
      let pj; try { pj = JSON.parse(w.value || "{}"); } catch { pj = {}; }
      const V = v?.video || {}, R = v?.ref || {};
      const maxS = resolveToken(c.duracion_de || "", "valor");
      const dur = Math.min(V.duration || 0, Number(maxS) || V.duration || 0);
      pj.video = { ...(pj.video || {}), path: V.path, name: V.name, duration: V.duration, width: V.width, height: V.height, fps: V.fps, frame_count: V.frame_count, trim_start: 0, trim_end: dur };
      pj.references = pj.references || [{}];
      pj.references[0] = { ...(pj.references[0] || {}), path: R.path, name: R.name, role: "Primary" };
      const land = (V.width || 0) > (V.height || 0);
      pj.canvas = { ...(pj.canvas || {}), width: land ? 896 : 512, height: land ? 512 : 896 };
      pj.render = { ...(pj.render || {}), seed: Math.floor(Math.random() * 2 ** 31) };
      w.value = JSON.stringify(pj);
    } else if (c.tipo === "lienzo_mascara") {
      /* lo pone prepararMascaras */
    } else if (c.nodo && c.widget && v !== undefined) {
      put(c.nodo, c.widget, v);
    }
  }
  // "tambien": copia el valor final del control a otros nodos (p. ej. dos ramas del mismo workflow)
  for (const c of cfg.controles || []) {
    if (!c.tambien) continue;
    const w = widgetOf(nodeByTitle(c.nodo), c.widget || "seed");
    if (w) for (const t of c.tambien) {
      // "título" (mismo widget) o {nodo, widget} si en el otro nodo se llama distinto
      const [tn, tw] = typeof t === "object" ? [t.nodo, t.widget] : [t, c.widget || "seed"];
      // semilla con tope menor en el otro nodo: módulo en vez de quedar siempre en el máximo
      const max = widgetOf(nodeByTitle(tn), tw)?.options?.max;
      const val = c.tipo === "semilla" && typeof w.value === "number" && max != null && w.value > max ? w.value % (max + 1) : w.value;
      setWidget(tn, tw, val);
    }
  }
  for (const s of cfg.fijos || []) put(s.nodo, s.widget, s.valor);
  calidadVideo(cfg.video_crf ?? 17);
  for (const m of cfg.modos || []) { const n = nodeByTitle(m.nodo); if (n) n.mode = m.modo; else missing.push(m.nodo); }
  saveState();
  return missing;
}

function resolveToken(k, campo) {
  const c = current.cfg.controles.find((x) => x.id === k);
  const v = current.state[k];
  if (!c) return "";
  if (c.tipo === "presets") return (c.opciones[v] ?? c.opciones[0])[campo || "texto"] ?? "";
  if (c.tipo === "interruptor") return v ? (c.texto_si ?? "") : (c.texto_no ?? "");
  if ("texto_si" in c || "texto_no" in c) return v ? (c.texto_si ?? "") : (c.texto_no ?? "");
  return v ?? "";
}

// ───────────────────────── invocar / salidas ─────────────────────────
let enCola = 0;
const beforeQueue = [];   // imagen "antes" de cada trabajo en cola (para comparar con su resultado)          // trabajos en la cola de ComfyUI (pendientes + en curso)
let sending = false;
async function invocar() {
  if (!current || sending) return;
  const empty = (current.cfg.controles || []).find((c) => c.tipo === "texto" && c.obligatorio !== false && !String(current.state[c.id] || "").trim());
  if (empty) { say("error", `Primero: ${empty.etiqueta || empty.id}.`); return; }
  for (const c of (current.cfg.controles || []).filter((c) => (c.tipo === "imagen" || c.tipo === "archivo") && c.obligatorio !== false)) {
    const name = String(current.state[c.id] || "");
    const parts = name.split("/"); const fn = parts.pop();
    const ok = name && (await fetch(api.apiURL(`/view?filename=${encodeURIComponent(fn)}&subfolder=${encodeURIComponent(parts.join("/"))}&type=input`), { method: "HEAD" }).then((r) => r.ok).catch(() => false));
    if (!ok) { say("error", `Primero: ${c.etiqueta || "el archivo"}. Arrástralo al recuadro.`); return; }
  }
  for (const c of (current.cfg.controles || []).filter((c) => c.tipo === "scail")) {
    const v = current.state[c.id] || {};
    if (!v.video?.path) { say("error", "Primero: el vídeo con el movimiento."); return; }
    if (!v.ref?.path) { say("error", "Primero: la imagen del personaje."); return; }
  }
  if (!(await prepararMontaje())) return;
  if (!checkRitual()) return;
  if (!(await prepararMascaras())) return;
  await duracionesMedios();
  const missing = aplicar();
  if (missing.length) { say("error", `No encuentro: ${missing.join(", ")}`); return; }
  await lienzoAuto();
  sending = true;                                   // evita doble clic accidental, no bloquea la cola
  try {
    const hadQueue = enCola > 0;
    const before = current.cfg.comparar ? inputImageURL() : null;
    // nodos que cargan modelos por su cuenta (Sonic): vaciar la VRAM de ComfyUI antes (se aplica entre ejecuciones)
    if (liberaMemoria()) await api.fetchApi("/free", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unload_models: true, free_memory: true }) }).catch(() => {});
    await app.queuePrompt(0, current.cfg.lote || 1);
    beforeQueue.push(before);
    if (hadQueue) say("encolado", pick(current.cfg.narrador?.frases?.encolado) || "Otro espíritu espera su turno en la fila…");
    else say("invocando");
  } catch (e) { say("error", String(e.message || e)); }
  finally { setTimeout(() => { sending = false; }, 350); }
}

// opción de preset {"auto_de":"<id control imagen>","nodo":..,"megapix":1}: el lienzo copia la proporción de esa imagen
async function lienzoAuto() {
  for (const c of current.cfg.controles || []) {
    if (c.tipo !== "presets") continue;
    const o = c.opciones[current.state[c.id]] ?? c.opciones[0];
    if (!o?.auto_de) continue;
    const name = String(current.state[o.auto_de] || ""); if (!name) continue;
    const parts = name.split("/"); const fn = parts.pop();
    const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null);
      i.src = api.apiURL(`/view?filename=${encodeURIComponent(fn)}&subfolder=${encodeURIComponent(parts.join("/"))}&type=input`); });
    if (!img?.naturalWidth) continue;
    const px = (o.megapix || 1) * 1024 * 1024, m = o.multiplo || 64, ar = img.naturalWidth / img.naturalHeight;
    const w = Math.max(m, Math.round(Math.sqrt(px * ar) / m) * m), hh = Math.max(m, Math.round(Math.sqrt(px / ar) / m) * m);
    setWidget(o.nodo, o.ancho || "width", w); setWidget(o.nodo, o.alto || "height", hh);
  }
}

// sube la máscara pintada (blanco = zona a coser) y deja la imagen original intacta
async function prepararMascaras() {
  for (const c of current.cfg.controles || []) {
    if (c.tipo !== "lienzo_mascara") continue;
    const M = current.els.masks?.[c.id];
    if (!M || !M.base.width) { say("error", "Primero trae la tela: arrastra una imagen."); return false; }
    if (!M.painted) { say("error", "Pinta encima la zona que quieres que cosa."); current.els.showTab?.("tela"); return false; }
    const cv = document.createElement("canvas"); cv.width = M.base.width; cv.height = M.base.height;
    const g = cv.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, cv.width, cv.height);
    const mk = M.mask.getContext("2d").getImageData(0, 0, cv.width, cv.height);
    const out = g.getImageData(0, 0, cv.width, cv.height);
    for (let i = 0; i < out.data.length; i += 4) { const v = mk.data[i + 3]; out.data[i] = out.data[i + 1] = out.data[i + 2] = v; out.data[i + 3] = 255; }
    g.putImageData(out, 0, 0);
    const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
    const fd = new FormData(); fd.append("image", new File([blob], `patron_${Date.now()}.png`, { type: "image/png" }));
    fd.append("subfolder", "casa_maldita"); fd.append("overwrite", "true");
    const j = await (await api.fetchApi("/upload/image", { method: "POST", body: fd })).json();
    const mname = j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
    const put = (nodo, widget, val) => { const w = widgetOf(nodeByTitle(nodo), widget); if (!w) return false; if (w.options?.values && !w.options.values.includes(val)) w.options.values.push(val); w.value = val; return true; };
    if (!put(c.nodo_mascara, "image", mname)) { say("error", `No encuentro el nodo ${c.nodo_mascara}`); return false; }
    put(c.nodo, c.widget || "image", current.state[c.id]);
  }
  return true;
}

async function infoVideo(name, fpsDefault = 24) {
  let j = {};
  try { j = await (await api.fetchApi("/nghtdrp_scail/probe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: name }) })).json(); } catch {}
  if (j.frame_count && j.width) return { frames: j.frame_count, w: j.width, h: j.height };
  const v = document.createElement("video"); v.src = inputURL(name); v.muted = true;
  await new Promise((r) => { v.onloadedmetadata = r; v.onerror = r; setTimeout(r, 4000); });
  return { frames: j.frame_count || Math.round((v.duration || 0) * fpsDefault), w: j.width || v.videoWidth, h: j.height || v.videoHeight };
}
async function framesDe(name, fpsDefault = 24) { return (await infoVideo(name, fpsDefault)).frames; }
async function prepararMontaje() {
  const M = current.cfg.montaje; if (!M) return true;
  const st = current.state;
  const TD = [].concat(M.transicion_de);
  const tr = (k) => { const id = TD[Math.min(k, TD.length - 1)]; return {
    T: Math.max(1, Number(resolveToken(id, "frames")) || 12), tipo: resolveToken(id, "tipo") || "fade",
    interp: resolveToken(id, "interp") || "linear", rev: resolveToken(id, "reverse") === true }; };
  const a = await infoVideo(st[M.videos[0]]), b = await infoVideo(st[M.videos[1]]);
  if (!a.frames || !b.frames) { say("error", "No he podido medir los vídeos."); return false; }
  // los vídeos II y III se adaptan al tamaño del I (con bordes difuminados si la proporción es distinta)
  if (a.w && a.h) for (const t of M.ajustes || []) { setWidget(t, "width", a.w - (a.w % 2)); setWidget(t, "height", a.h - (a.h % 2)); }
  const u = (k, start) => { const x = tr(k); const n = M.uniones[k];
    setWidget(n, "start_index", Math.max(0, start - x.T)); setWidget(n, "transitioning_frames", x.T);
    setWidget(n, "transition_type", x.tipo); setWidget(n, "interpolation", x.interp); setWidget(n, "reverse", x.rev); return x.T; };
  const T1 = u(0, a.frames);
  u(1, a.frames + b.frames - T1);
  return true;
}

function paintQueue() {
  if (!current) return;
  const { root, qBadge } = current.els;
  root.classList.toggle("cm-busy", enCola > 0);
  if (qBadge) qBadge.textContent = enCola > 0 ? `${enCola} en cola` : "";
}

function outputIds() {
  const titles = current?.cfg?.salidas || [];
  return new Set(nodes().filter((n) => titles.includes(n.title)).map((n) => String(n.id)));
}

const inputURL = (name) => { const parts = String(name).split("/"); const fn = parts.pop(); return api.apiURL(`/view?filename=${encodeURIComponent(fn)}&subfolder=${encodeURIComponent(parts.join("/"))}&type=input&t=${Date.now()}`); };
const viewURL = (f) => api.apiURL(`/view?filename=${encodeURIComponent(f.filename)}&subfolder=${encodeURIComponent(f.subfolder || "")}&type=${f.type || "output"}`);

// imagen de entrada (para comparar antes / después)
function inputImageURL() {
  const c = (current?.cfg?.controles || []).find((x) => x.tipo === "imagen" || x.tipo === "lienzo_mascara");
  const name = c && current.state[c.id];
  if (!name) return null;
  const parts = String(name).split("/"); const filename = parts.pop();
  return viewURL({ filename, subfolder: parts.join("/"), type: "input" });
}

// visor con zoom (rueda), desplazamiento (arrastrar) y, si hay "antes", línea de comparación
function zoomView(afterURL, beforeURL) {
  const wrap = h("div", { class: "cm-compare" + (beforeURL ? "" : " cm-single") });
  const layerA = h("div", { class: "cm-zlayer" }, h("img", { src: afterURL, draggable: "false" }));
  wrap.append(layerA);
  let beforeBox = null, layerB = null, line = null, p = 0.5;
  if (beforeURL) {
    layerB = h("div", { class: "cm-zlayer" }, h("img", { src: beforeURL, draggable: "false" }));
    beforeBox = h("div", { class: "cm-cmp-before" }, layerB);
    line = h("div", { class: "cm-cmp-line" }, h("span", {}, "⟷"));
    wrap.append(beforeBox, line,
      h("div", { class: "cm-cmp-lbl l" }, current.cfg.comparar?.antes || "ANTES"),
      h("div", { class: "cm-cmp-lbl r" }, current.cfg.comparar?.despues || "DESPUÉS"));
  }
  const zoomLbl = h("div", { class: "cm-zoom-lbl" }, "rueda: zoom · arrastra: mover · doble clic: encajar");
  wrap.append(zoomLbl);
  let z = 1, x = 0, y = 0;
  const apply = () => {
    const W = wrap.clientWidth, H = wrap.clientHeight;
    for (const L of [layerA, layerB]) if (L) { L.style.width = `${W}px`; L.style.height = `${H}px`; L.style.transform = `translate(${x}px, ${y}px) scale(${z})`; }
    if (beforeBox) { beforeBox.style.width = `${p * 100}%`; line.style.left = `${p * 100}%`; }
    zoomLbl.textContent = z > 1.01 ? `${Math.round(z * 100)} %  ·  doble clic: encajar` : "rueda: zoom · arrastra: mover · doble clic: encajar";
  };
  const clampPan = () => { const W = wrap.clientWidth, H = wrap.clientHeight; x = Math.min(0, Math.max(W - W * z, x)); y = Math.min(0, Math.max(H - H * z, y)); };
  wrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = wrap.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    const nz = Math.max(1, Math.min(12, z * (e.deltaY < 0 ? 1.2 : 1 / 1.2)));
    x = cx - (cx - x) * (nz / z); y = cy - (cy - y) * (nz / z); z = nz; clampPan(); apply();
  }, { passive: false });
  let mode = null, sx = 0, sy = 0, ox = 0, oy = 0;
  wrap.addEventListener("pointerdown", (e) => {
    const r = wrap.getBoundingClientRect();
    const nearLine = beforeBox && Math.abs(e.clientX - (r.left + p * r.width)) < 22;
    mode = nearLine || (beforeBox && z <= 1.01) ? "line" : "pan";
    wrap.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = x; oy = y;
    if (mode === "line") { p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); apply(); }
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!mode) return;
    const r = wrap.getBoundingClientRect();
    if (mode === "line") p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    else { x = ox + (e.clientX - sx); y = oy + (e.clientY - sy); clampPan(); }
    apply();
  });
  wrap.addEventListener("pointerup", () => { mode = null; });
  wrap.addEventListener("dblclick", () => { z = 1; x = 0; y = 0; apply(); });
  new ResizeObserver(() => { clampPan(); apply(); }).observe(wrap);
  setTimeout(apply, 0);
  return wrap;
}

let fullOv = null, fullBack = null;
function toggleFull(on) {
  const st = current?.els?.stage; if (!st) return;
  const full = on ?? !fullOv;
  if (full && !fullOv) {
    fullBack = { parent: st.parentNode, next: st.nextSibling };
    fullOv = h("div", { class: "cm-root cm-fullov" });
    applyTheme(fullOv, current.cfg.tema);
    document.body.append(fullOv); fullOv.append(st);
  } else if (!full && fullOv) {
    fullBack.parent.insertBefore(st, fullBack.next); fullOv.remove(); fullOv = null;
  }
  const b = st.querySelector(".cm-full-btn"); if (b) b.textContent = fullOv ? "✕ cerrar" : "⛶ pantalla completa";
}
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && fullOv) toggleFull(false); });

function showOutput(f) {
  const { stage } = current.els;
  current.els.showTab?.("res");
  const url = viewURL(f);
  stage.innerHTML = "";
  stage.dataset.file = JSON.stringify(f);
  let media;
  if (isVideo(f.filename)) media = h("video", { src: url, controls: true, autoplay: true, loop: true, muted: true });
  else if (isAudio(f.filename)) media = h("audio", { src: url, controls: true });
  else media = zoomView(url, current.cfg.comparar ? (f.before || inputImageURL()) : null);
  const tools = h("div", { class: "cm-stage-tools" },
    isVideo(f.filename) || isAudio(f.filename) ? null : h("button", { class: "cm-open cm-full-btn", onclick: () => toggleFull() }, fullOv ? "✕ cerrar" : "⛶ pantalla completa"),
    h("a", { class: "cm-open", href: url, target: "_blank" }, "abrir ↗"));
  const medioOut = isVideo(f.filename) ? "video" : isAudio(f.filename) ? "audio" : "imagen";
  for (const env of current.cfg.enviar || []) {
    if ((env.medio || "imagen") === medioOut)
      tools.prepend(h("button", { class: "cm-send", title: env.ayuda || "", onclick: () => sendTo(env, f) }, env.etiqueta));
  }
  stage.append(media, tools);
}

function addOutputs(list) {
  if (!current) return;
  const { strip } = current.els;
  for (const f of list) {
    showOutput(f);
    const url = viewURL(f);
    const thumbMedia = isVideo(f.filename) ? h("video", { src: url, muted: true }) : isAudio(f.filename) ? h("span", {}, "♪") : h("img", { src: url });
    strip.prepend(h("button", { class: "cm-thumb", onclick: () => showOutput(f) }, thumbMedia));
    while (strip.children.length > 24) strip.lastChild.remove();
  }
}

// ───────────────────────── pasar una imagen a otro espíritu ─────────────────────────
async function sendTo(env, f) {
  try {
    say("enviar", env.frase);
    const blob = await (await fetch(viewURL(f))).blob();
    const fd = new FormData();
    fd.append("image", new File([blob], f.filename, { type: blob.type || "image/png" }));
    fd.append("subfolder", "casa_maldita"); fd.append("overwrite", "true");
    const j = await (await api.fetchApi("/upload/image", { method: "POST", body: fd })).json();
    const name = j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
    sessionStorage.setItem("cm-handoff", JSON.stringify({ espiritu: env.a, imagen: name, medio: env.medio || "imagen", desde: current.cfg.titulo }));
    const wf = await (await fetch(api.apiURL(`/workflow_templates/casa_maldita/${env.workflow}`))).json();
    await app.loadGraphData(wf, true, true, env.workflow.replace(/\.json$/, ""));
  } catch (e) { say("error", `No he podido llevarla: ${e.message || e}`); }
}

function takeHandoff(id, cfg, state) {
  let h0; try { h0 = JSON.parse(sessionStorage.getItem("cm-handoff") || "null"); } catch { h0 = null; }
  if (!h0 || h0.espiritu !== id) return null;
  sessionStorage.removeItem("cm-handoff");
  const medio = h0.medio || "imagen";
  const fits = (x) => medio === "imagen"
    ? (x.tipo === "imagen" || x.tipo === "lienzo_mascara" || (x.tipo === "archivo" && (x.medio || "imagen") === "imagen"))
    : (x.tipo === "archivo" && x.medio === medio);
  const cands = (cfg.controles || []).filter(fits);
  const c = cands.find((x) => !state[x.id] || /example|escena\d/.test(String(state[x.id]))) || cands[0];
  if (c) {
    state[c.id] = h0.imagen;
    const w = widgetOf(nodeByTitle(c.nodo), c.widget || (c.medio === "video" ? "file" : c.medio === "audio" ? "audio" : "image"));
    if (w?.options?.values && !w.options.values.includes(h0.imagen)) w.options.values.push(h0.imagen);
    if (w && c.tipo !== "lienzo_mascara") w.value = h0.imagen;
  }
  return h0;
}

function endRun(kind, msg) {
  if (!current) return;
  current.els.bar.style.width = kind === "hecho" ? "100%" : "0%";
  if (kind === "hecho" && enCola > 1) say("hecho", "Uno ha cruzado… y aún quedan más en la fila.");
  else say(kind, msg);
}

api.addEventListener("status", ({ detail }) => {
  enCola = detail?.exec_info?.queue_remaining ?? 0;
  paintQueue();
});
api.addEventListener("execution_start", () => { if (current) current.els.bar.style.width = "0%"; });
api.addEventListener("progress", ({ detail }) => {
  if (current && detail?.max) current.els.bar.style.width = `${(100 * detail.value) / detail.max}%`;
});
api.addEventListener("executed", ({ detail }) => {
  if (!current) return;
  const ids = outputIds();
  const nid = String(detail?.display_node ?? detail?.node ?? "");
  if (!ids.has(nid) && !ids.has(nid.split(":").pop())) return;
  const o = detail.output || {};
  const before = beforeQueue.length ? beforeQueue[0] : null;
  addOutputs([...(o.images || []), ...(o.gifs || []), ...(o.videos || []), ...(o.audio || [])].map((f) => ({ ...f, before })));
});
api.addEventListener("execution_success", () => { beforeQueue.shift(); endRun("hecho"); });
api.addEventListener("execution_error", ({ detail }) => (beforeQueue.shift(), endRun("error", `El ritual falló: ${detail?.exception_message?.slice(0, 180) || "error"}`)));
api.addEventListener("execution_interrupted", () => (beforeQueue.shift(), endRun("error", "Alguien rompió el círculo. Ritual interrumpido.")));

// ───────────────────────── montaje ─────────────────────────
function applyTheme(el, t = {}) {
  const map = { fondo: "--cm-bg", panel: "--cm-panel", acento: "--cm-accent", acento2: "--cm-accent2", texto: "--cm-text", tenue: "--cm-dim", fuente_titulo: "--cm-font-title", fuente: "--cm-font" };
  for (const [k, v] of Object.entries(map)) if (t[k]) el.style.setProperty(v, t[k]);
}

function buildCover(cfg, src) {
  const motes = Array.from({ length: 18 }, (_, i) =>
    h("span", { class: "cm-mote", style: { left: `${(i * 53) % 100}%`, animationDelay: `${(i * 0.7) % 9}s`, animationDuration: `${7 + (i % 5)}s` } }));
  const enter = () => showCover(false);
  const cover = h("div", { class: "cm-cover", onclick: enter },
    h("div", { class: "cm-motes" }, motes),
    h("div", { class: "cm-cover-card" },
      h("div", { class: "cm-cover-frame" },
        src ? h("img", { src, alt: cfg.titulo, onerror: (ev) => ev.target.replaceWith(h("div", { class: "cm-sigil cm-sigil-big" }, cfg.icono || "🕯")) })
            : h("div", { class: "cm-sigil cm-sigil-big" }, cfg.icono || "🕯"),
        h("div", { class: "cm-cover-title" },
          h("div", { class: "cm-cover-name" }, `✝ ${cfg.titulo} ✝`),
          h("div", { class: "cm-cover-sub" }, cfg.subtitulo || ""))),
      h("div", { class: "cm-cover-kicker" }, cfg.habitacion || ""),
      h("div", { class: "cm-cover-hint" }, cfg.portada_hint || "toca el retrato para entrar")));
  return cover;
}

function showCover(on) {
  const root = current?.els?.root;
  if (!root) return;
  root.classList.toggle("cm-covered", !!on);
  const id = current.id;
  if (on) { stopVoice(); ponerPortada(id); return; }
  ponerMusica(`${BASE}audio/ambiente_${id}.mp3`, 0.22);
  const b = current.cfg.narrador?.bienvenida;
  if (b && !current.bienvenido) { current.bienvenido = true; say("bienvenida", b); } else say("inicio");
}

// ───────────────────────── modelos / nodos que faltan ─────────────────────────
const MODEL_RE = /\.(safetensors|gguf|ckpt|pt|pth|bin|onnx|sft)$/i;
function findMissing() {
  const out = [];
  const reg = globalThis.LiteGraph?.registered_node_types || {};
  for (const n of nodes()) {
    if (n.mode === 2 || n.mode === 4) continue;   // silenciado o puenteado: no se usa
    if (n.type && Object.keys(reg).length && !reg[n.type] && !["Reroute", "Note", "MarkdownNote", "PrimitiveNode"].includes(n.type))
      out.push({ tipo: "nodo", nombre: n.type, nodo: n.title || n.type });
    const known = (n.properties?.models || []);
    for (const w of n.widgets || []) {
      if (typeof w.value !== "string" || !MODEL_RE.test(w.value)) continue;
      const vals = w.options?.values;
      if (!Array.isArray(vals) || vals.includes(w.value)) continue;
      const base = w.value.split(/[\\/]/).pop();
      const alt = vals.find((v) => typeof v === "string" && v.split(/[\\/]/).pop() === base);
      if (alt) { w.value = alt; continue; }           // está en otra subcarpeta: lo corrige solo
      const info = known.find((m) => m.name === base) || (current?.cfg?.modelos || {})[base] || {};
      out.push({ tipo: "modelo", nombre: base, carpeta: info.directory || info.carpeta || "?", url: info.url, nodo: n.title || n.type });
    }
  }
  return out;
}

function checkRitual() {
  if (!current) return true;
  const miss = findMissing();
  const { root, missing } = current.els;
  root.classList.toggle("cm-lacking", miss.length > 0);
  if (!miss.length) return true;
  missing.innerHTML = "";
  missing.append(h("div", { class: "cm-missing-card" },
    h("h2", {}, "El ritual está incompleto"),
    h("p", {}, "Faltan piezas para invocar a este espíritu. Descárgalas, colócalas en su carpeta dentro de ComfyUI/models y reinicia ComfyUI."),
    ...miss.map((m) => h("div", { class: "cm-miss-row" },
      h("code", {}, m.nombre, h("small", {}, m.tipo === "modelo" ? `→ models/${m.carpeta}   ·   usado en: ${m.nodo}` : "nodo personalizado · instálalo con ComfyUI-Manager → Install Missing Custom Nodes")),
      m.url ? h("a", { href: m.url, target: "_blank", rel: "noopener" }, "⬇ descargar") : null)),
    h("div", { class: "cm-missing-actions" },
      h("button", { class: "cm-mini", onclick: () => { if (checkRitual()) say("inicio", "Todo en su sitio. Ya podemos empezar."); } }, "↻ volver a comprobar"))));
  return false;
}

function fab() {
  let b = document.getElementById(ID_FAB);
  if (!b) {
    b = h("button", { id: ID_FAB, onclick: () => { graphHidden = false; sync(); } }, "🕯 Volver a la habitación");
    document.body.append(b);
  }
  return b;
}

function unmount() {
  document.getElementById(ID_ROOT)?.remove();
  document.getElementById(ID_FAB)?.remove();
  document.body.classList.remove("cm-active");
  stopVoice();
  if (current && !document.getElementById(ID_LOBBY)) quitarMusica(800);
  if (fullOv) { fullOv.remove(); fullOv = null; }
  current = null;
}

function mount(id, cfg) {
  unmount();
  loadCss();
  current = { id, cfg, graph: app.graph, state: initialState(cfg), els: {} };
  const handoff = takeHandoff(id, cfg, current.state);
  const e = current.els;

  const posterSrc = cfg.poster && (/^(\/|https?:)/.test(cfg.poster) ? api.apiURL(cfg.poster.replace(/^\/api/, "")) : `${BASE}${cfg.poster}`);
  const poster = cfg.poster ? h("img", { class: "cm-poster", src: posterSrc, onerror: (ev) => ev.target.replaceWith(h("div", { class: "cm-sigil" }, cfg.icono || "🕯")) })
                            : h("div", { class: "cm-sigil" }, cfg.icono || "🕯");

  e.bubbleText = h("span");
  const header = h("header", { class: "cm-head" },
    poster,
    h("div", { class: "cm-titles" },
      h("div", { class: "cm-kicker" }, cfg.habitacion || "LA CASA MALDITA"),
      h("h1", {}, cfg.titulo),
      h("div", { class: "cm-sub" }, cfg.subtitulo || ""),
      h("div", { class: "cm-bubble" }, h("b", {}, `${cfg.narrador?.nombre || cfg.titulo}: `), e.bubbleText)),
    h("div", { class: "cm-tools" },
      (e.muteBtn = h("button", { class: "cm-mini", title: "Activar / silenciar la voz", onclick: () => setMuted(!muted()) }, "🔊 Voz")),
      h("button", { class: "cm-mini cm-mus-btn", title: "Activar / silenciar la música", onclick: () => setMusica(musicaOff()) }, musicaOff() ? "🔇 Música" : "🔊 Música"),
      h("button", { class: "cm-mini", title: "Ir a otra habitación", onclick: abrirVestibulo }, "🚪 Vestíbulo"),
      h("button", { class: "cm-mini", title: "Volver a la portada", onclick: () => showCover(true) }, "🖼 Portada"),
      cfg.bloqueado === true ? null :
      h("button", { class: "cm-mini", title: "Ver el grafo de nodos", onclick: () => { graphHidden = true; sync(); } }, "👁 Ver las entrañas")));

  const basic = (cfg.controles || []).filter((c) => !c.avanzado).map(buildControl);
  const adv = (cfg.controles || []).filter((c) => c.avanzado).map(buildControl);

  e.bar = h("div", { class: "cm-bar-fill" });
  e.qBadge = h("span", { class: "cm-qbadge" });
  const invokeBtn = h("button", { class: "cm-invoke", onclick: invocar }, h("span", {}, cfg.boton || "INVOCAR"), e.qBadge);
  const left = h("section", { class: "cm-left" },
    ...basic,
    adv.length ? h("details", { class: "cm-adv" }, h("summary", {}, cfg.avanzado_titulo || "Grimorio avanzado"), ...adv) : null,
    h("div", { class: "cm-actions" }, invokeBtn, h("div", { class: "cm-bar" }, e.bar),
      h("div", { class: "cm-stops" },
        h("button", { class: "cm-mini cm-stop", title: "Detiene la que se está generando", onclick: () => api.interrupt() }, "✋ romper el círculo"),
        h("button", { class: "cm-mini cm-stop", title: "Vacía la cola pendiente", onclick: async () => { await api.fetchApi("/queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clear: true }) }); say("error", "He despedido a los que esperaban en la fila."); } }, "🕯 vaciar la cola"))));

  e.stage = h("div", { class: "cm-stage" }, h("div", { class: "cm-empty" }, cfg.vacio || "Aún no se ha manifestado nada…"));
  e.strip = h("div", { class: "cm-strip" });
  let right;
  if (e.painter) {
    const tabT = h("button", { class: "cm-tab on" }, cfg.pestanas?.[0] || "🧵 Tela");
    const tabR = h("button", { class: "cm-tab" }, cfg.pestanas?.[1] || "✨ Resultado");
    const pane = h("div", { class: "cm-stage cm-stage-paint" }, e.painter);
    e.showTab = (t) => {
      const tela = t === "tela";
      tabT.classList.toggle("on", tela); tabR.classList.toggle("on", !tela);
      pane.style.display = tela ? "" : "none"; e.stage.style.display = tela ? "none" : "";
    };
    tabT.onclick = () => e.showTab("tela"); tabR.onclick = () => e.showTab("res");
    e.stage.style.display = "none";
    right = h("section", { class: "cm-right" }, h("div", { class: "cm-tabs" }, tabT, tabR), pane, e.stage, e.strip);
  } else right = h("section", { class: "cm-right" }, e.stage, e.strip);

  e.missing = h("div", { class: "cm-missing" });
  const modo = cfg.modo || "ventana";
  const locked = cfg.bloqueado === true;
  e.root = h("div", { id: ID_ROOT, class: `cm-root ${modo === "ventana" ? "cm-win" : ""} ${locked ? "cm-locked" : ""}` },
    modo === "ventana" ? h("div", { class: "cm-backdrop" }, h("div", { class: "cm-curtain l" }), h("div", { class: "cm-curtain r" }),
      h("div", { class: "cm-lamps" }, Array.from({ length: 14 }, () => h("i")))) : null,
    h("div", { class: "cm-frame" },
      h("div", { class: "cm-fog" }), h("div", { class: "cm-grain" }), h("div", { class: "cm-vignette" }),
      h("div", { class: "cm-inner" }, header, h("main", { class: "cm-body" }, left, right),
        h("footer", { class: "cm-foot" }, cfg.pie || "LA CASA MALDITA · gustaafvito.creador.ia")),
      buildCover(cfg, posterSrc),
      e.missing));
  applyTheme(e.root, cfg.tema);
  document.body.append(e.root);
  place(e.root);

  if (handoff) { showCover(false); setTimeout(() => say("llegada", pick(cfg.narrador?.frases?.llegada) || `Me traen algo de ${handoff.desde}…`), 50); }
  else if (cfg.portada !== false && posterSrc) showCover(true); else showCover(false);
  checkRitual();
  paintQueue();
  paintMute();
  // salidas previas guardadas en SaveImage de la sesión no se recuperan; sólo lo nuevo
  if (!e.root.classList.contains("cm-covered") && !handoff && !current.bienvenido) say("inicio");
}

// ───────────────────────── vestíbulo: las 12 puertas ─────────────────────────
const PUERTAS = [
  ["medium", "01_LA_MEDIUM.json"], ["forense", "02_EL_FORENSE.json"], ["costurera", "03_LA_COSTURERA.json"],
  ["marionetista", "04_EL_MARIONETISTA.json"], ["doppelganger", "05_EL_DOPPELGANGER.json"], ["pesadilla", "06_LA_PESADILLA.json"],
  ["retrato", "07_EL_RETRATO.json"], ["exorcista", "08_EL_EXORCISTA.json"], ["poseso", "09_EL_POSESO.json"],
  ["ouija", "10_LA_OUIJA.json"], ["embalsamador", "11_EL_EMBALSAMADOR.json"], ["sepulturero", "12_EL_SEPULTURERO.json"],
];
const ID_LOBBY = "cm-lobby", ID_DOOR = "cm-door";
const posterURL = (p) => p && (/^(\/|https?:)/.test(p) ? api.apiURL(p.replace(/^\/api/, "")) : `${BASE}${p}`);

async function abrirPuerta(id, file) {
  try {
    const wf = await (await fetch(api.apiURL(`/workflow_templates/casa_maldita/${file}`))).json();
    cerrarVestibulo(false);
    await app.loadGraphData(wf, true, true, file.replace(/\.json$/, ""));
  } catch (e) { console.error("[casa_maldita] no se pudo abrir", file, e); alert(`No se pudo abrir ${file}: ${e.message || e}`); }
}

// música del vestíbulo: suena al abrir LA CASA (el clic del botón permite reproducir audio)
// ── música: un solo canal con fundidos (vestíbulo, portada de cada habitación y ambiente dentro) ──
let musica = null, deseada = null;
const musicaOff = () => { try { return localStorage.getItem("cm-musica") === "0"; } catch { return false; } };
function fundido(a, to, ms, fin) {
  a._fade = (a._fade || 0) + 1; const id = a._fade, from = a.volume, t0 = performance.now();
  const paso = (t) => { if (a._fade !== id) return; const k = Math.min(1, (t - t0) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k < 1) requestAnimationFrame(paso); else fin?.(); };
  requestAnimationFrame(paso);
}
// ganancia por archivo (audio/niveles.json) para igualar volúmenes entre piezas
let niveles = {};
fetch(`${BASE}audio/niveles.json?t=${Date.now()}`).then((r) => r.json()).then((j) => (niveles = j)).catch(() => {});
// opts.bucle=false: suena una vez; opts.luego(): qué hacer al acabar
function ponerMusica(url, vol, opts = {}) {
  vol = Math.min(1, vol * (niveles[url.split("/").pop()] ?? 1));
  deseada = { url, vol, opts };
  if (musicaOff() || musica?.url === url) return;
  quitarMusica(900, true);
  const a = new Audio(url); a.loop = opts.bucle !== false; a.volume = 0;
  if (opts.luego) a.addEventListener("ended", () => { if (musica?.a === a) opts.luego(); });
  musica = { a, url, vol };
  a.play().then(() => { if (musica?.a === a) fundido(a, voice ? vol * 0.35 : vol, 1800); }).catch(() => { if (musica?.a === a) { musica = null; reintentarMusica(); } });
}
// el navegador bloquea el audio hasta el primer gesto (p. ej. tras Ctrl+F5 con una habitación abierta): reintenta al tocar
let reintentoPendiente = false;
function reintentarMusica() {
  if (reintentoPendiente) return;
  reintentoPendiente = true;
  const go = () => {
    reintentoPendiente = false;
    ["pointerdown", "keydown"].forEach((ev) => document.removeEventListener(ev, go, true));
    if (deseada && !musica && !musicaOff()) { const d = deseada; ponerMusica(d.url, d.vol / (niveles[d.url.split("/").pop()] ?? 1), d.opts); }
  };
  ["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, go, true));
}
function quitarMusica(ms = 1000, mantenerDeseada = false) {
  if (!mantenerDeseada) deseada = null;
  const m = musica; musica = null;
  if (m) fundido(m.a, 0, ms, () => m.a.pause());
}
function setMusica(on) {
  try { localStorage.setItem("cm-musica", on ? "1" : "0"); } catch {}
  if (!on) { const d = deseada; quitarMusica(400); deseada = d; } else if (deseada) { const d = deseada; ponerMusica(d.url, d.vol / (niveles[d.url.split("/").pop()] ?? 1), d.opts); }
  document.querySelectorAll(".cm-mus-btn").forEach((b) => (b.textContent = musicaOff() ? "🔇 Música" : "🔊 Música"));
}
function agacharMusica(bajo) { if (musica) fundido(musica.a, bajo ? musica.vol * 0.35 : musica.vol, bajo ? 350 : 1200); }
// portada: su canción una vez y luego el ambiente de la habitación, bajito
function ponerPortada(id) {
  ponerMusica(`${BASE}audio/portada_${id}.mp3`, 0.6, { bucle: false, luego: () => { if (current?.id === id) ponerMusica(`${BASE}audio/ambiente_${id}.mp3`, 0.22); } });
}
const sonarTema = () => ponerMusica(`${BASE}audio/tema_casa_maldita.mp3`, 0.55);
const callarTema = (ms = 1200) => quitarMusica(ms);

function musicaHabitacion() {
  if (!current) return callarTema();
  const covered = current.els.root?.classList.contains("cm-covered");
  if (covered) ponerPortada(current.id); else ponerMusica(`${BASE}audio/ambiente_${current.id}.mp3`, 0.22);
}
// volver=true: si debajo hay una habitación abierta, recupera su música
function cerrarVestibulo(volver = true) {
  document.getElementById(ID_LOBBY)?.remove();
  if (volver === false) callarTema(); else musicaHabitacion();
}

async function abrirVestibulo() {
  loadCss();
  stopVoice();
  document.getElementById(ID_LOBBY)?.remove();
  const grid = h("div", { class: "cm-doors" });
  const close = h("button", { class: "cm-mini cm-lobby-x", title: "Cerrar (Esc)", onclick: cerrarVestibulo }, "✕ salir");
  const musBtn = h("button", { class: "cm-mini cm-lobby-mus cm-mus-btn", title: "Música", onclick: () => setMusica(musicaOff()) }, musicaOff() ? "🔇 Música" : "🔊 Música");
  const lobby = h("div", { id: ID_LOBBY, class: "cm-root cm-lobby", onclick: (ev) => { if (ev.target === lobby) cerrarVestibulo(); } },
    h("div", { class: "cm-fog" }), h("div", { class: "cm-grain" }), h("div", { class: "cm-vignette" }),
    h("div", { class: "cm-lobby-inner" },
      h("header", { class: "cm-lobby-head" },
        h("div", { class: "cm-kicker" }, "EL VESTÍBULO"),
        h("h1", {}, "✝ LA CASA MALDITA ✝"),
        h("div", { class: "cm-sub" }, "Doce puertas. Detrás de cada una espera alguien… elige con cuidado."),
        musBtn, close),
      grid,
      h("footer", { class: "cm-foot" }, "LA CASA MALDITA · gustaafvito.creador.ia")));
  document.body.append(lobby);
  sonarTema();
  const esc = (ev) => { if (ev.key === "Escape") { cerrarVestibulo(); document.removeEventListener("keydown", esc); } };
  document.addEventListener("keydown", esc);

  const cfgs = await Promise.all(PUERTAS.map(([id]) => loadCfg(id).catch(() => ({ titulo: id }))));
  PUERTAS.forEach(([id, file], i) => {
    const cfg = cfgs[i], src = posterURL(cfg.poster);
    const sigil = () => h("div", { class: "cm-sigil cm-sigil-big" }, cfg.icono || "🕯");
    const door = h("button", { class: `cm-door${current?.id === id ? " here" : ""}`, title: `Entrar: ${cfg.titulo}`, onclick: () => abrirPuerta(id, file) },
      h("div", { class: "cm-door-art" }, src ? h("img", { src, alt: cfg.titulo, loading: "lazy", onerror: (ev) => ev.target.replaceWith(sigil()) }) : sigil(),
        h("span", { class: "cm-door-num" }, String(i + 1).padStart(2, "0"))),
      h("div", { class: "cm-door-copy" },
        h("div", { class: "cm-door-room" }, (cfg.habitacion || "").replace(/^HABITACIÓN\s+[IVXLC]+\s*·\s*/, "")),
        h("div", { class: "cm-door-name" }, `${cfg.icono || ""} ${cfg.titulo}`),
        h("div", { class: "cm-door-sub" }, cfg.subtitulo || "")));
    if (cfg.tema?.acento) door.style.setProperty("--cm-door", cfg.tema.acento);
    if (cfg.tema?.acento2) door.style.setProperty("--cm-door2", cfg.tema.acento2);
    grid.append(door);
  });
}

function doorButton() {
  if (document.getElementById(ID_DOOR)) return;
  document.body.append(h("button", { id: ID_DOOR, title: "Las 12 habitaciones de La Casa Maldita", onclick: abrirVestibulo }, "🏚 LA CASA"));
}

let syncing = false;
async function sync(force = false) {
  if (syncing) return;
  syncing = true;
  try {
    const id = spiritId();
    if (!id) { if (current || document.getElementById(ID_FAB)) unmount(); return; }
    if (force || !current || current.id !== id || current.graph !== app.graph) {
      const cfg = await loadCfg(id);
      mount(id, cfg);
    }
    const root = document.getElementById(ID_ROOT);
    if (root) { root.style.display = graphHidden ? "none" : ""; place(root); }
    document.body.classList.toggle("cm-active", !!root && !graphHidden);
    const f = fab(); f.style.display = graphHidden ? "" : "none";
  } catch (e) {
    console.error("[casa_maldita]", e);
  } finally { syncing = false; }
}

app.registerExtension({
  name: "gustaafvito.casa_maldita",
  async setup() {
    loadCss();
    doorButton();
    setInterval(() => sync(), 700);   // detecta cambio de pestaña/workflow
    window.addEventListener("resize", () => { const r = document.getElementById(ID_ROOT); if (r) place(r); });
  },
  async afterConfigureGraph() { graphHidden = false; await sync(true); },
});
