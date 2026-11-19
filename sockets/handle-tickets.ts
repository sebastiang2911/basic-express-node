import type { Server, Socket } from "socket.io";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

interface Ticket {
  number: number;
  desk: number | null;
}

export class HandleTickets {
  private readonly io: Server;
  private readonly dataPath: string;
  private last: number;
  private pending: Ticket[];
  private lastFour: Ticket[];

  constructor(io: Server) {
    this.io = io;
    this.dataPath = path.resolve("database/tickets.json");
    this.last = 0;
    this.pending = [];
    this.lastFour = [];
    this.load();
  }

  get toJSON() {
    return {
      last: this.last,
      pending: this.pending.length,
      lastFour: this.lastFour,
    };
  }

  connect(socket: Socket) {
    socket.emit("tickets:state", this.toJSON);

    socket.on("ticket:create", (callback?: (ticket: Ticket) => void) => {
      const ticket = this.createTicket();
      callback?.(ticket);
      this.emitState();
    });

    socket.on(
      "ticket:attend",
      (desk: unknown, callback?: (ticket: Ticket | null) => void) => {
        const ticket = this.attendTicket(Number(desk));
        callback?.(ticket);
        this.emitState();
      },
    );
  }

  private createTicket(): Ticket {
    this.last += 1;
    const ticket = { number: this.last, desk: null };
    this.pending.push(ticket);
    this.save();
    return ticket;
  }

  private attendTicket(desk: number): Ticket | null {
    if (!Number.isInteger(desk) || desk < 1 || !this.pending.length) return null;

    const ticket = this.pending.shift()!;
    ticket.desk = desk;
    this.lastFour.unshift(ticket);
    this.lastFour = this.lastFour.slice(0, 4);
    this.save();
    return ticket;
  }

  private load() {
    try {
      const data = JSON.parse(readFileSync(this.dataPath, "utf8"));
      this.last = Number.isInteger(data.last) ? data.last : 0;
      this.pending = Array.isArray(data.pending) ? data.pending : [];
      this.lastFour = Array.isArray(data.lastFour) ? data.lastFour : [];
    } catch {
      this.save();
    }
  }

  private save() {
    writeFileSync(
      this.dataPath,
      JSON.stringify(
        {
          last: this.last,
          pending: this.pending,
          lastFour: this.lastFour,
        },
        null,
        2,
      ),
    );
  }

  private emitState() {
    this.io.emit("tickets:state", this.toJSON);
  }
}
