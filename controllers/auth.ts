import { RequestHandler } from "express";
import bcryptjs from "bcryptjs";
import { createJWT } from "@helpers";
import { User } from "@models";

export const postUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check is the user exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: `The email or password not exist`,
      });
    }

    // 2. Check is the user is enable
    if (!user.state) {
      return res.status(400).json({
        message: `This user is disabled at the moment, contact the ADMIN`,
      });
    }

    // 3. Check is the password is the same
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        message: `The password is incorrect`,
      });
    }

    //4. Generate JWT
    const token = await createJWT(user.id);

    res.json({
      message: "POST API - Controller",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
