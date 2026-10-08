/** Thousands separators for a count in server copy: "500,000". */
export const formatCount = (n: number) => n.toLocaleString("en-US");

/** A price in USD: "$12.34", with a third decimal under a cent ("$0.004"). */
export const formatUsd = (usd: number) =>
  `$${usd.toFixed(usd > 0 && usd < 0.01 ? 3 : 2)}`;
