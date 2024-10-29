import User from '../models/Example.schema.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createError } from '../middleware/errorTypes.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
    if(!users) {
      throw createError(404, "No users");
    }
  res.json({ success: true, data: users });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw createError(404, "User not found");
  }
  res.json({ success: true, data: user });
});
