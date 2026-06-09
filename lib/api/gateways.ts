import { apiRequest } from "./http";

export type GatewayCategory =
  | "gateway"
  | "cryptocurrency"
  | "wire_transfer"
  | "upi"
  | "local_depositor";

export type ManualGateway = {
  id: string;
  category: GatewayCategory;
  name: string;
  slug: string;
  details: string | null;
  cryptoAddress: string | null;
  vpaAddress: string | null;
  bankName: string | null;
  accountNumber: string | null;
  iconUrl: string | null;
  qrCodeUrl: string | null;
  processingTimeText: string;
  feeDisplay: string;
  minAmount: number;
  maxAmount: number;
  limitsCurrency: string;
  network: string | null;
  warningText: string | null;
  isActive: boolean;
  isRecommended: boolean;
  sortOrder: number;
};

export type GatewayCategoryGroup = {
  category: GatewayCategory;
  label: string;
  count: number;
  items: ManualGateway[];
};

export async function fetchPublicGateways() {
  return apiRequest<{ gateways: ManualGateway[]; categories: GatewayCategoryGroup[] }>(
    "/public/manual-gateways"
  );
}

export async function fetchPublicGateway(id: string) {
  return apiRequest<ManualGateway>(`/public/manual-gateways/${id}`);
}

export function resolveAssetUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5001";
    return `${base}${path}`;
  }
  return path;
}
