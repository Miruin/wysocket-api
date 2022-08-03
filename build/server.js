"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importStar(require("ws"));
const connection_1 = require("./database/connection");
const p = process.env.PORT || 3000;
const wss = new ws_1.WebSocketServer({ port: Number(p) });
wss.on("connection", socket => {
    console.log('un usuario se a conectado');
    let u;
    let c;
    socket.on("message", (data) => {
        const packet = JSON.parse(String(data));
        console.log(packet);
        switch (packet.type) {
            case "conectado":
                (0, connection_1.getcon)()
                    .then(pool => {
                    (0, connection_1.jugadorCon)(pool, String(packet.user), Number(packet.codigo))
                        .then(e => {
                        let cant = e.recordset.length;
                        if (packet.estado == '0') {
                            u = String(packet.user);
                            c = String(packet.codigo);
                            wss.clients.forEach(client => {
                                if (client.readyState === ws_1.default.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'cantidad conectados',
                                        codigo: packet.codigo,
                                        cantJugadores: cant
                                    }));
                                }
                            });
                            console.log('ok');
                        }
                        else {
                            console.log(u);
                            socket.send(JSON.stringify({
                                type: 'conectado',
                                msg: 'sigues conectado'
                            }));
                        }
                    })
                        .catch(er => {
                        console.error(er);
                        socket.send(JSON.stringify({
                            type: 'error',
                            msg: 'error al mover datos en la DB'
                        }));
                    });
                })
                    .catch(err => {
                    console.error(err);
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                });
                break;
            case "puntos":
                console.log(packet.user + ' ha obtenido ' + packet.puntos + ', ' + u);
                break;
        }
    });
    socket.on('close', () => {
        console.log(u + ' usuario desconectado');
        (0, connection_1.getcon)().then(p => {
            (0, connection_1.jugadorDescon)(p, u, Number(c)).then(e => {
                const cant = e.recordset.length;
                wss.clients.forEach(client => {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify({
                            type: 'cantidad conectados',
                            codigo: c,
                            cantJugadores: cant
                        }));
                    }
                });
            });
        });
    });
});
