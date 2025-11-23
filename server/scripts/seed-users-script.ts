import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { UserRoleEnum } from "../enums/models-enums.js";

import User from "../models/user-model.js";

const MONGODB_URI = process.env.MONGOOSE_DATABASE_URL || "";

const seedUsers = [
  {
    userId: crypto.randomUUID(),
    email: "admin@rtfos.com",
    password: "Admin@123456",
    name: "System Administrator",
    role: UserRoleEnum.ADMIN,
    isActive: true,
  },
  {
    userId: crypto.randomUUID(),
    email: "kitchen@rtfos.com",
    password: "Kitchen@123456",
    name: "Kitchen Manager",
    role: UserRoleEnum.KITCHEN,
    isActive: true,
  },
  {
    userId: crypto.randomUUID(),
    email: "receptionist@rtfos.com",
    password: "Reception@123456",
    name: "Front Desk Receptionist",
    role: UserRoleEnum.RECEPTIONIST,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting user seeding process...\n");

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const existingUsers = await User.find({
      email: { $in: seedUsers.map((u) => u.email) },
    });

    if (existingUsers.length > 0) {
      console.log("⚠️ Users already exist in database:");
      existingUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      console.log(
        "\n❓ Do you want to delete existing users and reseed? (Ctrl+C to cancel)"
      );
      console.log("Continuing in 5 seconds...\n");

      await new Promise((resolve) => setTimeout(resolve, 5000));

      await User.deleteMany({
        email: { $in: seedUsers.map((u) => u.email) },
      });
      console.log("🗑️ Deleted existing users\n");
    }

    console.log("🔐 Hashing passwords...");
    const usersToCreate = await Promise.all(
      seedUsers.map(async (userData) => {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return {
          ...userData,
          password: hashedPassword,
        };
      })
    );
    console.log("✅ Passwords hashed\n");

    console.log("📝 Creating users...");
    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    console.log("📊 Summary:");
    console.log(`✅ Total users created: ${createdUsers.length}`);
    console.log(
      `Admin users: ${
        createdUsers.filter((u) => u.role === UserRoleEnum.ADMIN).length
      }`
    );
    console.log(
      `Kitchen users: ${
        createdUsers.filter((u) => u.role === UserRoleEnum.KITCHEN).length
      }`
    );
    console.log(
      `Receptionist users: ${
        createdUsers.filter((u) => u.role === UserRoleEnum.RECEPTIONIST).length
      }\n`
    );
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seedDatabase();
