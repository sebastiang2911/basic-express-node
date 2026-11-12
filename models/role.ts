import { Schema, model } from "mongoose";

const RoleSchema = new Schema({
  role: {
    type: String,
    required: [true, "The role is mandatory"],
  },
});

export default model("Role", RoleSchema);
