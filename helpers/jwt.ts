import jwt from "jsonwebtoken";

const secret = process.env.SECRETORPRIVATEKEY;

if (!secret) {
  throw new Error("SECRETORPRIVATEKEY is not defined");
}

export const createJWT = (uid: string) => {
  return new Promise((resolve, reject) => {
    const payload = { uid };
    jwt.sign(payload, secret, { expiresIn: "4h" }, (error, token) => {
      if (error || !token) {
        reject(error ?? new Error("JWT could not be generated"));
        return;
      }

      resolve(token);
    });
  });
};
