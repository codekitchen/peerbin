var uuid = require('node-uuid');

// TODO: nothing ever gets cleaned up, here.
var Facilitator = function() {
  this.rooms = {};
};

Facilitator.prototype.host = function host(ws) {
  var roomId = uuid.v4();
  this.rooms[roomId] = { host: ws, clients: {} };
  return roomId;
}

Facilitator.prototype.join = function join(roomId, ws, offerMsg) {
  var room = this.rooms[roomId];
  if (!room) {
    throw new Error("Room does not exist: `" + roomId + "`");
  }
  var clientId = uuid.v4();
  room.clients[clientId] = ws;
  room.host.send(JSON.stringify({ type: 'join', clientId: clientId, offer: offerMsg }));
}

Facilitator.prototype.send = function send(roomId, clientId, message) {
  var room = this.rooms[roomId];
  if (!room) {
    throw new Error("Room does not exist: `" + roomId + "`");
  }
  var ws = room.host;
  if (clientId) {
    ws = room.clients[clientId];
  }
  if (!ws) {
    throw new Error("Client does not exist: `" + clientId + "`");
  }
  ws.send(JSON.stringify(message));
}

module.exports = function() {
  return new Facilitator();
}
