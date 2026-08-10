"use strict";

const { isDeepStrictEqual } = require("util");
const { dots } = require("./index.js");

/* ------------------------------------------------------------------ *
 * Tiny test harness                                                   *
 * ------------------------------------------------------------------ */

const C = process.stdout.isTTY
  ? {
      g: "\x1b[32m",
      r: "\x1b[31m",
      c: "\x1b[36m",
      d: "\x1b[90m",
      b: "\x1b[1m",
      x: "\x1b[0m",
    }
  : { g: "", r: "", c: "", d: "", b: "", x: "" };

let passed = 0;
let failed = 0;
let errors = null; // buffer for the test currently running

function record(message) {
  if (errors) errors.push(message);
  else throw new Error(`assertion outside it(): ${message}`);
}

function describe(name, fn) {
  console.log(`\n${C.b}${name}${C.x}`);
  fn();
}

function it(name, fn) {
  errors = [];
  try {
    fn();
  } catch (e) {
    errors.push(`threw ${e && e.name}: ${e && e.message}`);
  }
  const errs = errors;
  errors = null;

  if (errs.length === 0) {
    passed++;
    console.log(`  ${C.g}✔${C.x} ${name}`);
  } else {
    failed++;
    console.log(`  ${C.r}✘${C.x} ${name}`);
    for (const e of errs) console.log(`      ${C.r}${e}${C.x}`);
  }
}

function note(message) {
  console.log(`  ${C.c}ℹ${C.x} ${message}`);
}

function fmt(v, max = 200) {
  let s;
  if (v === undefined) s = "undefined";
  else {
    try {
      s = JSON.stringify(v);
    } catch {
      s = String(v);
    }
    if (s === undefined) s = String(v);
  }
  return s.length > max ? `${s.slice(0, max - 3)}...` : s;
}

const Test = {
  assertEquals(actual, expected, msg) {
    if (!Object.is(actual, expected)) {
      record(
        `Expected: ${fmt(expected)}, instead got: ${fmt(actual)}${msg ? ` — ${msg}` : ""}`,
      );
    }
  },
  assertDeepEquals(actual, expected, msg) {
    if (!isDeepStrictEqual(actual, expected)) {
      record(
        `Expected: ${fmt(expected)}, instead got: ${fmt(actual)}${msg ? ` — ${msg}` : ""}`,
      );
    }
  },
  assertSameSet(actual, expected, msg) {
    const a = new Set(actual);
    const b = new Set(expected);
    const missing = [...b].filter((v) => !a.has(v));
    const extra = [...a].filter((v) => !b.has(v));
    if (missing.length || extra.length) {
      record(
        `Set mismatch${msg ? ` — ${msg}` : ""}: missing ${missing.length} ${fmt(missing.slice(0, 5))}, ` +
          `unexpected ${extra.length} ${fmt(extra.slice(0, 5))}`,
      );
    }
  },
  expect(condition, msg) {
    if (!condition) record(msg || "Value is not what was expected");
  },
};

/* ------------------------------------------------------------------ *
 * Independent reference implementation (bitmask over the n-1 gaps)     *
 * ------------------------------------------------------------------ */

