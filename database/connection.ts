import sql, { TinyInt } from 'mssql';
import config from '../config/config';

export async function getcon(){

    const pool = await sql.connect({

        user: config.dbuser,
        password: config.dbpw,
        server: config.dbserver,
        database: config.dbdatabase,
        options: { 

            encrypt: true,
            trustServerCertificate: true,
            cryptoCredentialsDetails: {

                minVersion: 'TLSv1'

            }

        }
        
    });
    return pool;

};

async function getUsuario(p: sql.ConnectionPool , nickname: string){
    const usuario = await p.request()
    .input('nick', nickname)
    .query(String(config.q2));
    return usuario
}

async function getRoom(p: sql.ConnectionPool , codigo: number){
    const room = await p.request()
    .input('codigo', codigo)
    .query(String(config.q4));
    return room
}

async function getCant(p: sql.ConnectionPool ,idroom: number ){
    const result = await p.request()
    .input('estado', sql.TinyInt, 1)
    .input('idroom', sql.Int, idroom)
    .query(String(config.q2_1))
    return result
}

async function getPlayer(p: sql.ConnectionPool ,iduser: number, idroom: number ){
    const player = await p.request()
    .input('iduser', sql.Int, iduser)
    .input('idroom', sql.Int, idroom)
    .query(String(config.q5))
    return player
}

export async function jugadorCon(p: sql.ConnectionPool , nickname: string, codigo: number){
    const usuario = await getUsuario(p,nickname)
    const room = await getRoom(p,codigo)
    const player = await p.request()
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .query(String(config.q2_2))
    if (player.recordset.length == 0) {
        await p.request()
        .input('estado', sql.TinyInt, 0)
        .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
        .input('idroom', sql.Int, room.recordset[0].id_room)
        .query(String(config.q1))
    }
    const result = await getCant(p, room.recordset[0].id_room)
    return result
}

export async function jugadorDescon(p: sql.ConnectionPool , nickname: string, codigo: number){
    const usuario = await getUsuario(p,nickname)
    const room = await getRoom(p,codigo)
    await p.request()
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .query(String(config.q1_1));
    const result = await getCant(p, room.recordset[0].id_room)
    return result
}

export async function getScore(p: sql.ConnectionPool, nickname: string, codigo: number, puntos: number) {
    const usuario = await getUsuario(p,nickname)
    const room = await getRoom(p,codigo)
    const player = await getPlayer(p,Number(usuario.recordset[0].id_usuario),Number(room.recordset[0].id_room))
    let r = puntos + Number(player.recordset[0].score)
    if(r <= 0) r = 0
    await p.request()
    .input('puntos', sql.Int, r)
    .input('estado', sql.TinyInt, 1)
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .query(String(config.q6))
    const result = await getCant(p, room.recordset[0].id_room)
    return result
}

export async function estadoReset(p: sql.ConnectionPool, nickname: string, codigo: number) {
    const usuario = await getUsuario(p,nickname)
    const room = await getRoom(p,codigo)
    await p.request()
    .input('estado', sql.TinyInt, 0)
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .query(String(config.q7))
    const result = await getCant(p, room.recordset[0].id_room)
    return result
}
export async function scoreTotal(p: sql.ConnectionPool, nickname: string, codigo: number) {
    const usuario = await getUsuario(p,nickname)
    const room = await getRoom(p,codigo)
    const player = await getPlayer(p,Number(usuario.recordset[0].id_usuario),Number(room.recordset[0].id_room))
    let puntos = Number(usuario.recordset[0].scoretotal) + Number(player.recordset[0].score)
    if(puntos <= 0) puntos = 0
    await p.request()
    .input('puntos', sql.Int, puntos)
    .input('user', sql.VarChar, nickname)
    .query(String(config.q8))
}