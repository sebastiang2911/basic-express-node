import { RequestHandler } from "express";

export const isAdminRole: RequestHandler = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    res.status(500).json({
      message: "You should be an active user",
    });
    return;
  }

  const { role, name } = user;

  if (role !== "ADMIN_ROLE") {
    res.status(401).json({
      message: `${name} is not admin to delete this user`,
    });
    return;
  }

  next();
};

export const haveRole = (...allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "User authentication is required",
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        message: `${user.name} does not have a permitted role`,
      });
      return;
    }

    next();
  };
};
