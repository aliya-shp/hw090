const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const {nanoid} = require('nanoid');

const app = express();
const port = 8000;

expressWs(app);

app.use(express.json());
app.use(cors());

const connections = {};
const drawings = [];

app.ws('/chat', function(ws, req) {
    const id = nanoid();
    let username = 'Anonymous';

    console.log('client connected with id - ' + id);

    connections[id] = ws;

    console.log('total clients connected ' + Object.keys(connections).length);

    ws.send(JSON.stringify({
        type: 'ALL_DRAWINGS',
        drawings: drawings,
    }));

    ws.on('message', (msg) => {
        console.log(`New drawing from ${id}: `, msg);

        const parsed = JSON.parse(msg);

        switch (parsed.type) {
            case 'NEW_DRAWING':
                Object.keys(connections).forEach(connId => {
                    const connection = connections[connId];
                    const newDrawing = {
                        username: username,
                        drawing: parsed.drawing,
                    };

                    connection.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        ...newDrawing,
                    }));

                    drawings.push(newDrawing);
                });
                break;
            case 'SET_USERNAME':
                console.log(`User ${id} (${username}) changed to ${parsed.username}`);
                username = parsed.username;
                break;
            default:
                console.log('NO_TYPE: ' + parsed.type);
        }
    });

    ws.on('message', function(msg) {
        ws.send(msg);
    });
});

app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
});