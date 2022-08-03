"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jugadorDescon = exports.jugadorCon = exports.getcon = void 0;
const mssql_1 = __importDefault(require("mssql"));
const config_1 = __importDefault(require("../config/config"));
function getcon() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield mssql_1.default.connect({
            user: config_1.default.dbuser,
            password: config_1.default.dbpw,
            server: config_1.default.dbserver,
            database: config_1.default.dbdatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true,
                cryptoCredentialsDetails: {
                    minVersion: 'TLSv1'
                }
            }
        });
        return pool;
    });
}
exports.getcon = getcon;
;
function getUsuario(p, nickname) {
    return __awaiter(this, void 0, void 0, function* () {
        const usuario = yield p.request()
            .input('nick', nickname)
            .query(String(config_1.default.q2));
        return usuario;
    });
}
function getRoom(p, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield p.request()
            .input('codigo', codigo)
            .query(String(config_1.default.q4));
        return room;
    });
}
function getCant(p, iduser, idroom) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield p.request()
            .input('estado', mssql_1.default.TinyInt, 1)
            .input('iduser', mssql_1.default.Int, iduser)
            .input('idroom', mssql_1.default.Int, idroom)
            .query(String(config_1.default.q2_1));
        return result;
    });
}
function jugadorCon(p, nickname, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        const usuario = yield getUsuario(p, nickname);
        const room = yield getRoom(p, codigo);
        const player = yield p.request()
            .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
            .input('idroom', mssql_1.default.Int, room.recordset[0].id_room)
            .query(String(config_1.default.q2_2));
        if (player.recordset.length != 0) {
            if (player.recordset[0].estado_jugador == 0) {
                yield p.request()
                    .input('estado', mssql_1.default.TinyInt, 1)
                    .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
                    .input('idroom', mssql_1.default.Int, room.recordset[0].id_room)
                    .query(String(config_1.default.q1_1));
            }
        }
        else {
            yield p.request()
                .input('estado', mssql_1.default.TinyInt, 1)
                .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
                .input('idroom', mssql_1.default.Int, room.recordset[0].id_room)
                .query(String(config_1.default.q1));
        }
        const result = yield getCant(p, usuario.recordset[0].id_usuario, room.recordset[0].id_room);
        return result;
    });
}
exports.jugadorCon = jugadorCon;
function jugadorDescon(p, nickname, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        const usuario = yield getUsuario(p, nickname);
        const room = yield getRoom(p, codigo);
        yield p.request()
            .input('estado', mssql_1.default.TinyInt, 0)
            .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
            .input('idroom', mssql_1.default.Int, room.recordset[0].id_room)
            .query(String(config_1.default.q1_1));
        const result = yield getCant(p, usuario.recordset[0].id_usuario, room.recordset[0].id_room);
        return result;
    });
}
exports.jugadorDescon = jugadorDescon;
