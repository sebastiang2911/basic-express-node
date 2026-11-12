import { HydratedDocument, Schema, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: string;
  state: boolean;
  google: boolean;
}

export type UserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "The name is required"],
  },
  email: {
    type: String,
    required: [true, "The email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "The password is required"],
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    required: false,
    enum: ["ADMIN_ROLE", "USER_ROLE"],
    default: "USER_ROLE",
  },
  state: {
    type: Boolean,
    default: true,
  },
  google: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.toJSON = function () {
  const { __v, password, _id, ...userWithoutPassword } = this.toObject();
  userWithoutPassword.uid = _id;
  return userWithoutPassword;
};

export default model("User", UserSchema);
