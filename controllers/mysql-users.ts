import type { RequestHandler } from "express";
import { MySqlUser } from "@models";

export const getMySqlUsers: RequestHandler = async (_req, res) => {
  const users = await MySqlUser.findAll({
    where: { state: true },
    order: [["name", "ASC"]],
  });

  res.json({ total: users.length, users });
};

export const getMySqlUserById: RequestHandler = async (req, res) => {
  const user = await MySqlUser.findOne({
    where: { id: String(req.params.id), state: true },
  });

  if (!user) {
    res.status(404).json({ message: "MySQL user not found" });
    return;
  }

  res.json({ user });
};

export const createMySqlUser: RequestHandler = async (req, res) => {
  const { name, email } = req.body as { name: string; email: string };
  const user = await MySqlUser.create({ name, email });

  res.status(201).json({ user });
};

export const updateMySqlUser: RequestHandler = async (req, res) => {
  const { name, email } = req.body as { name: string; email: string };
  const user = await MySqlUser.findOne({
    where: { id: String(req.params.id), state: true },
  });

  if (!user) {
    res.status(404).json({ message: "MySQL user not found" });
    return;
  }

  await user.update({ name, email });

  res.json({ user });
};

export const deleteMySqlUser: RequestHandler = async (req, res) => {
  const user = await MySqlUser.findOne({
    where: { id: String(req.params.id), state: true },
  });

  if (!user) {
    res.status(404).json({ message: "MySQL user not found" });
    return;
  }

  await user.update({ state: false });
  res.json({ user });
};
