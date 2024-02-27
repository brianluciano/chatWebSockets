import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleWare from 'webpack-dev-middleware'
import webpackConfig from '../webpack.config.js';
import logger from 'morgan';
import { createClient } from '@libsql/client';
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import 'dotenv/config';

const port = process.env.PORT ?? 3000;



const app = express(); //create http server
const server = createServer(app); //
const io = new Server(server, {
    connectionStateRecovery: {}
});

app.use(webpackDevMiddleWare(webpack(webpackConfig)))

const db= createClient({
    url: "libsql://chat-brianluciano.turso.io",
    authToken: process.env.DB_TOKEN
})


await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT 
    )
`)

io.on('connection', async (socket) => {
    //console.log('a user has connected!');
    socket.on('chat message', async (msg) => {
        let result
        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content) VALUES (:msg)',
                args: {msg}
            })
        } catch(e) {
            console.log(e)
            return 
        }

        io.emit('chat message', msg, result.lastInsertRowid.toString()) 
    })

    if (!socket.recovered) {
        try {
            const results   = await db.execute({
                sql :  'SELECT id, content FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })

            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString())
            })
        } catch(e) {
            console.log(e)
        }
    }
});


app.use(logger('dev'));

app.get('/', (req,res) => {
res.sendFile(process.cwd() + '/client/index.html');
//res.send('<h1> esto es algo </h1>')
});

server.listen(port, ()=> {
    console.log(`Server runint on port ${port}`)
})