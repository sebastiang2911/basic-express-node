import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, "The product name is mandatory"],
  },
  state: {
    type: Boolean,
    default: true,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  description: { type: String },
  enable: { type: Boolean, default: true },
});

ProductSchema.methods.toJSON = function () {
  const { __v, _id, ...product } = this.toObject();

  return {
    uid: _id,
    ...product,
  };
};

export default model("Product", ProductSchema);
