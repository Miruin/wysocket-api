
import WebSocket, {WebSocketServer} from "ws"

const p = process.env.PORT || 3000
const wss = new WebSocketServer({port: Number(p)})
wss.on("connection", (socket) => {
    socket.on("message", (data) => {
        const packet = JSON.parse(String(data));
        switch (packet.type) { 
            case "conectado":
                socket.send(JSON.stringify({
                    type: 'conectado',
                    msg: 'te has conectando'
                }));
            break;
            case"puntos":
                console.log(packet.user+' ha obtenido '+packet.puntos);
            break
        }
    })
})