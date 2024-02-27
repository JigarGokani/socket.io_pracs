import express from "express"
import { Server } from "socket.io"
import {createServer} from "http"
import cors from "cors"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
 
const app = express()
const server = createServer(app)
const secretKey="jigar"

const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"],
        credentials:true,
    }
})

app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST"],
    credentials:true,
}))

app.get("/",(req,res)=>{
    res.send("Hello World!!")
})

app.get("/login",(req,res)=>{
    const token = jwt.sign({_id:"hgvaucgdiqw"},secretKey)

    res.cookie("token",token).json({
        message:"Login successfull!"
    })
})

const user = true;
// Socket.io Middlewares
io.use((socket,next)=>{
    cookieParser()(socket.request,socket.request.res,(err)=>{
        if(err) return next(err)

        const token = socket.request.cookies.token;

        if(!token) return next(new Error("Authentication Error"))

        const decoded = jwt.verify(token,secretKey)
        next()
    })
    
})


io.on("connection",(socket)=>{
    console.log("User connected!",socket.id)

    socket.broadcast.emit("welcome",`Welcome to the server,${socket.id}`)

    socket.on("message",({message,room})=>{
        console.log(message)
        io.to(room).emit("recieve-message",message)
    })

    socket.on("join-room",(room)=>{
        socket.join(room)
    })

    socket.on("disconnect",()=>{
        console.log(`User Disconnected with id ${socket.id}`)
    })
    
})

server.listen(4000,()=>{
    console.log("Server is listening at port 4000")
})