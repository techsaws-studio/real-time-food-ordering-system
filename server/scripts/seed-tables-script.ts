import "dotenv/config";
import mongoose from "mongoose";

import { tableRepository } from "../repositories/table-repository.js";

import { GenerateQRCodeDataURL } from "../utils/qr-code-generator.js";
import { GenerateReadableTableId } from "../utils/table-id-generator.js";

const TABLES_DATA = [
  {
    tableNumber: 1,
    capacity: 2,
    location: "Window Side - Left",
  },
  {
    tableNumber: 2,
    capacity: 4,
    location: "Window Side - Right",
  },
  {
    tableNumber: 3,
    capacity: 4,
    location: "Center Area",
  },
  {
    tableNumber: 4,
    capacity: 6,
    location: "Near Bar",
  },
  {
    tableNumber: 5,
    capacity: 4,
    location: "Corner - Quiet",
  },
  {
    tableNumber: 6,
    capacity: 2,
    location: "Near Entrance",
  },
  {
    tableNumber: 7,
    capacity: 8,
    location: "Private Room",
  },
  {
    tableNumber: 8,
    capacity: 4,
    location: "Outdoor Terrace",
  },
];

const SeedTablesScript = async (): Promise<void> => {
  try {
    console.log("🌱 Starting table seeding with QR codes...");

    await mongoose.connect(process.env.MONGOOSE_DATABASE_URL || "");
    console.log("✅ Connected to MongoDB");

    await tableRepository.deleteAll();
    console.log("🗑️  Cleared existing tables");

    const tablesWithQR = await Promise.all(
      TABLES_DATA.map(async (table) => {
        const tableId = GenerateReadableTableId(table.tableNumber);

        const qrCodeDataURL = await GenerateQRCodeDataURL({
          tableId,
          tableNumber: table.tableNumber,
        });

        return {
          tableId,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          location: table.location,
          qrCodeUrl: qrCodeDataURL,
        };
      })
    );

    const createdTables = await tableRepository.createMany(tablesWithQR);
    console.log(
      `✅ Successfully seeded ${createdTables.length} tables with QR codes`
    );

    createdTables.forEach((table) => {
      const qrLength = table.qrCodeUrl?.length || 0;
      console.log(
        `📌 ${table.tableId} - Table #${table.tableNumber} (Capacity: ${table.capacity}) [QR: ${qrLength} bytes]`
      );
    });

    await mongoose.disconnect();

    console.log("✅ Disconnected from MongoDB");
    console.log("🎉 Table seeding completed!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding tables:", (error as Error).message);
    process.exit(1);
  }
};

SeedTablesScript();
