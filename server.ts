import {WebSocketServer} from "ws"
import sql from 'mssql';

import config from './config/config'
import { getcon, jugadorCon, getDatosJugador } from './database/connection';

const p = process.env.PORT || 3000
const wss = new WebSocketServer({port: Number(p)})
wss.on("connection", (socket) => {

    socket.on("message", (data) => {

        const packet = JSON.parse(String(data));
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
                    pool.close()
                })
                .catch(err => {
                    console.error(err)
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                });
            break;
            
            case "mantenerCon":
                getcon()
                .then(pool => {
                    getDatosJugador(pool,String(packet.user),Number(packet.codigo))
                    .then(e => {
                        let cant = e.recordset.length
                        socket.send(JSON.stringify({
                            type: 'mantenerCon',
                            msg: 'conectado',
                            cantJugadores: cant
                        }));
                    })
                    pool.close()
                })
                .catch(err => {
                    console.error(err)
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                })
            break;
            case"puntos":
                console.log(packet.user+' ha obtenido '+packet.puntos);
            break
        }
    })
})