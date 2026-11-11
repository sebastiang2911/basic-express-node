import { RequestHandler } from "express";

export const getUsers: RequestHandler = (req, res) => {
  res.json("GET API - Controller");
};

export const postUsers: RequestHandler = (req, res) => {
  const { name, age } = req.body;
  res.json({
    message: "POST API - Controller",
    user: { name, age },
  });
};

export const putUsers: RequestHandler = (req, res) => {
  const idFromParams = req.params.id; // /api/users/10
  const idFromQuery = req.query.id; // /api/users?id=10
  const { page = 10, limit = 20 } = req.query;

  const id = idFromParams ?? idFromQuery;

  res.json({
    message: "POST API - Controller",
    id,
    page,
    limit,
  });
};

export const patchUsers: RequestHandler = (req, res) => {
  res.json("PATCH API - Controller");
};

export const deleteUsers: RequestHandler = (req, res) => {
  res.json("DELETE API - Controller");
};
