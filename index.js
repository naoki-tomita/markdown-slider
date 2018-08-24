const { server: WSServer } = require("websocket");
const LocalWebServer = require("local-web-server");
const { watch } = require("fs");
const http = require("http");

const lws = new LocalWebServer();
lws.listen({ port: 8080 });

class Manager {
  constructor() {
    const server = http.createServer();
    server.listen(8081);
    this.ws = new WSServer({
      httpServer: server,
      autoAcceptConnections: true,
    });
    this.events();
  }

  events() {
    this.ws.on("connect", this.connect.bind(this));
  }

  connect(connection) {
    this.connection = connection;
    connection.on("message", this.message.bind(this));
    console.log("connected.");
  }

  message(msg) {
    if (msg.type === "utf8") {
      this.url = msg.utf8Data;
      this.watch();
    }
  }

  watch() {
    if (this.watcher) {
      this.watcher.close();
    }
    this.watcher = watch(`.${this.url}`);
    this.watcher.on("change", () => {
      this.connection.sendUTF("changed.");
    });
    console.log(`watching ${this.url}`);
  }
}
const man = new Manager();