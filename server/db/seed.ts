import { faker } from "@faker-js/faker";
import argon2 from "argon2";
import mongoose from "mongoose";
import { AssetType, UserRole } from "../../shared/types";
import { connectDB } from "./connection";
import Investment from "./models/Investment";
import User from "./models/User";

const NUM_USERS = 30;
const NUM_INVESTMENTS = 500;
const ONE_YEAR = 365 * 24 * 60 * 60 * 1_000;

const DEFAULT_ADMIN_NAME = "Admin User";
const DEFAULT_ADMIN_EMAIL = "admin@altfolio.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123#";
const USERS_PASSWORD = "Password123#";

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

const createInvestments = async (
  userIds: mongoose.Types.ObjectId[]
): Promise<void> => {
  const investments = [];

  for (let i = 0; i < NUM_INVESTMENTS; i++) {
    const assetType = faker.helpers.arrayElement(assetTypes);
    const assetName = getRandomAssetName(assetType);

    // Generate investment date within the last 5 years
    const investmentDate = faker.date.between({
      from: new Date(Date.now() - 5 * ONE_YEAR),
      to: new Date(),
    });

    // Generate investment amount based on asset type
    let investedAmount: number;
    switch (assetType) {
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

    // Generate current value with some realistic variation (-50% to +200%)
    const growthFactor = faker.number.float({
      min: 0.5,
      max: 3,
      fractionDigits: 2,
    });
    const currentValue = Math.round(investedAmount * growthFactor);

    // Randomly assign 1-15 owners to each investment
    const numOwners = faker.number.int({ min: 1, max: 15 });
    const owners = faker.helpers.arrayElements(userIds, numOwners);

    investments.push({
      assetName,
      assetType,
      investedAmount,
      investmentDate,
      currentValue,
      owners,
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
    await Investment.deleteMany({});
    console.log("✓ Cleared existing data\n");

    // Create seed data
    console.log("Creating seed data...");
    const userIds = await createUsers();
    await createInvestments(userIds);

    // Print summary
    console.log("\n✅ Seeding completed successfully!\n");
    console.log("Summary:");
    console.log(`- Users created: ${NUM_USERS}`);
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
