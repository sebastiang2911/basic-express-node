import jwt from "jsonwebtoken";
import type { Namespace, Socket } from "socket.io";
import { User } from "@models";

interface TokenPayload {
  uid: string;
}

interface MessagePayload {
  text?: unknown;
  to?: unknown;
  room?: unknown;
}

interface AuthUser {
  uid: string;
  name: string;
}

export class HandleAuthSockets {
  private readonly namespace: Namespace;
  private readonly online = new Map<string, AuthUser>();

  constructor(namespace: Namespace) {
    this.namespace = namespace;
    this.namespace.use(this.authenticate.bind(this));
    this.namespace.on("connection", this.connect.bind(this));
  }

  private async authenticate(socket: Socket, next: (error?: Error) => void) {
    try {
      const token = String(
        socket.handshake.auth.token ?? socket.handshake.headers["x-token"] ?? "",
      );
      const secret = process.env.SECRETORPRIVATEKEY;
      if (!token || !secret) throw new Error("Missing authentication token");

      const { uid } = jwt.verify(token, secret) as TokenPayload;
      const user = await User.findById(uid);
      if (!user?.state) throw new Error("Invalid or disabled user");

      socket.data.user = { uid: user.id, name: user.name } satisfies AuthUser;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  }

  private connect(socket: Socket) {
    const user = socket.data.user as AuthUser;
    this.online.set(socket.id, user);
    socket.join(`user:${user.uid}`);
    this.emitUsers();

    socket.on("message:global", (payload: MessagePayload) => {
      const text = this.cleanText(payload?.text);
      if (!text) return;
      this.namespace.emit("message:new", this.message(user, text, "global"));
    });

    socket.on("message:private", (payload: MessagePayload) => {
      const text = this.cleanText(payload?.text);
      const to = String(payload?.to ?? "");
      if (!text || !to) return;

      const message = this.message(user, text, "private");
      this.namespace.to(`user:${to}`).emit("message:new", message);
      if (to !== user.uid) socket.emit("message:new", message);
    });

    socket.on("room:join", (roomValue: unknown) => {
      const room = this.cleanRoom(roomValue);
      if (!room) return;
      socket.join(`room:${room}`);
      socket.data.room = room;
      socket.emit("room:joined", room);
    });

    socket.on("message:room", (payload: MessagePayload) => {
      const text = this.cleanText(payload?.text);
      const room = this.cleanRoom(payload?.room);
      if (!text || !room || !socket.rooms.has(`room:${room}`)) return;
      this.namespace
        .to(`room:${room}`)
        .emit("message:new", this.message(user, text, "room", room));
    });

    socket.on("disconnect", () => {
      this.online.delete(socket.id);
      this.emitUsers();
    });
  }

  private emitUsers() {
    const uniqueUsers = [
      ...new Map([...this.online.values()].map((user) => [user.uid, user])).values(),
    ];
    this.namespace.emit("users:online", uniqueUsers);
  }

  private message(user: AuthUser, text: string, scope: string, room?: string) {
    return { from: user, text, scope, room, sentAt: new Date().toISOString() };
  }

  private cleanText(value: unknown) {
    return String(value ?? "").trim().slice(0, 500);
  }

  private cleanRoom(value: unknown) {
    const room = String(value ?? "").trim().slice(0, 30);
    return /^[a-zA-Z0-9_-]+$/.test(room) ? room : "";
  }
}
