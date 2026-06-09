import { createHash, timingSafeEqual } from "node:crypto";

function compareText(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function compareHex(expectedHex: string, actualHex: string) {
  if (!/^[a-f0-9]+$/i.test(expectedHex) || !/^[a-f0-9]+$/i.test(actualHex)) {
    return false;
  }
  const left = Buffer.from(expectedHex.toLowerCase(), "hex");
  const right = Buffer.from(actualHex.toLowerCase(), "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Supports either:
 * 1) plain text passwords (`stored = hunter2`)
 * 2) prefixed sha256 hashes (`stored = sha256:<hex-digest>`)
 */
export function verifyPassword(stored: string, supplied: string) {
  if (stored.startsWith("sha256:")) {
    const expected = stored.slice("sha256:".length);
    const suppliedDigest = createHash("sha256").update(supplied, "utf8").digest("hex");
    return compareHex(expected, suppliedDigest);
  }

  return compareText(stored, supplied);
}
