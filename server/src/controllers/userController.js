import mongoose from "mongoose";
import User from "../models/User.js";

const ALLOWED_ROLES = ["User", "Admin","Viewer"];

// Create User
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
        data: null,
      });
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be User, Admin or Viewer",
        data: null,
      });
    }

    // Email must be unique because it will be used for login later
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        data: null,
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const { password: createdPassword, ...safeUser } = user.toObject();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: safeUser,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors,
      });
    }

    // Duplicate key error raised by the unique email index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        data: null,
      });
    }

    return next(error);
  }
};

// Get All Users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (error) {
    return next(error);
  }
};

// Get User By ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
        data: null,
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return next(error);
  }
};

// Update User
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
        data: null,
      });
    }

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const { name, email, password, role } = req.body;

    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be User, Admin or Viewer",
        data: null,
      });
    }

    // Only update the fields that were actually supplied
    const updatedData = {};

    if (name !== undefined) updatedData.name = name;
    if (email !== undefined) updatedData.email = email;
    if (password !== undefined) updatedData.password = password;
    if (role !== undefined) updatedData.role = role;

    if (updatedData.email) {
      const emailOwner = await User.findOne({
        email: updatedData.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (emailOwner) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
          data: null,
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        data: null,
      });
    }

    return next(error);
  }
};

// Delete User
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
        data: null,
      });
    }

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });

  } catch (error) {
    return next(error);
  }
};
