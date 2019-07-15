const express = require('express');
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMSG, generateLocMSG} = require('./utils/msgs.js')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(__dirname + "/public"))


io.on('connection',(socket) => {
    console.log('new web socket connection');
    
    socket.on('send_message', (msg, cb) => {
        const userMessager = getUser(socket.id)
        if (!userMessager) { return }

        const filter = new Filter()
        if (filter.isProfane(msg)){
            return cb('message blocked because it contains profane language')
        }


        io.to(userMessager.room).emit('messages', generateMSG(userMessager.name, msg))
        cb("server check")
    })

    socket.on('send_location', (location, cb) => {
        const userMessager = getUser(socket.id)
        if (!userMessager) { return }

        io.to(userMessager.room).emit('send_locationURL',generateLocMSG(userMessager.name,`https://google.com/maps?q=${location.lat},${location.long}`))
        cb('location shared!')
    })



    socket.on('join', (query, callback) => {
        socket.join(query.room)
        const addedUser = addUser({id: socket.id, name: query.username, room: query.room})
        if (addedUser.error) {
            return callback(addedUser.error)
        }

        socket.emit('messages', generateMSG("admin","Welcome to the chat app, enjoy)"))
        socket.broadcast.to(query.room).emit('messages',generateMSG("admin",`${query.username} has joined!`))
        io.to(query.room).emit('room_data', {room: query.room, users: getUsersInRoom(query.room)})
    })





    socket.on('disconnect',() => {
        const removedUser = removeUser(socket.id)
        console.log("removedid:", socket.id);
        
        if (removedUser) {
            io.emit('messages', generateMSG("admin",`${removedUser.name} has left`))
            io.to(removedUser.room).emit('room_data', {room: removedUser.room, users: getUsersInRoom(removedUser.room)})
        }
    })
})









const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server running on port >> ${PORT} <<`);
})