import { faker } from "@faker-js/faker";
import argon2 from "argon2";
import mongoose from "mongoose";
import { AssetType, UserRole } from "../../shared/types";
import { connectDB } from "./connection";
import Asset from "./models/Asset";
import AssetPerformanceHistory from "./models/AssetPerformanceHistory";
import Investment from "./models/Investment";
import User from "./models/User";

const NUM_USERS = 30;
const NUM_ASSETS = 100;
const NUM_INVESTMENTS = 500;
const NUM_PERFORMANCE_UPDATES_PER_ASSET = 10;
const ONE_DAY = 24 * 60 * 60 * 1000;

const DEFAULT_ADMIN_NAME = "Admin User";
const DEFAULT_ADMIN_EMAIL = "admin@altfolio.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const USERS_PASSWORD = "password123";

const assetTypes = Object.values(AssetType);

// Asset names by type for more realistic data
const assetNamesByType: Record<string, string[]> = {
  [AssetType.STARTUP]: [
    "TechVenture AI",
    "CloudSync Solutions",
    "HealthTech Innovations",
    "FinanceFlow App",
    "EduLearn Platform",
    "GreenEnergy Systems",
    "FoodTech Delivery",
    "SmartHome Devices",
    "CyberSec Pro",
    "DataAnalytics Plus",
    "BioTech Labs",
    "RoboticsCo",
    "SpaceTech Ventures",
    "MediaStream Inc",
    "SocialConnect App",
    "EcoFriendly Products",
    "MobilePay Solutions",
    "VirtualReality World",
    "BlockchainPro",
    "AgriTech Farms",
  ],
  [AssetType.CRYPTO_FUND]: [
    "Bitcoin Growth Fund",
    "Ethereum Alpha Fund",
    "DeFi Opportunities Fund",
    "Crypto Diversified Portfolio",
    "Digital Assets Fund",
    "Blockchain Ventures Fund",
    "Altcoin Strategic Fund",
    "Web3 Innovation Fund",
    "NFT & Metaverse Fund",
    "Crypto Hedge Fund",
    "Stablecoin Plus Fund",
    "DeFi Yield Fund",
    "Layer 2 Solutions Fund",
    "GameFi Investment Fund",
    "Smart Contract Fund",
  ],
  [AssetType.FARMLAND]: [
    "Midwest Corn Fields",
    "California Vineyards",
    "Organic Farm Holdings",
    "Sustainable Agriculture Land",
    "Texas Ranch Properties",
    "Midwest Soybean Farms",
    "Oregon Fruit Orchards",
    "Florida Citrus Groves",
    "Iowa Agricultural Land",
    "Montana Cattle Ranch",
    "Washington Apple Orchards",
    "Vermont Dairy Farms",
    "Kansas Wheat Fields",
    "Georgia Pecan Groves",
    "Pennsylvania Farmland",
  ],
  [AssetType.COLLECTIBLE]: [
    "Vintage Baseball Cards",
    "Rare Comic Books",
    "Classic Car Collection",
    "Fine Art Portfolio",
    "Antique Furniture",
    "Limited Edition Watches",
    "Rare Coins Collection",
    "Vintage Wine Collection",
    "Historical Manuscripts",
    "Designer Handbags",
    "Vintage Vinyl Records",
    "Sports Memorabilia",
    "Rare Stamps Collection",
    "Antique Jewelry",
    "Collector Sneakers",
    "Fine Whiskey Collection",
  ],
  [AssetType.OTHER]: [
    "Precious Metals Portfolio",
    "Commodity Index Fund",
    "Real Estate Crowdfunding",
    "Private Equity Fund",
    "Venture Debt Fund",
    "Infrastructure Fund",
    "Music Royalties",
    "Film Production Rights",
    "Patent Portfolio",
    "Domain Name Portfolio",
    "Timber Investment",
    "Water Rights",
    "Carbon Credits",
    "Renewable Energy Credits",
    "Intellectual Property Rights",
  ],
};

const getRandomAssetName = (assetType: AssetType): string => {
  const names = assetNamesByType[assetType];
  return faker.helpers.arrayElement(names);
};

