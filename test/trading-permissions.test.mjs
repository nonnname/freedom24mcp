import assert from "node:assert/strict";
import test from "node:test";
import { parseAllowTradingEnv } from "../dist/trading-permissions.js";

test("allow trading env is disabled by default", () => {
  assert.equal(parseAllowTradingEnv(undefined), false);
});

test("allow trading env accepts common truthy values case-insensitively", () => {
  for (const value of ["true", "TRUE", " 1 ", "yes", "Yes", "on"]) {
    assert.equal(parseAllowTradingEnv(value), true);
  }
});

test("allow trading env treats other values as disabled", () => {
  for (const value of ["", "false", "0", "no", "off"]) {
    assert.equal(parseAllowTradingEnv(value), false);
  }
});
