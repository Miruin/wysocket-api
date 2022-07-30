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

export async function jugadorCon(p: sql.ConnectionPool , nickname: string, codigo: number){
    const usuario = await p.request()
    .input('nick', nickname)
    .query(String(config.q2));
    const room = await p.request()
    .input('codigo', codigo)
    .query(String(config.q4));
    const result = await p.request()
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .input('estado', sql.TinyInt, 1)
    .query(String(config.q1))
    return result
}

export async function getDatosJugador(p: sql.ConnectionPool , nickname: string, codigo: number){
    const usuario = await p.request()
    .input('nick', nickname)
    .query(String(config.q2));
    const room = await p.request()
    .input('codigo', codigo)
    .query(String(config.q4));
    const result = await p.request()
    .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
    .input('idroom', sql.Int, room.recordset[0].id_room)
    .input('estado', sql.TinyInt, 1)
    .query(String(config.q1))
    return result
}
