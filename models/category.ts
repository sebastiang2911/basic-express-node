import { Schema, model } from "mongoose";

const CategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "The category is mandatory"],
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
});

CategorySchema.methods.toJSON = function () {
  const { __v, _id, ...category } = this.toObject();

  return {
    uid: _id,
    ...category,
  };
};

export default model("Category", CategorySchema);
