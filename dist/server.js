"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app/app"));
const http_1 = require("http");
const socket_1 = require("./socket/socket");
const PORT = Number(process.env.PORT ?? 3000);
const server = (0, http_1.createServer)(app_1.default);
(0, socket_1.initSocket)(server);
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
