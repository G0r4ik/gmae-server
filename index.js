import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import createAnimalName from './generateName.js';
import db from './database.js';
import { nanoid } from 'nanoid';
const rooms = {};
setInterval(() => {
    console.log(Object.entries(rooms).map(([room, roomKeys]) => {
        return `${room}: [${Object.values(roomKeys.users).map(i => i.userName)}]`;
    }), wss.clients.size);
}, 3000);
const wss = new WebSocketServer({ port: 5001 }, () => console.log(`Server started on 5001`));
wss.on('connection', async function connection(socket) {
    const uuid = uuidv4();
    socket.on('message', (dataString) => {
        const data = JSON.parse(dataString);
        console.log('received: %o', data);
        switch (data.meta) {
            case 'createUser':
                return createUser(uuid, socket);
            case 'join':
                return joinToRoom(data.room, uuid, socket, data.user);
            case 'startGame':
                return startGame(data.room);
            case 'leave':
                return leave(data.room, uuid);
            case 'createRoom':
                return createRoom(uuid, data.user, socket);
            case 'move':
                return sendMessageExpectSender(data.room, data.user, {
                    type: 'move',
                    message: 'ход сделан',
                    cordinates: data.cordinates,
                });
            case 'changeSize':
                const dataRest = { type: 'changeSize', size: data.size };
                return sendMessageExpectSender(data.room, data.user, dataRest);
            case 'restart':
                return sendMessageExpectSender(data.room, data.user, {
                    type: 'restart',
                });
            case 'acceptRestart':
                return sendMessageExpectSender(data.room, data.user, {
                    type: 'acceptRestart',
                });
            case 'updateWebsocketId':
                return sendMessage(socket, {
                    type: 'updateWebsocketId',
                    websocketId: uuid,
                });
            case 'leaveGame':
                return leaveGame(data.user, data.room);
            default:
                return sendMessageInCurrentRoom(data.room, { message: 'wtf' });
        }
    });
    socket.on('close', () => {
        changeNumberOfUsers();
        Object.keys(rooms).forEach(roomId => leave(roomId, uuid));
    });
    changeNumberOfUsers();
});
// ----------------------------------------------------------------------------
// +
function broadcastMessage(data) {
    wss.clients.forEach(client => sendMessage(client, data));
}
// +
function sendMessageInCurrentRoom(roomId, data) {
    Object.values(rooms[roomId].users).forEach(user => sendMessage(user.socket, data));
}
// !
function sendMessageExpectSender(roomId, user, data) {
    Object.values(rooms[roomId].users)
        .filter(userItem => userItem.userName !== user.userName)
        .forEach(userItem => sendMessage(userItem.socket, data));
}
// +
function sendMessage(socket, message) {
    socket.send(JSON.stringify(message));
}
// ----------------------------------------------------------------------------
function leaveGame(user, roomId) {
    sendMessageExpectSender(roomId, user, {
        type: 'leaveGame',
        message: `Пользовоатель ${user.userName} вышел`,
    });
}
function createUser(uuid, socket) {
    const userName = createAnimalName();
    const query = db
        .prepare('INSERT INTO "users"("user_name", "websocket", "is_anon") VALUES (?, ?, ?) RETURNING *')
        .run(userName, uuid, 1);
    const id = query.lastInsertRowid;
    sendMessage(socket, { type: 'createUser', id, websocketId: uuid, userName });
}
// +
function changeNumberOfUsers() {
    broadcastMessage({ type: 'usersCountChange', countOfUser: wss.clients.size });
}
function createRoom(uuid, user, socket) {
    const roomId = nanoid(11);
    if (rooms[roomId])
        return createRoom(uuid, user, socket);
    if (!rooms[roomId]) {
        rooms[roomId] = {
            users: { [uuid]: { ...user, socket } },
            leader: user,
            size: 4,
        };
    }
    sendMessageInCurrentRoom(roomId, {
        message: 'Комната создана',
        type: 'createRoom',
        room: roomId,
    });
}
function joinToRoom(roomId, uuid, socket, user) {
    if (!rooms[roomId]) {
        return sendMessage(socket, {
            error: 'Такого лобби не существует',
            type: 'joinToRoom',
        });
    }
    if (!rooms[roomId].users[uuid])
        rooms[roomId].users[uuid] = { ...user, socket };
    // .socket = socket
    const users = [];
    for (const user of Object.values(rooms[roomId].users))
        users.push({
            userName: user.userName,
            websocketId: user.websoketId,
        });
    sendMessageInCurrentRoom(roomId, {
        user: users,
        room: roomId,
        type: 'joinToRoom',
    });
}
function startGame(roomId) {
    sendMessageInCurrentRoom(roomId, {
        message: 'Игра началась',
        type: 'startGame',
    });
}
function leave(room, uuid) {
    if (!rooms[room].users[uuid])
        return;
    const user = rooms[room].users[uuid];
    delete rooms[room].users[uuid];
    if (Object.keys(rooms[room].users).length === 0) {
        delete rooms[room];
    }
    else {
        sendMessageInCurrentRoom(room, {
            message: 'Из лобби вышли',
            type: 'leaveRoom',
            user,
        });
    }
}
