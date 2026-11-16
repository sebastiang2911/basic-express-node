import { RequestHandler } from "express";
import bcryptjs from "bcryptjs";
import { User } from "@models";
import { createJWT, googleVerify } from "@helpers";

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

export const googleSignIn: RequestHandler = async (req, res) => {
  const { id_token } = req.body;

  try {
    const response = await googleVerify(id_token);
    let user = await User.findOne({ email: response.email });

    if (!user) {
      const data = {
        name: response.name,
        email: response.email,
        password: ":P",
        img: response.picture,
        google: true,
      };
      user = new User(data);
      await user.save();
    }

    if (!user.state) {
      res.status(401).json({
        ok: false,
        message: "contact the ADMIN because this admin is blocked",
      });
    }

    const token = await createJWT(user.id);

    res.json({
      message: "Everything ok",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      ok: false,
      message: "Something was wrong, contact the ADMIN",
    });
  }
};