function reference(str) {
  if (str.length === 0) return [];
  const gaps = str.length - 1;
  const out = [];
  for (let mask = 0; mask < 2 ** gaps; mask++) {
    let s = str[0];
    for (let g = 0; g < gaps; g++) {
      if (mask & (1 << g)) s += ".";
      s += str[g + 1];
    }
    out.push(s);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Shared property checks                                              *
 * ------------------------------------------------------------------ */

function checkProperties(input, out) {
  const n = input.length;

  Test.expect(Array.isArray(out), `result must be an array, got ${typeof out}`);
  if (!Array.isArray(out)) return;

  Test.expect(
    out.every((v) => typeof v === "string"),
    "every element must be a string",
  );
  Test.assertEquals(
    out.length,
    2 ** (n - 1),
    `should produce 2^${n - 1} variants`,
  );
  Test.assertEquals(
    new Set(out).size,
    out.length,
    "all variants must be unique",
  );

  const notStripping = out.find((v) => v.split(".").join("") !== input);
  Test.expect(
    notStripping === undefined,
    `removing dots must give back "${input}", but got ${fmt(notStripping)}`,
  );

  const malformed = out.find(
    (v) => v.startsWith(".") || v.endsWith(".") || v.includes(".."),
  );
  Test.expect(
    malformed === undefined,
    `no leading / trailing / doubled dots allowed, got ${fmt(malformed)}`,
  );

  Test.assertSameSet(out, reference(input), `input "${input}"`);
}

/* ------------------------------------------------------------------ *
 * Tests                                                               *
 * ------------------------------------------------------------------ */

console.log(`${C.d}dots() — test suite${C.x}`);

describe("Example cases", () => {
  it('dots("a")', () => {
    Test.assertDeepEquals(dots("a"), ["a"]);
  });

  it('dots("ab")', () => {
    Test.assertDeepEquals(dots("ab"), ["ab", "a.b"]);
  });

  it('dots("abc")', () => {
    Test.assertDeepEquals(dots("abc"), ["abc", "a.bc", "ab.c", "a.b.c"]);
  });

  it('dots("abcd")', () => {
    Test.assertDeepEquals(dots("abcd"), [
      "abcd",
      "a.bcd",
      "ab.cd",
      "a.b.cd",
      "abc.d",
      "a.bc.d",
      "ab.c.d",
      "a.b.c.d",
    ]);
  });
});

describe("Edge cases", () => {
  // Contract choice: "" yields no arrangements. Swap both this and
  // reference() to [""] if you prefer the empty-case-is-identity reading.
  it('dots("") returns []', () => {
    Test.assertDeepEquals(dots(""), []);
  });

  it("every input returns an array — no caller-side special case", () => {
    for (const input of ["", "a", "ab", "abc"]) {
      Test.expect(
        Array.isArray(dots(input)),
        `dots(${fmt(input)}) must be an array, got ${typeof dots(input)}`,
      );
    }
  });

  it("count is 2^(n-1) for n>=1, and 0 for n=0", () => {
    for (const input of ["", "a", "ab", "abc", "abcd"]) {
      const n = input.length;
      Test.assertEquals(
        dots(input).length,
        n === 0 ? 0 : 2 ** (n - 1),
        `input ${fmt(input)}`,
      );
    }
  });

  it("single character returns an array, not a bare string", () => {
    const out = dots("z");
    Test.expect(
      Array.isArray(out),
      `expected an array, got ${typeof out} (${fmt(out)})`,
    );
    Test.assertDeepEquals(out, ["z"]);
  });

  it("repeated characters still produce unique variants", () => {
    Test.assertDeepEquals(dots("aaa"), ["aaa", "a.aa", "aa.a", "a.a.a"]);
  });

  it("non-letter characters are handled", () => {
    Test.assertDeepEquals(dots("1 2"), ["1 2", "1. 2", "1 .2", "1. .2"]);
  });
});

describe("Properties, n = 1..12", () => {
  const alphabet = "abcdefghijkl";
  for (let n = 1; n <= 12; n++) {
    const input = alphabet.slice(0, n);
    it(`n=${n}  "${input}"  ->  ${2 ** (n - 1)} variants`, () => {
      checkProperties(input, dots(input));
    });
  }
});

describe("Ordering matches the reference enumeration", () => {
  const alphabet = "abcdefghijkl";
  for (let n = 1; n <= 8; n++) {
    const input = alphabet.slice(0, n);
    it(`n=${n}  "${input}"`, () => {
      Test.assertDeepEquals(dots(input), reference(input));
    });
  }
});

describe("Purity", () => {
  it("is deterministic across calls", () => {
    Test.assertDeepEquals(dots("hello"), dots("hello"));
  });

  it("does not mutate a previously returned array", () => {
    const first = dots("abc");
    first.push("TAINTED");
    Test.assertDeepEquals(dots("abc"), ["abc", "a.bc", "ab.c", "a.b.c"]);
  });
});

describe("Fuzz, 200 seeded random inputs", () => {
  // mulberry32 — deterministic so failures are reproducible.
  function rng(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = rng(20260810);
  const chars = "aabbc12 _-XY";
  let firstFailure = null;
  let checked = 0;

  for (let i = 0; i < 200; i++) {
    const len = 1 + Math.floor(rand() * 9);
    let input = "";
    for (let j = 0; j < len; j++)
      input += chars[Math.floor(rand() * chars.length)];

    errors = [];
    checkProperties(input, dots(input));
    const errs = errors;
    errors = null;
    checked++;
    if (errs.length && !firstFailure) firstFailure = { input, errs };
  }

  it(`${checked} random strings of length 1..9`, () => {
    if (firstFailure) {
      record(`first failing input ${fmt(firstFailure.input)}:`);
      for (const e of firstFailure.errs) record(`  ${e}`);
    }
  });
});

describe("Stress", () => {
  it("n=18 produces 131072 variants", () => {
    const input = "abcdefghijklmnopqr";
    const t0 = process.hrtime.bigint();
    const out = dots(input);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;

    Test.assertEquals(out.length, 2 ** 17);
    Test.assertEquals(new Set(out).size, 2 ** 17, "all unique");
    Test.assertEquals(out[0], input, "first variant is the input itself");
    Test.assertEquals(
      out[out.length - 1],
      input.split("").join("."),
      "last variant is fully dotted",
    );
    note(
      `took ${ms.toFixed(1)} ms — growth is 2^n, so n=25 would be ~256x this`,
    );
  });
});

describe("Notes (not assertions)", () => {
  const emoji = "\u{1F600}a"; // one emoji + "a"
  const out = dots(emoji);
  note(
    `dots("😀a") returns ${out.length} variants, not 2 — str[0] indexes UTF-16 code units, ` +
      `so surrogate pairs get split. Use [...str] if astral characters must stay intact.`,
  );

  let thrown = "nothing";
  try {
    dots(undefined);
  } catch (e) {
    thrown = `${e.name}: ${e.message}`;
  }
  note(`dots(undefined) -> ${thrown} (input validation is unspecified)`);
});

/* ------------------------------------------------------------------ *
 * Summary                                                             *
 * ------------------------------------------------------------------ */

const total = passed + failed;
console.log(
  `\n${failed === 0 ? C.g : C.r}${C.b}${passed}/${total} tests passed` +
    `${failed ? `, ${failed} failed` : ""}${C.x}\n`,
);

process.exit(failed === 0 ? 0 : 1);
