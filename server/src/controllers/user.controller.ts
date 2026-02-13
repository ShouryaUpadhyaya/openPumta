import { log } from "node:console";
import { prisma } from "../../prisma/prismaClient";
import { Request, Response } from "express";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { deleted: false },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        email: req.body.email,
        name: req.body.name,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Soft delete if the field exists, or hard delete.
    // Given 'deleted' field in schema, let's use soft delete.
    const deletedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        deleted: true,
      },
    });
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

const addUser = async (req: Request, res: Response) => {
  console.log(req.body, req.body.email, req.body.name);
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to add user",
        fullMessage: error,
      });
  }
};

export { getAllUsers, addUser, updateUser, deleteUser };
