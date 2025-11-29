export const UserRole = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const AssetType = {
  STARTUP: 'Startup',
  CRYPTO_FUND: 'Crypto Fund',
  FARMLAND: 'Farmland',
  COLLECTIBLE: 'Collectible',
  OTHER: 'Other',
} as const;

export type AssetType = typeof AssetType[keyof typeof AssetType];

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Investment {
  id: string;
  assetName: string;
  assetType: AssetType;
  investedAmount: number;
  investmentDate: string;
  currentValue: number;
  owners: string[]; // List of user IDs or Names
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}