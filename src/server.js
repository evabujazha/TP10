// Imports

import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import * as handlebars from 'express-handlebars'
import path from 'path';
import MongoProducts from './containers/MongoProducts.js'
import MongoMessages from './containers/MongoMessages.js'

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { isLoggedOut, isLoggedIn } from './scripts/aux_functions.js';

// Instances

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const hbs = handlebars.create({
    layoutsDir: path.join(__dirname, '../public/views/layouts'),
    extname : 'hbs'
})
const productos = new MongoProducts
const mensajes = new MongoMessages

// APP use and set
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store : MongoStore.create({
        mongoUrl : 'mongodb+srv://admin:D4Z3hFdGnvWTasOm@techwearclubar.xtw4azf.mongodb.net/sessions?retryWrites=true&w=majority',
        mongoOptions : {useNewUrlParser : true, useUnifiedTopology: true}
    }),
    secret : 'secret',
    resave : false, 
    saveUninitialized : false,
    cookie : {maxAge : 30000}
}))
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, '../public/views'))


// Get, Post and Socket 

app.get('/',isLoggedOut, (req, res) => {
    res.render('index')
})
app.post('/logout',isLoggedIn, (req, res)=> {
    let nombre = req.session.nombre
    req.session.destroy((error) => {
        if(error){res.json({status : 'Logout error', body : error})}
        else{res.render('logout', {nombre : nombre})}
    })
})
app.post("/home",isLoggedOut, (req, res) => {
    if (req.body.loginName) {
        req.session.nombre = req.body.loginName;
        res.redirect("/home");
      } else {
        res.redirect("/");
      }
    });
app.get('/home',isLoggedIn, (req, res) => {
    req.session.cookie.expires = new Date(Date.now() + 30000)
    res.render('home', {name : req.session.nombre})
})
app.get('/logout',isLoggedOut, (req, res) => {
    setTimeout(() => {
        res.redirect('/')
    }, 2000)
})
io.on('connection', async socket => {
    const products = await productos.getAll();
    const messages = await mensajes.getAll();
    socket.emit('update_products', products);
    socket.emit('update_messages', messages);
    socket.on('new_product', async product => {
        product = await productos.save(product)
        products.push(product)
        io.sockets.emit('update_products', products)
    })
    socket.on('new_message', async message => {
        messages.push(message)
        await mensajes.save(message)
        io.sockets.emit('update_messages', messages)
    })
})

// Port settings
const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
    console.log('Server running')
});
connectedServer.on(
    'error', error => console.log(`Error en el servidor : ${error}`)
)
