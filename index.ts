import Server from "./models/server.ts";

const server = new Server();
server.listen().catch((error: unknown) => {
  console.error("Unable to start server:", error);
  process.exitCode = 1;
});
