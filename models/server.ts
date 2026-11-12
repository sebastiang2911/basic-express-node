import "colors";
import express, { Application } from "express";
import cors from "cors";
import path from "node:path";
import router from "../routes/users.ts";
import { dbConnection } from "../database/config.ts";

export default class Server {
  private readonly app: Application;
  private readonly port: string;
  private readonly usersPath = "/api/users";

  constructor() {
    this.app = express();
    this.port = process.env.PORT ?? "8080";

    // Connect DB
    this.connectDB();
    //Middlewares
    this.middlewares();
    //Routes
    this.routes();
  }

  middlewares() {
    //init DB

    //CORS
    this.app.use(cors());
    // READ and WRITE
    this.app.use(express.json());
    // Static Files
    this.app.use(express.static("public"));
  }

  async connectDB() {
    await dbConnection();
  }

  routes() {
    this.app.use(this.usersPath, router);

    // Register last so it only catches unknown routes.
    this.app.use((_req, res) => {
      res.status(404).sendFile(path.resolve("public/404.html"));
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Port listening in ${this.port}`.america);
    });
  }
}
