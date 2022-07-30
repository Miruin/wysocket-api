import {WebSocketServer} from "ws"
import sql from 'mssql';

import config from './config/config'
import { getcon, jugadorCon} from './database/connection';

const p = process.env.PORT || 3000
const wss = new WebSocketServer({port: Number(p)})
wss.on("connection", (socket) => {
    console.log('un usuario se a conectado')
    socket.on("message", (data) => {

        const packet = JSON.parse(String(data));
        console.log(packet);
        
        switch (packet.type) { 

            case "conectado":
                getcon()
                .then(pool => {
                    jugadorCon(pool, String(packet.user), Number(packet.codigo))
                    .then(e => {
                        let cant = e.recordset.length
                        socket.send(JSON.stringify({
                            type: 'conectado',
                            msg: 'te has conectado',
                            cantJugadores: cant
                        }));
                    })
                    .catch(er => {
                        console.error(er);
                        socket.send(JSON.stringify({
                            type: 'error',
                            msg: 'error al mover datos en la DB'
                        }));
                    })
                })
                .catch(err => {
                    console.error(err)
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                });
            break;

            case"puntos":
                console.log(packet.user+' ha obtenido '+packet.puntos);
            break
        }
    })
})