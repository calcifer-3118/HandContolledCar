
/**
 * WebSocket Server
 */
 const WebSocket = require('ws')
 const server = new WebSocket.Server({ port: 8085 })
 
    
    
    server.on('connection', socket =>{

        socket.onmessage = ({data}) => {
           console.log(data)
        }

    })  