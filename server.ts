import WebSocket, {WebSocketServer} from "ws"
import sql from 'mssql';

import config from './config/config'
import { estadoReset, getcon, getScore, jugadorCon, jugadorDescon, scoreTotal} from './database/connection';

const p = process.env.PORT || 3000
const wss = new WebSocketServer({port: Number(p)})
type players = {
    nick: string;
    estado: number;
    score: number;
}
wss.on("connection", socket => {
    console.log('un usuario se a conectado')
    let u: string
    let c: string
    socket.on("message", (data) => {

        const packet = JSON.parse(String(data));
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
                            const datos: players[]= []
                            for (const key in e.recordset) {
                                const dato: players = {
                                    nick: e.recordset[key].nick_usuario,
                                    estado: e.recordset[key].estado_jugador,
                                    score: e.recordset[key].score
                                }
                                datos.push(dato)
                            }
                            wss.clients.forEach(client =>{
                                if(client.readyState === WebSocket.OPEN){
                                    client.send(JSON.stringify({
                                        type: 'cantidad conectados',
                                        codigo: packet.codigo,
                                        cantJugadores: cant,
                                        infoJugadores: datos
                                    }))
                                }
                            })
                        }  else {
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
                    })
                })
                .catch(err1 => {
                    console.error(err1)
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                });
            break;

            case"comenzar juego":
                getcon().then(p =>{
                    estadoReset(p, u, Number(c)).then(e =>{
                        const cant = e.recordset.length
                        const datos: players[]= []
                        for (const key in e.recordset) {
                            const dato: players = {
                                nick: e.recordset[key].nick_usuario,
                                estado: e.recordset[key].estado_jugador,
                                score: e.recordset[key].score
                            }
                            datos.push(dato)
                        }
                        wss.clients.forEach(client =>{
                            if(client.readyState === WebSocket.OPEN){
                                client.send(JSON.stringify({
                                    type: 'cantidad conectados',
                                    codigo: c,
                                    cantJugadores: cant,
                                    infoJugadores: datos
                                }))
                            }
                        })
                    }).catch(err2 =>{
                        console.error(err2+' error al cambiar estado del jugador');
                        socket.send(JSON.stringify({
                            type: 'error',
                            msg: 'error al obtener pool'
                        }));
                    })
                }).catch(err1 =>{
                    console.error(err1+' error al cambiar estado del jugador');
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                    
                })
            break;

            case"terminar ronda":
                getcon().then(p =>{
                    let puntos = Number(packet.puntos)
                    getScore(p,u,Number(c),puntos).then(e =>{
                        const cant = e.recordset.length
                        const datos: players[]= []
                            for (const key in e.recordset) {
                                const dato: players = {
                                    nick: e.recordset[key].nick_usuario,
                                    estado: e.recordset[key].estado_jugador,
                                    score: e.recordset[key].score
                                }
                                datos.push(dato)
                            }
                            wss.clients.forEach(client =>{
                                if(client.readyState === WebSocket.OPEN){
                                    client.send(JSON.stringify({
                                        type: 'cantidad conectados',
                                        codigo: c,
                                        cantJugadores: cant,
                                        infoJugadores: datos
                                    }))
                                }
                            })
                    }).catch(err2 =>{
                        console.error(err2);
                        socket.send(JSON.stringify({
                            type: 'error',
                            msg: 'error cambiar estado del jugador y/o al actualizar score'
                        }));
                    })
                }).catch(err1 =>{
                    console.error(err1);
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool'
                    }));
                })
            break;

            case"terminar juego":
                getcon().then(p =>{
                    scoreTotal(p,u,Number(c))
                    jugadorDescon(p,u,Number(c))
                }).catch(err1 =>{
                    console.error(err1);
                    socket.send(JSON.stringify({
                        type: 'error',
                        msg: 'error al obtener pool' 
                    }));
                })
            break;
        }
    })

    socket.on('close',() => {
        console.log(u+' usuario desconectado');
        getcon().then(p =>{
            jugadorDescon(p,u,Number(c)).then(e =>{
                const cant = e.recordset.length
                const datos: players[]= []
                for (const key in e.recordset) {
                    const dato: players = {
                        nick: e.recordset[key].nick_usuario,
                        estado: e.recordset[key].estado_jugador,
                        score: e.recordset[key].score
                    }
                    datos.push(dato)
                }
                wss.clients.forEach(client =>{
                    if(client.readyState === WebSocket.OPEN){
                        client.send(JSON.stringify({
                            type: 'cantidad conectados',
                            codigo: c,
                            cantJugadores: cant,
                            infoJugadores: datos
                        }))
                    }
                })
            }).catch(err2 =>{
                console.error(err2);
                socket.send(JSON.stringify({
                    type: 'error',
                    msg: 'error al desconectar'
                }));
            })
        }).catch(err1 =>{
            console.error(err1);
            socket.send(JSON.stringify({
                type: 'error',
                msg: 'error al obtener pool'
            }));
        })
    })
})