// The World Today - one dense newspaper page summing up Monday 23 November 2026.
// Renders 31 verified stories from 7 regions as a 1024x1024 PNG.
// Deterministic: no network, no clock, no randomness. Two runs write
// byte-identical files. Pure Node standard library only.
//
// The glyphs come from a tiny 1-bit bitmap atlas baked into this file
// (two DejaVu Serif faces, bold 20px and regular 13px, ASCII 32..126).
// Atlas record per glyph: advance, ink width, ink height, y offset + 128,
// x offset + 128, then the row-major MSB-first bitmap bytes.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ATLAS_B64 =
  "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";

// ---- atlas decoding -------------------------------------------------------

const FACE_COUNT = 2;
const GLYPHS_PER_FACE = 95;
const FIRST_CHAR = 32;

function decodeAtlas() {
  const raw = Buffer.from(ATLAS_B64, "base64");
  const faces = [];
  let pos = 0;
  for (let f = 0; f < FACE_COUNT; f++) {
    const glyphs = [];
    for (let c = 0; c < GLYPHS_PER_FACE; c++) {
      const adv = raw[pos];
      const inkW = raw[pos + 1];
      const inkH = raw[pos + 2];
      const yOff = raw[pos + 3] - 128;
      const xOff = raw[pos + 4] - 128;
      pos += 5;
      const byteCount = Math.ceil((inkW * inkH) / 8);
      const bits = raw.subarray(pos, pos + byteCount);
      pos += byteCount;
      glyphs.push({ adv, inkW, inkH, yOff, xOff, bits });
    }
    faces.push(glyphs);
  }
  return faces;
}

const FACES = decodeAtlas();
const BOLD = 0; // DejaVu Serif Bold 20px
const REG = 1; // DejaVu Serif 13px

function textWidth(face, text, scale) {
  let w = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0) - FIRST_CHAR;
    if (code < 0 || code >= GLYPHS_PER_FACE) continue;
    w += FACES[face][code].adv;
  }
  return w * scale;
}

// ---- canvas ---------------------------------------------------------------

const W = 1024;
const H = 1024;
const PAPER = [251, 247, 238];
const INK = [22, 22, 22];
const ACCENT = [140, 29, 24];
const FAINT = [178, 168, 148];

const buf = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  buf[i * 3] = PAPER[0];
  buf[i * 3 + 1] = PAPER[1];
  buf[i * 3 + 2] = PAPER[2];
}

function setPx(x, y, rgb) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const o = (y * W + x) * 3;
  buf[o] = rgb[0];
  buf[o + 1] = rgb[1];
  buf[o + 2] = rgb[2];
}

function fillRect(x, y, w, h, rgb) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPx(xx, yy, rgb);
  }
}

function drawText(face, text, x, top, scale, rgb) {
  let pen = x;
  for (const ch of text) {
    const code = ch.charCodeAt(0) - FIRST_CHAR;
    if (code < 0 || code >= GLYPHS_PER_FACE) {
      pen += 4 * scale;
      continue;
    }
    const g = FACES[face][code];
    for (let row = 0; row < g.inkH; row++) {
      for (let col = 0; col < g.inkW; col++) {
        const bitIndex = row * g.inkW + col;
        const byte = g.bits[Math.floor(bitIndex / 8)];
        const bit = (byte >> (7 - (bitIndex % 8))) & 1;
        if (!bit) continue;
        const px = pen + (g.xOff + col) * scale;
        const py = top + (g.yOff + row) * scale;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) setPx(px + sx, py + sy, rgb);
        }
      }
    }
    pen += g.adv * scale;
  }
  return pen;
}

function drawTextCentred(face, text, centreX, top, scale, rgb) {
  const w = textWidth(face, text, scale);
  drawText(face, text, Math.round(centreX - w / 2), top, scale, rgb);
}

// ---- PNG encoding (fixed, deterministic) -----------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}

