import assert from "node:assert/strict";
import test from "node:test";
import { registerAlertTools } from "../dist/tools/alerts.js";
import { registerTradingTools } from "../dist/tools/trading.js";

const client = {};

function collectTools(register) {
  const names = [];
  const server = {
    registerTool(name) {
      names.push(name);
    },
  };

  register(server, client, true);
  return names;
}

test("readonly mode does not register trading tools", () => {
  assert.deepEqual(collectTools(registerTradingTools), []);
});

test("readonly mode registers only read-only alert tools", () => {
  assert.deepEqual(collectTools(registerAlertTools), ["get_alerts"]);
});
