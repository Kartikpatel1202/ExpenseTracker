import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error(
        "Error: ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must all be set in .env"
      );
      process.exit(1);
    }

    await connectDB();

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`Admin already exists with email: ${ADMIN_EMAIL}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "Admin",
    });

    console.log(`Admin user created successfully with email: ${ADMIN_EMAIL}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();