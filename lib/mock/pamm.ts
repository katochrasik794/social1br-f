export const pammSettings = {
  enablePamm: true,
  minInvestment: 500,
  maxInvestorsPerPool: 100,
  platformFeePct: 5,
  forceKyc: true,
  defaultManagementFeePct: 2,
  defaultPerformanceFeePct: 20,
};

export const mockPools = [
  {
    id: 1,
    name: "Alpha Growth Pool",
    managerName: "Marcus Chen",
    minDeposit: 1000,
    feePct: 20,
    managementFeePct: 2,
    riskProfile: "Medium" as const,
    nav: 2450000,
    monthlyReturnPct: 11.2,
    investorsCount: 42,
    status: "active",
  },
  {
    id: 2,
    name: "Conservative Income",
    managerName: "Sarah Williams",
    minDeposit: 500,
    feePct: 15,
    managementFeePct: 1.5,
    riskProfile: "Low" as const,
    nav: 890000,
    monthlyReturnPct: 5.4,
    investorsCount: 78,
    status: "active",
  },
  {
    id: 3,
    name: "Aggressive Alpha",
    managerName: "David Park",
    minDeposit: 2500,
    feePct: 25,
    managementFeePct: 2.5,
    riskProfile: "High" as const,
    nav: 1560000,
    monthlyReturnPct: 19.8,
    investorsCount: 23,
    status: "active",
  },
];

export const mockInvestments = [
  { id: 1, poolName: "Alpha Growth Pool", poolId: 1, amount: 10000, sharePct: 0.41, pnlPct: 8.6, status: "Active", investedAt: "2025-10-15" },
  { id: 2, poolName: "Conservative Income", poolId: 2, amount: 5000, sharePct: 0.56, pnlPct: 3.1, status: "Active", investedAt: "2025-11-01" },
  { id: 3, poolName: "Alpha Growth Pool", poolId: 1, amount: 2000, sharePct: 0.08, pnlPct: 0, status: "Pending", investedAt: "2026-01-20" },
];

export const mockPammManagerProfile = {
  status: "approved" as "none" | "pending" | "approved" | "rejected",
  poolName: "Alpha Growth Pool",
  strategy: "Multi-asset growth with quarterly rebalancing",
  minDeposit: 1000,
  feePct: 20,
  riskProfile: "Medium",
  nav: 2450000,
  investorsCount: 42,
  monthlyReturnPct: 11.2,
  investors: [
    { id: 1, email: "inv1@example.com", amount: 25000, sharePct: 1.02, status: "Active", joinedAt: "2025-08-01" },
    { id: 2, email: "inv2@example.com", amount: 15000, sharePct: 0.61, status: "Active", joinedAt: "2025-09-15" },
  ],
};

export const mockAdminPammInvestors = mockInvestments.map((inv, i) => ({
  ...inv,
  investorEmail: `investor${i + 1}@example.com`,
}));

export const mockAdminPammManagers = [
  { id: 1, name: "Marcus Chen", poolName: "Alpha Growth Pool", email: "marcus@example.com", status: "Approved", nav: 2450000, investors: 42 },
  { id: 2, name: "Pending Manager", poolName: "New Pool", email: "pending@example.com", status: "Pending", nav: 0, investors: 0 },
];
