const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5001 });

let users = {}; // Store users { userId: { ws, role } }

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        const message = JSON.parse(data);

        // Store connected users properly
        if (message.type === "join") {
            users[message.userId] = { ws, role: message.role };
            console.log(`✅ ${message.role.toUpperCase()} (ID: ${message.userId}) connected`);
            broadcastStatus();
        }

        // Send messages to the correct recipient
        if (message.type === "message") {
            const recipient = users[message.to]; // Find recipient
            if (recipient) {
                recipient.ws.send(JSON.stringify({
                    type: "message",
                    from: message.userId,
                    message: message.message
                }));
            }
        }

        // Typing indicator
        if (message.type === "typing") {
            const recipient = users[message.to];
            if (recipient) {
                recipient.ws.send(JSON.stringify({
                    type: "typing",
                    from: message.userId
                }));
            }
        }
    });

    ws.on('close', () => {
        Object.keys(users).forEach((userId) => {
            if (users[userId].ws === ws) {
                console.log(`🔴 ${users[userId].role.toUpperCase()} (ID: ${userId}) disconnected`);
                delete users[userId]; // Remove user
                broadcastStatus();
            }
        });
    });

    function broadcastStatus() {
        const onlineUsers = Object.keys(users).length;
        Object.values(users).forEach(client => {
            client.ws.send(JSON.stringify({ type: "status", onlineUsers }));
        });
    }
});

console.log("🚀 WebSocket Server running on ws://localhost:5001");
