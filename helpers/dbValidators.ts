import { Category, Product, Role, User } from "@models";

export const isValidRole = async (role = "") => {
  const existRole = await Role.findOne({ role });
  if (!existRole) {
    throw new Error(`${role} is not registered in DB`);
  }
};

export const isEmailExist = async (email = "") => {
  const existEmail = await User.findOne({ email });
  if (existEmail) {
    throw new Error(`${email} already exist`);
  }
};

export const isExistUserById = async (id = "") => {
  const existUser = await User.findById(id);
  if (!existUser) {
    throw new Error(`${id} not exist`);
  }
};

export const existCategoryById = async (id = "") => {
  const product = await Category.findById(id);

  if (!product) {
    throw new Error(`Product with ID ${id} does not exist`);
  }
};

export const existProductById = async (id = "") => {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error(`Product with ID ${id} does not exist`);
  }
};

export const collectionAllowed = (
  collection = "",
  collections: string[] = [],
) => {
  if (!collections.includes(collection)) {
    throw new Error(
      `Collection "${collection}" is not allowed. Allowed collections: ${collections.join(", ")}`,
    );
  }
  return true;
};