const createUsers = async (): Promise<mongoose.Types.ObjectId[]> => {
  const users = [];

  // Create admin user
  const adminPasswordHash = await argon2.hash(DEFAULT_ADMIN_PASSWORD);
  users.push({
    name: DEFAULT_ADMIN_NAME,
    email: DEFAULT_ADMIN_EMAIL,
    passwordHash: adminPasswordHash,
    role: UserRole.ADMIN,
  });

  // Create regular users
  for (let i = 0; i < NUM_USERS - 1; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const passwordHash = await argon2.hash(USERS_PASSWORD);

    users.push({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      passwordHash: passwordHash,
      role: UserRole.VIEWER,
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`✓ Created ${createdUsers.length} users`);

  return createdUsers.map((user) => user._id as mongoose.Types.ObjectId);
};

const createAssets = async (): Promise<mongoose.Types.ObjectId[]> => {
  const assets = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < NUM_ASSETS; i++) {
    const assetType = faker.helpers.arrayElement(assetTypes);
    let assetName = getRandomAssetName(assetType);

    // Ensure unique asset names
    while (usedNames.has(assetName)) {
      assetName = `${getRandomAssetName(assetType)} ${i}`;
    }
    usedNames.add(assetName);

    // Start with a random initial performance between -50% and +200%
    const currentPerformance = faker.number.float({
      min: -50,
      max: 200,
      fractionDigits: 2,
    });

    // 20% of assets are unlisted (not available for new investments)
    const isListed = faker.datatype.boolean(0.8);

    assets.push({
      assetName,
      assetType,
      currentPerformance,
      lastUpdated: new Date(),
      isListed,
    });
  }

  const createdAssets = await Asset.insertMany(assets);
  const listedCount = createdAssets.filter(a => a.isListed).length;
  const unlistedCount = createdAssets.length - listedCount;
  console.log(`✓ Created ${createdAssets.length} assets (${listedCount} listed, ${unlistedCount} unlisted)`);

  return createdAssets.map((asset) => asset._id as mongoose.Types.ObjectId);
};

const createPerformanceHistory = async (
  assetIds: mongoose.Types.ObjectId[]
): Promise<void> => {
  const historyEntries = [];

  for (const assetId of assetIds) {
    const asset = await Asset.findById(assetId);
    if (!asset) continue;

    // Create historical performance data over the last year
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * ONE_DAY);

    // Initial entry (1 year ago)
    let currentPerf = 0;
    historyEntries.push({
      assetId,
      date: oneYearAgo,
      percentageChange: currentPerf,
    });

    // Generate performance updates at regular intervals
    for (let i = 1; i < NUM_PERFORMANCE_UPDATES_PER_ASSET; i++) {
      const daysAgo = 365 - (i * 365) / NUM_PERFORMANCE_UPDATES_PER_ASSET;
      const date = new Date(now.getTime() - daysAgo * ONE_DAY);

      // Random walk: change by -20% to +20% from previous
      const change = faker.number.float({
        min: -20,
        max: 20,
        fractionDigits: 2,
      });
      currentPerf += change;

      historyEntries.push({
        assetId,
        date,
        percentageChange: currentPerf,
      });
    }

    // Final entry (current performance)
    historyEntries.push({
      assetId,
      date: now,
      percentageChange: asset.currentPerformance,
    });
  }

  await AssetPerformanceHistory.insertMany(historyEntries);
  console.log(`✓ Created ${historyEntries.length} performance history entries`);
};

const createInvestments = async (
  userIds: mongoose.Types.ObjectId[],
  assetIds: mongoose.Types.ObjectId[]
): Promise<void> => {
  const investments = [];

  for (let i = 0; i < NUM_INVESTMENTS; i++) {
    const userId = faker.helpers.arrayElement(userIds);
    const assetId = faker.helpers.arrayElement(assetIds);

    // Fetch the asset to determine investment amount range
    const asset = await Asset.findById(assetId);
    if (!asset) continue;

    // Generate investment amount based on asset type
    let investedAmount: number;
    switch (asset.assetType) {
      case AssetType.STARTUP:
        investedAmount = faker.number.int({ min: 5_000, max: 500_000 });
        break;
      case AssetType.CRYPTO_FUND:
        investedAmount = faker.number.int({ min: 1_000, max: 250_000 });
        break;
      case AssetType.FARMLAND:
        investedAmount = faker.number.int({ min: 50_000, max: 2_000_000 });
        break;
      case AssetType.COLLECTIBLE:
        investedAmount = faker.number.int({ min: 500, max: 100_000 });
        break;
      case AssetType.OTHER:
        investedAmount = faker.number.int({ min: 10_000, max: 500_000 });
        break;
      default:
        investedAmount = faker.number.int({ min: 1_000, max: 100_000 });
    }

    // Generate investment date within the last 2 years
    const investmentDate = faker.date.between({
      from: new Date(Date.now() - 2 * 365 * ONE_DAY),
      to: new Date(),
    });

    // Get asset performance at the time of investment
    // Should be less than current performance (investment was made before current state)
    const minPerformance = -50;
    const maxPerformance = Math.max(
      minPerformance + 1,
      asset.currentPerformance - 5
    );
    const assetPerformanceAtInvestment = faker.number.float({
      min: minPerformance,
      max: maxPerformance,
      fractionDigits: 2,
    });

    investments.push({
      userId,
      assetId,
      investedAmount,
      investmentDate,
      assetPerformanceAtInvestment,
    });
  }

  await Investment.insertMany(investments);
  console.log(`✓ Created ${investments.length} investments`);
};

const seed = async (): Promise<void> => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Connect to database
    await connectDB();
    console.log("✓ Connected to database\n");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Asset.deleteMany({});
    await AssetPerformanceHistory.deleteMany({});
    await Investment.deleteMany({});
    console.log("✓ Cleared existing data\n");

    // Create seed data
    console.log("Creating seed data...");
    const userIds = await createUsers();
    const assetIds = await createAssets();
    await createPerformanceHistory(assetIds);
    await createInvestments(userIds, assetIds);

    // Print summary
    console.log("\n✅ Seeding completed successfully!\n");
    console.log("Summary:");
    console.log(`- Users created: ${NUM_USERS}`);
    console.log(`- Assets created: ${NUM_ASSETS}`);
    console.log(
      `- Performance history entries: ~${
        NUM_ASSETS * (NUM_PERFORMANCE_UPDATES_PER_ASSET + 2)
      }`
    );
    console.log(`- Investments created: ${NUM_INVESTMENTS}`);
    console.log("\nDefault admin credentials:");
    console.log(`Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`\nOther users password: ${USERS_PASSWORD}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seed();