function encodePng() {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    buf.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- stories ---------------------------------------------------------------
// Each entry: section label, bold one-line headline, one-line summary,
// reporting outlet. All 31 items were checked against reports dated
// Monday 23 November 2026; seven candidates dated 19-22 or 24 November
// were dropped (Poland missile landings, the Libya corvette strike,
// the APEC close, the Sinaloa capture announcement, the Seoul airspace
// scare, the Pyongyang Swiss-office threat, Sunday's Delta delays).

const SECTIONS = [
  {
    label: "CLIMATE",
    items: [
      ["COP31 collapses with no deal", "Nearly 200 nations leave Antalya with no pact.", "CNBC"],
      ["UN chief 'deeply disappointed'", "Guterres urges nations to press on despite failure.", "Reuters"],
      ["Calls grow to reform climate talks", "COP31 failure revives doubts over the UN process.", "The Guardian"],
    ],
  },
  {
    label: "MIDDLE EAST",
    items: [
      ["Israeli strikes kill three in Gaza", "An UNRWA worker is among the dead as the truce frays.", "Reuters"],
      ["Hamas urges mediator talks", "Group wants urgent talks after a strike kills aid staff.", "MENAFN"],
      ["Eisenkot: settler arson is terrorism", "Israel's PM-elect condemns attacks on West Bank villages.", "Reuters"],
      ["Iran vows to fight US blockade", "Tehran will use every means against the naval cordon.", "Al Jazeera"],
      ["Qatar holds talks in Tehran", "Diplomacy pushes to end the war shaking the region.", "Reuters"],
      ["Oil steady as Gulf risk lingers", "Prices hold in a tight range after Gulf attacks.", "Reuters"],
    ],
  },
  {
    label: "EUROPE",
    items: [
      ["NATO sends spy planes to Poland", "Early-warning aircraft deploy after Russian missiles land.", "BBC"],
      ["EU approves its 2027 budget", "Council gives the plan its final green light.", "European Council"],
      ["EU plans 22nd Russia sanctions", "New package targets banks, crypto platforms, ex-soldiers.", "Reuters"],
      ["Belgian strike grounds flights", "Austerity protest halts airports, strands 50,000 travellers.", "BBC"],
      ["German car plants hit by strikes", "Mercedes and BMW workers walk out for 24 hours over pay.", "Reuters"],
      ["Eurozone inflation hits 4.0%", "Eurostat reports rising prices alongside new GDP data.", "Eurostat"],
    ],
  },
  {
    label: "ASIA-PACIFIC",
    items: [
      ["24 killed in Indonesia factory fire", "Rescuers search for dozens missing after the plant blaze.", "AP"],
      ["India gives Nepal $1.62bn aid", "Package backs recovery after floods batter the state.", "Reuters"],
      ["Seoul minister quits over exam row", "Education chief resigns after AI cheating chaos in test.", "AP"],
      ["Thai court halves MP's jail term", "Appeal judges cut the sentence in a royal insult case.", "Reuters"],
      ["Tajikistan quits war crimes court", "Fourth state to quit the ICC after a US push.", "Reuters"],
      ["Macquarie buys Asia tower assets", "$1.2bn deal covers telecom towers in five markets.", "Reuters"],
    ],
  },
  {
    label: "AFRICA",
    items: [
      ["Drones hit UN building in Khartoum", "UN and US condemn strikes that killed four in the capital.", "AFP"],
      ["Kenya, DR Congo restore ties", "Neighbours agree to return ambassadors after a rift.", "allAfrica"],
      ["IMF: Botswana needs new model", "Fund says the diamond economy must diversify as debt hits 34%.", "IMF"],
    ],
  },
  {
    label: "AMERICAS",
    items: [
      ["Nvidia brings back Jensen Huang", "Board reinstates the CEO after Trump pressed for his return.", "Reuters"],
      ["Nasdaq has best day since April", "Nvidia jumps 31.5% as the AI sell-off suddenly reverses.", "Motley Fool"],
      ["Trump heads to Mar-a-Lago", "President flies south for Thanksgiving.", "Palm Beach Post"],
      ["Giuliani to get Medal of Freedom", "Trump will honour the former New York mayor on Tuesday.", "Breitbart"],
      ["Army to detonate lead in Iowa", "Emergency powers invoked to clear ordnance, bypassing a court.", "AP"],
    ],
  },
  {
    label: "TECHNOLOGY",
    items: [
      ["AI 'proves' Riemann hypothesis", "Anthropic says its model produced a proof of the puzzle.", "Anthropic"],
      ["NHS trials AI breast screening", "Major trial tests whether AI can spot cancer earlier.", "BBC"],
    ],
  },
];

const LEFT_SECTIONS = [0, 1, 2]; // Climate, Middle East, Europe
const RIGHT_SECTIONS = [3, 4, 5, 6]; // Asia-Pacific, Africa, Americas, Technology

// ---- layout ----------------------------------------------------------------

const MARGIN = 30;
const COL_W = 468;
const LEFT_X = MARGIN;
const RIGHT_X = MARGIN + COL_W + 28;
const COL_TOP = 148;
const STORY_H = 46;
const HEAD_H = 22;
const SECTION_H = 28;

function fitLine(face, text, scale, maxW) {
  if (textWidth(face, text, scale) <= maxW) return text;
  let cut = text;
  while (cut.length > 4 && textWidth(face, cut + "...", scale) > maxW) {
    cut = cut.slice(0, -1);
  }
  return cut + "...";
}

function drawSection(x, y, section, extraGap) {
  drawText(BOLD, section.label, x, y, 1, ACCENT);
  fillRect(x, y + 24, COL_W, 1, ACCENT);
  let cy = y + SECTION_H;
  for (const [headline, summary, source] of section.items) {
    const head = fitLine(BOLD, headline, 1, COL_W);
    drawText(BOLD, head, x, cy, 1, INK);
    const line = fitLine(REG, summary + " - " + source, 1, COL_W);
    drawText(REG, line, x, cy + HEAD_H, 1, INK);
    cy += STORY_H;
  }
  return cy + extraGap;
}

function render() {
  drawTextCentred(BOLD, "THE WORLD TODAY", W / 2, 16, 3, INK);
  fillRect(MARGIN, 88, W - 2 * MARGIN, 2, INK);
  drawTextCentred(BOLD, "MONDAY, 23 NOVEMBER 2026  |  31 STORIES FROM 7 REGIONS", W / 2, 98, 1, INK);
  fillRect(MARGIN, 126, W - 2 * MARGIN, 2, INK);
  fillRect(MARGIN, 130, W - 2 * MARGIN, 1, INK);

  let y = COL_TOP;
  for (const i of LEFT_SECTIONS) y = drawSection(LEFT_X, y, SECTIONS[i], 25);
  y = COL_TOP;
  for (const i of RIGHT_SECTIONS) y = drawSection(RIGHT_X, y, SECTIONS[i], 0);

  fillRect(MARGIN, 1008, W - 2 * MARGIN, 1, FAINT);
}

// ---- entry point ------------------------------------------------------------

function main() {
  render();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "entry.png");
  const png = encodePng();
  fs.writeFileSync(outPath, png);
  console.log("WROTE " + outPath + " " + png.length + " bytes");
}

main();
