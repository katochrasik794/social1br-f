export const mamSettings = {
  enableMam: true,
  defaultLotMultiplier: 1,
  maxLotMultiplier: 5,
  platformFeePct: 5,
  forceKyc: true,
  minAccountBalance: 1000,
};

export const mockMamManagers = [
  {
    id: 1,
    displayName: "TrendMaster",
    headline: "Trend following on majors",
    winRate: 66.4,
    followersCount: 45,
    feePct: 20,
    lotScaling: "Proportional",
    aum: 980000,
    monthlyReturnPct: 14.2,
    riskLevel: "Medium" as const,
    status: "approved",
  },
  {
    id: 2,
    displayName: "ScalpPro",
    headline: "High-frequency scalping",
    winRate: 58.9,
    followersCount: 28,
    feePct: 25,
    lotScaling: "Fixed lot",
    aum: 520000,
    monthlyReturnPct: 22.1,
    riskLevel: "High" as const,
    status: "approved",
  },
];

export const mockManagedLinks = [
  { id: 1, managerName: "TrendMaster", managerId: 1, accountLogin: "88210452", lotMultiplier: 1.0, maxLot: 2, pnlPct: 9.2, status: "Active", linkedAt: "2025-11-01" },
  { id: 2, managerName: "ScalpPro", managerId: 2, accountLogin: "88210454", lotMultiplier: 0.5, maxLot: 1, pnlPct: -2.1, status: "Paused", linkedAt: "2025-12-10" },
];

export const mockMamManagerProfile = {
  status: "approved" as "none" | "pending" | "approved" | "rejected",
  displayName: "TrendMaster",
  strategy: "Trend following with ATR-based stops",
  feePct: 20,
  linkedAccounts: [
    { id: 1, investorEmail: "inv1@example.com", accountLogin: "88210460", lotMultiplier: 1.0, balance: 25000, pnlPct: 7.4, status: "Active" },
    { id: 2, investorEmail: "inv2@example.com", accountLogin: "88210461", lotMultiplier: 0.8, balance: 18000, pnlPct: 5.1, status: "Active" },
    { id: 3, investorEmail: "inv3@example.com", accountLogin: "88210462", lotMultiplier: 1.2, balance: 42000, pnlPct: 11.8, status: "Active" },
  ],
  totalAum: 980000,
  followersCount: 45,
};

export const mockAdminMamInvestors = mockManagedLinks.map((link, i) => ({
  ...link,
  investorEmail: `investor${i + 1}@example.com`,
}));

export const mockAdminMamManagers = [
  { id: 1, displayName: "TrendMaster", email: "trend@example.com", status: "Approved", linkedAccounts: 45, aum: 980000 },
  { id: 2, displayName: "New MAM", email: "newmam@example.com", status: "Pending", linkedAccounts: 0, aum: 0 },
];
