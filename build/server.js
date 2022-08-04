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
                            const datos = [];
                            for (const key in e.recordset) {
                                const dato = {
                                    nick: e.recordset[key].nick_usuario,
                                    estado: e.recordset[key].estado_jugador,
                                    score: e.recordset[key].score
                                };
                                datos.push(dato);
                            }
                            wss.clients.forEach(client => {
                                if (client.readyState === ws_1.default.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'cantidad conectados',
                                        codigo: packet.codigo,
                                        cantJugadores: cant,
                                        infoJugadores: datos
                                    }));
                                }
                            });
                        }
                        else {
                            console.log(u);
                            socket.send(JSON.stringify({
                                type: 'conectado',
                                msg: 'sigues conectado'
                            }));
                        }
                    })
                        .catch(err2 => {
                        console.error(err2);
                        socket.send(JSON.stringify({
                            type: 'error',
                            msg: 'error al mover datos en la DB'
                        }));
                    });
                })
                    .catch(err1 => {
                    console.error(err1);
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                });
                break;
            case "comenzar juego":
                (0, connection_1.getcon)().then(p => {
                    (0, connection_1.estadoReset)(p, u, Number(c)).then(e => {
                        const cant = e.recordset.length;
                        const datos = [];
                        for (const key in e.recordset) {
                            const dato = {
                                nick: e.recordset[key].nick_usuario,
                                estado: e.recordset[key].estado_jugador,
                                score: e.recordset[key].score
                            };
                            datos.push(dato);
                        }
                        wss.clients.forEach(client => {
                            if (client.readyState === ws_1.default.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'cantidad conectados',
                                    codigo: c,
                                    cantJugadores: cant,
                                    infoJugadores: datos
                                }));
                            }
                        });
                    }).catch(err2 => {
                        console.error(err2 + ' error al cambiar estado del jugador');
                        socket.send(JSON.stringify({
                            type: 'error',
                            msg: 'error al obtener pool'
                        }));
                    });
                }).catch(err1 => {
                    console.error(err1 + ' error al cambiar estado del jugador');
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                });
                break;
            case "terminar ronda":
                (0, connection_1.getcon)().then(p => {
                    let puntos = Number(packet.puntos);
                    (0, connection_1.getScore)(p, u, Number(c), puntos).then(e => {
                        const cant = e.recordset.length;
                        const datos = [];
                        for (const key in e.recordset) {
                            const dato = {
                                nick: e.recordset[key].nick_usuario,
                                estado: e.recordset[key].estado_jugador,
                                score: e.recordset[key].score
                            };
                            datos.push(dato);
                        }
                        wss.clients.forEach(client => {
                            if (client.readyState === ws_1.default.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'cantidad conectados',
                                    codigo: c,
                                    cantJugadores: cant,
                                    infoJugadores: datos
                                }));
                            }
                        });
                    }).catch(err2 => {
                        console.error(err2);
                        socket.send(JSON.stringify({
                            type: 'error',
                            msg: 'error cambiar estado del jugador y/o al actualizar score'
                        }));
                    });
                }).catch(err1 => {
                    console.error(err1);
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                });
                break;
            case "terminar juego":
                break;
        }
    });
    socket.on('close', () => {
        console.log(u + ' usuario desconectado');
        (0, connection_1.getcon)().then(p => {
            (0, connection_1.jugadorDescon)(p, u, Number(c)).then(e => {
                const cant = e.recordset.length;
                const datos = [];
                for (const key in e.recordset) {
                    const dato = {
                        nick: e.recordset[key].nick_usuario,
                        estado: e.recordset[key].estado_jugador,
                        score: e.recordset[key].score
                    };
                    datos.push(dato);
                }
                wss.clients.forEach(client => {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify({
                            type: 'cantidad conectados',
                            codigo: c,
                            cantJugadores: cant,
                            infoJugadores: datos
                        }));
                    }
                });
            }).catch(err2 => {
                console.error(err2);
                socket.send(JSON.stringify({
                    type: 'error',
                    msg: 'error al desconectar'
                }));
            });
        }).catch(err1 => {
            console.error(err1);
            socket.send(JSON.stringify({
                type: 'error',
                msg: 'error al obtener pool'
            }));
        });
    });
});
