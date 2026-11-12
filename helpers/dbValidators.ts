import { Role, User } from "@models";

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
