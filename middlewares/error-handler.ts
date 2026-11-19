import type { ErrorRequestHandler } from "express";

interface DatabaseError extends Error {
  code?: string;
}

export const errorHandler: ErrorRequestHandler = (error: DatabaseError, _req, res, _next) => {
  if (error.code === "ER_DUP_ENTRY" || error.name === "SequelizeUniqueConstraintError") {
    res.status(409).json({ message: "Email already exists" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};
