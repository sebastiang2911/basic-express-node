import "colors";
import express, { Application } from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "node:path";
import { createServer, type Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { dbConnection, mysqlConnection } from "@database";
import { MySqlUser } from "@models";
import {
  auth,
  categories,
  products,
  users,
  find,
  upload,
  mysqlUsers,
} from "@routes";
import { HandleTickets } from "../sockets/handle-tickets.ts";
import { HandleAuthSockets } from "../sockets/handle-auth.ts";
import { errorHandler } from "@middlewares";

export default class Server {
  private readonly app: Application;
  private readonly port: string;
  private readonly server: HttpServer;
  private readonly io: SocketServer;
  private readonly paths = {
    auth: "/api/auth",
    users: "/api/users",
    categories: "/api/categories",
    products: "/api/products",
    find: "/api/find",
    upload: "/api/upload",
    mysqlUsers: "/api/mysql/users",
  };
  constructor() {
    this.app = express();
    this.port = process.env.PORT ?? "8080";
    this.server = createServer(this.app);
    this.io = new SocketServer(this.server, {
      cors: {
        origin: "*",
      },
    });

    //Middlewares
    this.middlewares();
    //Routes
    this.routes();
    //Sockets
    this.sockets();
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
    await Promise.all([dbConnection(), mysqlConnection()]);
    await MySqlUser.sync();
  }

  routes() {
    this.app.use(this.paths.auth, auth);
    this.app.use(this.paths.users, users);
    this.app.use(this.paths.categories, categories);
    this.app.use(this.paths.products, products);
    this.app.use(this.paths.find, find);
    this.app.use(this.paths.upload, upload);
    this.app.use(this.paths.mysqlUsers, mysqlUsers);

    // Register last so it only catches unknown routes.
    this.app.use((_req, res) => {
      res.status(404).sendFile(path.resolve("public/404.html"));
    });

    this.app.use(errorHandler);
  }

  sockets() {
    const handleTickets = new HandleTickets(this.io);
    new HandleAuthSockets(this.io.of("/auth"));

    this.io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      handleTickets.connect(socket);

      socket.on("mensaje-cliente", (payload, _callback) => {
        console.log("Message received:", payload);
        // callback({ ok: true, message: "Message received by the server" });
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`.red);
      });
    });
  }

  async listen(): Promise<void> {
    await this.connectDB();

    this.server.listen(this.port, () => {
      console.log(`Port listening in ${this.port}`.america);
    });
  }
}
