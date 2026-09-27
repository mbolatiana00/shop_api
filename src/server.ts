import app from "./app/app";
import { createServer } from "http";
import { initSocket } from "./socket/socket";


const PORT = Number(process.env.PORT ?? 3001);
const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});