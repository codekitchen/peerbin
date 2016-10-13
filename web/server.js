import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, makePeer } from './rtc.js'

export default class Server {
  connect(hostingCb) {
    this.hostingCb = hostingCb;

    this.websocket = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port + '/connect')
    this.websocket.onmessage = this.gotMessage

    this.websocket.onopen = () => {
      this.websocket.send(JSON.stringify({
        inst: 'host'
      }));
    }
    this.clients = {}
  }

  onerror = () => {
  }

  onclientconnect = (clientId) => {}

  sendMessage(clientId, text) {
    var rtcdatachannel = this.clients[clientId]
    if (!rtcdatachannel) return
    rtcdatachannel.send(text)
  }

  sendAll(text) {
    for (let clientId of Object.keys(this.clients)) {
      this.sendMessage(clientId, text)
    }
  }

  gotMessage = (input) => {
    var message = JSON.parse(input.data)

    if (message.inst === 'hosting') {
      this.roomId = message.roomId;
      this.hostingCb(this.roomId);
    }

    if (message.type === 'join') {
      var clientId = message.clientId;
      var offer = new RTCSessionDescription(message.offer);

      var rtcpeerconn = makePeer()
      rtcpeerconn.ondatachannel = (event) => {
        var rtcdatachannel = event.channel
        rtcdatachannel.onopen = () => {
          this.clients[clientId] = rtcdatachannel
          this.onclientconnect(clientId)
        }
        rtcdatachannel.onerror = this.onerror
      }
      rtcpeerconn.onicecandidate = (event) => {
        if (!event || !event.candidate) return;
        this.websocket.send(JSON.stringify({
          inst: 'send',
          roomId: this.roomId,
          clientId: clientId,
          message: {candidate: event.candidate}
        }))
      }

      rtcpeerconn.setRemoteDescription(offer, () => {
        rtcpeerconn.createAnswer((answer) => {
          rtcpeerconn.setLocalDescription(answer, () => {
            var output = answer.toJSON()
            if(typeof output === 'string') output = JSON.parse(output) // normalize: RTCSessionDescription.toJSON returns a json str in FF, but json obj in Chrome

            this.websocket.send(JSON.stringify({
              inst: 'send',
              roomId: this.roomId,
              clientId: clientId,
              message: output
            }))
          }, this.onerror)
        }, this.onerror)
      }, this.onerror)
    }
  }
}
