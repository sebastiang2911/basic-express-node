import { RequestHandler } from "express";
import bcryptjs from "bcryptjs";
import User from "../models/user.ts";

export const getUsers: RequestHandler = async (req, res) => {
  const { limit = 5, from = 0 } = req.query;

  const [total, users] = await Promise.all([
    User.countDocuments({ state: true }),
    User.find({ state: true }).skip(Number(from)).limit(Number(limit)),
  ]);

  res.json({ message: "GET API - Controller", total, users });
};

export const postUser: RequestHandler = async (req, res) => {
  const { name, email, password, rol } = req.body;

  const user = new User({ name, email, password, rol });

  // encrypt password
  const salt = bcryptjs.genSaltSync();
  user.password = bcryptjs.hashSync(password, salt);

  await user.save();

  res.json({
    message: "POST API - Controller",
    user,
  });
};

export const putUser: RequestHandler = async (req, res) => {
  const { id } = req.params; // /api/users?id=10
  const { password, google, email, ...rest } = req.body;
  //Validar in DB
  if (password) {
    const salt = bcryptjs.genSaltSync();
    rest.password = bcryptjs.hashSync(password, salt);
  }

  const user = await User.findByIdAndUpdate(id, rest);

  res.json({
    message: "PUT API - Controller",
    user,
  });
};

export const patchUsers: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { _id, password, google, email, ...changes } = req.body;

  if (password) {
    const salt = bcryptjs.genSaltSync();
    changes.password = bcryptjs.hashSync(password, salt);
  }

  const user = await User.findByIdAndUpdate(id, changes, {
    new: true,
    runValidators: true,
  });

  res.json({
    message: "PATCH API - Controller",
    user,
  });
};

export const deleteUsers: RequestHandler = async (req, res) => {
  const { id } = req.params;

  // If you need delete from DB, should by apply this
  // await User.findByIdAndDelete({ _id: id });

  const user = await User.findByIdAndUpdate(id, { state: false });

  res.json({
    message: "DELETE API - Controller",
    id,
  });
};
