import { prisma } from "../../prisma/prismaClient";
import asyncHandler from "../utils/asyncHandler";

const getAllTodos = async (req, res, next) => {
  const { user } = req.body;
};
