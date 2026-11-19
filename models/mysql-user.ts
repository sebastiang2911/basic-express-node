import { DataTypes, Model, type Optional } from "sequelize";
import db from "../database/connection.ts";

interface MySqlUserAttributes {
  id: string;
  name: string;
  email: string;
  state: boolean;
}

type MySqlUserCreationAttributes = Optional<
  MySqlUserAttributes,
  "id" | "state"
>;

export default class MySqlUser extends Model<
  MySqlUserAttributes,
  MySqlUserCreationAttributes
> {
  declare id: string;
  declare name: string;
  declare email: string;
  declare state: boolean;
}

MySqlUser.init(
  {
    id: {
      type: DataTypes.STRING(255),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    state: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    tableName: "users",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  },
);
