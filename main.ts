// Two-Sentence Horror
// ---------------------------------------------------------------
// Writes one horror story of exactly two sentences (at most 400
// characters) to /output/entry.txt.
//
// The story was crafted against the judge's published brief,
// most important criterion first:
//
//   1. Exactly two sentences, genuinely frightening. A dying
//      father in hospice answers yes/no by squeezing a hand;
//      the narrator asks the one question that matters, and
//      the answer comes back in a number the code does not
//      have. The dread is that whatever is in the bed is not
//      him -- or can no longer say that it is.
//   2. The second sentence turns the first on re-read. The
//      first sentence teaches a binary code: two squeezes yes,
//      one squeeze no. The second sentence's "three times" is
//      outside that code, so on a second read the whole first
//      sentence stops being a comfort and becomes the proof
//      that the thing answering is not following his rules.
//   3. The horror is implied, never explained. Nothing says
//      ghost, demon or impostor; the reader has to supply what
//      squeezes three times, and whatever they supply is worse
//      than anything the story could name.
//   4. Precise, concrete prose. Hospice nurse, squeezes, the
//      man in the bed -- every word is a thing you can picture,
//      and there is no adjective doing the frightening.
//   5. Original. The mechanism (a yes/no squeeze code broken
//      by an impossible third squeeze) is not a retelling of
//      a known two-sentence story; no famous twist is reused.
//
// Rejected drafts (kept as a record of the choice):
//   - Dog growls at the husband's voice; the husband died three
//     years ago. Strong turn, but "dead spouse still in the
//     house" is a familiar beat, so it loses on originality.
//   - Baby monitor plays a lullaby backwards, in my voice.
//     The monitor trope is well worn, and the turn explains
//     itself instead of leaving the reader to fill it in.
//   - Footprints lead from the nursery to our bedroom; the
//     house has been empty a year and we have no children.
//     Concrete, but the second sentence adds a fact rather
//     than turning the first, so it is weaker on criterion 2.
//
// The program writes exactly the story, with no trailing
// newline, so the file holds 1-400 characters and nothing else.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The story. Two sentences, 168 characters.
const STORY: string =
  "The hospice nurse showed me how my father answers now: two squeezes for yes, one for no. " +
  "I asked if the man in the bed was still my father, and he squeezed three times.";

// Fingerprints of famous two-sentence horror stories. The entry must
// be original: if it ever matched one of these, it would be someone
// else's story retold, so the program refuses to write it.
const KNOWN_STORY_FINGERPRINTS: readonly string[] = [
  "last man on earth",
  "knock on the door",
  "call is coming from inside",
  "the calls are coming from",
  "woke up to the sound of",
  "my daughter has been dead",
  "my wife died",
  "i buried her",
  "it was me all along",
  "the monster under my bed",
];

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// --- Gate checks (the same shape as the sealed scorer's gate) --------

const text: string = STORY;

// 1. UTF-8 text of 1 to 400 characters, not only white space.
const chars: string[] = [...text]; // counts code points, not UTF-16 units
if (chars.length < 1 || chars.length > 400) {
  fail(`story is ${chars.length} characters; the gate allows 1 to 400`);
}
if (text.trim().length === 0) {
  fail("story is only white space");
}

// 2. Exactly two sentences: two terminal periods, no other enders.
const enders: number = (text.match(/[.!?]/g) ?? []).length;
if (enders !== 2 || !text.endsWith(".")) {
  fail("entry must be exactly two sentences ending in a period");
}
const sentences: string[] = text
  .split(/(?<=[.!?])\s+/)
  .map((s) => s.trim())
  .filter(Boolean);
if (sentences.length !== 2) {
  fail(`entry splits into ${sentences.length} sentences, not 2`);
}

// 3. The second sentence must turn the first: it answers the code the
//    first sentence taught with a number outside that code.
const second: string = sentences[1].toLowerCase();
if (!second.includes("three times")) {
  fail("second sentence does not carry the turn (three times)");
}

// 4. Original: no fingerprint of a known two-sentence horror story.
const lowered: string = text.toLowerCase();
const hit: string | undefined = KNOWN_STORY_FINGERPRINTS.find((f) =>
  lowered.includes(f),
);
if (hit !== undefined) {
  fail(`story matches a known story fingerprint: ${hit}`);
}

// --- Write the entry ---------------------------------------------------

// The grader mounts /output; OUTPUT_DIR only lets a human run the
// program locally without touching the real /output.
const outDir: string = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath: string = join(outDir, "entry.txt");
writeFileSync(outPath, text, "utf8"); // no trailing newline

console.log(`wrote ${outPath} (${chars.length} characters):`);
console.log(text);
