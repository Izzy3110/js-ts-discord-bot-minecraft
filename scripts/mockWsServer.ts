import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log('Mock WebSocket Server started on ws://localhost:8080');

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
    });

    // Send a message every 3 seconds
    const interval = setInterval(() => {
        const msg = `Test message at ${new Date().toISOString()}`;
        console.log('Broadcasting:', msg);
        ws.send(msg);
    }, 3000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});
