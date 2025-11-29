export const UserRole = {
  ADMIN: "admin",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AssetType = {
  STARTUP: "Startup",
  CRYPTO_FUND: "Crypto Fund",
  FARMLAND: "Farmland",
  COLLECTIBLE: "Collectible",
  OTHER: "Other",
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt?: string;
}

export interface Asset {
  id: string;
  assetName: string;
  assetType: AssetType;
  currentPerformance: number;
  lastUpdated: string;
  isListed: boolean;
}

export interface AssetPerformanceHistory {
  id: string;
  assetId: string;
  date: string;
  percentageChange: number;
}

export interface Investment {
  id: string;
  userId: string;
  assetId: string;
  investedAmount: number;
  investmentDate: string;
  assetPerformanceAtInvestment: number;
}

export interface InvestmentWithAsset extends Investment {
  asset: Asset;
  currentValue: number; // Calculated field
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
