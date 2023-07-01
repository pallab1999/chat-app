const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT||3000

const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//let count=0
//server(emit)->client(receive)->countUpdated
//client(emit)->server(receive)->increment


//io.on('connection')->is for connecting a new client
io.on('connection',(socket)=>{
    console.log('New websocket connection')

    //take the query string from url to join the room and sends it to server
    socket.on('join',(options, callback)=>{
        //socket.join helps to join a given room

        const {error,user}=addUser({id:socket.id,...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome!'))
        //socket.broadcast.emit send the message to every user except one.
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()


        //socket.emit,io.emit,socket.broadcast.emit
        //io.to.emit->emit the message to everybody in a specifice room
        //socket.broadcast.to.emit->emit the message to everybody except a specifice client in a specific room
    })

    //event acknowledgement 
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()

        if(filter.isProfane(message)){
            return callback('Profenity is not allowed!')
        }
        
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
        
    })
    // socket.emit('countUpdated',count)
    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count)
    //     //update count for every connection
    //     //io.emit does the same thing as socket.io but io.emit update the every connection
    //     io.emit('countUpdated',count)
    // })


    //sharing geolocation of a client
    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()

    })


    //To disconnect a client and send the other users a message that someone is disconnected
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left.`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port,()=>{
    console.log(`server is running at port ${port}!`)
})