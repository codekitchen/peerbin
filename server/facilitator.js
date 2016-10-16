"use strict";

var uuid = require('node-uuid');

var Facilitator = function() {
  this.rooms = {};
};

Facilitator.prototype.host = function host(ws) {
  var roomId = uuid.v4();
  this.rooms[roomId] = { host: ws, clients: {} };
  return roomId;
}

Facilitator.prototype.unhost = function unhost(roomId) {
  var room = this.rooms[roomId];
  delete this.rooms[roomId]
  for (let clientId of Object.keys(room.clients)) {
    room.clients[clientId].close();
  }
}

Facilitator.prototype.join = function join(roomId, ws, offerMsg) {
  var room = this.rooms[roomId];
  if (!room) {
    ws.send(JSON.stringify({ type: 'error', message: 'ROOM_NO_EXIST' }))
    return;
  }
  var clientId = uuid.v4();
  room.clients[clientId] = ws;
  ws._peerbinClientId = clientId;
  room.host.send(JSON.stringify({ type: 'join', clientId: clientId, offer: offerMsg }));
}

Facilitator.prototype.send = function send(roomId, clientId, clientWs, message) {
  var room = this.rooms[roomId];
  if (!room) {
    clientWs.send(JSON.stringify({ type: 'error', message: 'ROOM_NO_EXIST' }))
    return;
  }
  var ws = room.host;
  if (clientId) {
    ws = room.clients[clientId];
  } else {
    message.clientId = clientWs && clientWs._peerbinClientId;
  }
  if (!ws) {
    clientWs.send(JSON.stringify({ type: 'error', message: 'CLIENT_NO_EXIST' }))
    return;
  }
  ws.send(JSON.stringify(message));
}

module.exports = function() {
  return new Facilitator();
}
