import WebSocket, {WebSocketServer} from "ws"
import sql from 'mssql';

import config from './config/config'
import { getcon, jugadorCon, jugadorDescon} from './database/connection';

const p = process.env.PORT || 3000
const wss = new WebSocketServer({port: Number(p)})
wss.on("connection", socket => {
    console.log('un usuario se a conectado')
    let u: string
    let c: string
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
                        if (packet.estado == '0') {
                            u = String(packet.user)
                            c = String(packet.codigo)
                            wss.clients.forEach(client =>{
                                if(client.readyState === WebSocket.OPEN){
                                    client.send(JSON.stringify({
                                        type: 'cantidad conectados',
                                        codigo: packet.codigo,
                                        cantJugadores: cant
                                    }))
                                }
                            })
                            console.log('ok');
                        }  else {
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
                console.log(packet.user+' ha obtenido '+packet.puntos+', '+u);
            break;
        }
    })

    socket.on('close',() => {
        console.log(u+' usuario desconectado');
        getcon().then(p =>{
            jugadorDescon(p,u,Number(c)).then(e =>{
                const cant = e.recordset.length
                wss.clients.forEach(client =>{
                    if(client.readyState === WebSocket.OPEN){
                        client.send(JSON.stringify({
                            type: 'cantidad conectados',
                            codigo: c,
                            cantJugadores: cant
                        }))
                    }
                })
            })
        })
    })
})