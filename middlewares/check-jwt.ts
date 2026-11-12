import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "@models";

const secret = process.env.SECRETORPRIVATEKEY;

if (!secret) {
  throw new Error("SECRETORPRIVATEKEY is not defined");
}

export const checkJWT: RequestHandler = async (req, res, next) => {
  const authorization = req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "A valid token is required",
    });
    return;
  }

  const token = authorization.slice(7);

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || typeof decoded.uid !== "string") {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    // Read the user according UID
    const user = await User.findById(decoded.uid);

    // Check is valid user or the state is disabled
    if (!user || !user.state) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Token invalid",
    });
  }
};
