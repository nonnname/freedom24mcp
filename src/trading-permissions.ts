const TRUTHY_ALLOW_TRADING_VALUES = new Set(["true", "1", "yes", "on"]);

export function parseAllowTradingEnv(value: string | undefined): boolean {
  if (value === undefined) return false;
  return TRUTHY_ALLOW_TRADING_VALUES.has(value.trim().toLowerCase());
}
