import { prisma } from "../../prisma/prismaClient";
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { deleted: false },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name } = req.body;

  const updatedUser = await prisma.user.update({
    where: {
      id: parseInt(id),
    },
    data: {
      email,
      name,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedUser = await prisma.user.update({
    where: {
      id: parseInt(id),
    },
    data: {
      deleted: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedUser, "User deleted successfully"));
});

const addUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User added successfully"));
});

export { getAllUsers, addUser, updateUser, deleteUser };
