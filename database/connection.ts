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

async function getCant(p: sql.ConnectionPool ,iduser: number, idroom: number ){
    const result = await p.request()
    .input('estado', sql.TinyInt, 1)
    .input('iduser', sql.Int, iduser)
    .input('idroom', sql.Int, idroom)
    .query(String(config.q2_1))
    return result
}

export async function jugadorCon(p: sql.ConnectionPool , nickname: string, codigo: number){
    const usuario = await getUsuario(p,nickname)
    const room = await getRoom(p,codigo)
    const player = await p.request()
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .query(String(config.q2_2))
    if (player.recordset.length != 0) {
        if(player.recordset[0].estado_jugador == 0) {
            await p.request()
            .input('estado', sql.TinyInt, 1)
            .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
            .input('idroom', sql.Int, room.recordset[0].id_room)
            .query(String(config.q1_1));
        }
    } else {
        await p.request()
        .input('estado', sql.TinyInt, 1)
        .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
        .input('idroom', sql.Int, room.recordset[0].id_room)
        .query(String(config.q1))
    }
    const result = await getCant(p, usuario.recordset[0].id_usuario, room.recordset[0].id_room)
    return result
}

export async function jugadorDescon(p: sql.ConnectionPool , nickname: string, codigo: number){
    const usuario = await getUsuario(p,nickname)
    const room = await getRoom(p,codigo)
    await p.request()
    .input('estado', sql.TinyInt, 0)
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .query(String(config.q1_1));
    const result = await getCant(p, usuario.recordset[0].id_usuario, room.recordset[0].id_room)
    return result
}