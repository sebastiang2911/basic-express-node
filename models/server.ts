import "colors";
import express, { Application } from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "node:path";
import { dbConnection } from "@database";
import { auth, categories, products, users, find, upload } from "@routes";

export default class Server {
  private readonly app: Application;
  private readonly port: string;
  private readonly paths = {
    auth: "/api/auth",
    users: "/api/users",
    categories: "/api/categories",
    products: "/api/products",
    find: "/api/find",
    upload: "/api/upload",
  };

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
    // Fileupload - load files
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      }),
    );
  }

  async connectDB() {
    await dbConnection();
  }

  routes() {
    this.app.use(this.paths.auth, auth);
    this.app.use(this.paths.users, users);
    this.app.use(this.paths.categories, categories);
    this.app.use(this.paths.products, products);
    this.app.use(this.paths.find, find);
    this.app.use(this.paths.upload, upload);

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
