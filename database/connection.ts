import { Sequelize } from "sequelize";

const requiredEnv = (...names: string[]): string => {
  for (const name of names) {
    const value = process.env[name];

    if (value) return value;
  }

  throw new Error(`${names.join(" or ")} is not defined`);
};

const db = new Sequelize(
  process.env.MYSQL_DATABASE ?? "node_mysql",
  requiredEnv("MYSQL_USER", "USER_DB"),
  requiredEnv("MYSQL_PASSWORD", "PASSWORD_DB"),
  {
    host: process.env.MYSQL_HOST ?? "localhost",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    dialect: "mysql",
    logging: false,
  },
);

export const mysqlConnection = async (): Promise<void> => {
  await db.authenticate();
  console.log("MySQL Online".rainbow);
};

export default db;
