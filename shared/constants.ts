import { AssetType } from './types';

export const ASSET_TYPES: AssetType[] = [
  AssetType.STARTUP,
  AssetType.CRYPTO_FUND,
  AssetType.FARMLAND,
  AssetType.COLLECTIBLE,
  AssetType.OTHER,
];

export const MOCK_INVESTMENTS = [
  {
    id: '1',
    assetName: 'SpaceX Series N',
    assetType: AssetType.STARTUP,
    investedAmount: 500000,
    investmentDate: '2022-03-15',
    currentValue: 650000,
    owners: ['Admin User'],
    updatedAt: '2023-12-01',
  },
  {
    id: '2',
    assetName: 'Bitcoin Alpha Fund',
    assetType: AssetType.CRYPTO_FUND,
    investedAmount: 250000,
    investmentDate: '2021-08-10',
    currentValue: 180000,
    owners: ['John Doe', 'Admin User'],
    updatedAt: '2024-01-15',
  },
  {
    id: '3',
    assetName: 'Napa Valley Vineyard',
    assetType: AssetType.FARMLAND,
    investedAmount: 1000000,
    investmentDate: '2020-01-20',
    currentValue: 1250000,
    owners: ['Family Trust'],
    updatedAt: '2023-11-20',
  },
  {
    id: '4',
    assetName: 'Rare Charizard',
    assetType: AssetType.COLLECTIBLE,
    investedAmount: 50000,
    investmentDate: '2019-05-05',
    currentValue: 350000,
    owners: ['Admin User'],
    updatedAt: '2024-02-01',
  },
];