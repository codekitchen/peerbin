import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, makePeer, getWs } from './rtc.js'

export default class Server {
  connect(hostingCb) {
    this.hostingCb = hostingCb;

    this.websocket = getWs()
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
    var rtcdatachannel = this.clients[clientId].rtcdatachannel
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
    console.log("got message", message)

    if (message.inst === 'hosting') {
      this.roomId = message.roomId;
      this.hostingCb(this.roomId);
    }

    if (message.type === 'answer') {
      var client = this.clients[message.clientId]
      if (client) {
        var answer = new RTCSessionDescription(message)
        client.rtcpeerconn.setRemoteDescription(answer, function() {/* handler required but we have nothing to do */}, this.onerror);
      }
    }
    if (message.candidate) {
      var client = this.clients[message.clientId]
      if (client && client.rtcpeerconn.remoteDescription ) {
        console.log('adding ice candidate', message)
        // ignore ice candidates until remote description is set
        client.rtcpeerconn.addIceCandidate(new RTCIceCandidate(message.candidate))
      }
    }

    if (message.type === 'join') {
      var clientId = message.clientId;
      var offer = new RTCSessionDescription(message.offer);

      var rtcpeerconn = makePeer()
      rtcpeerconn.ondatachannel = (event) => {
        var rtcdatachannel = event.channel
        rtcdatachannel.onopen = () => {
          this.clients[clientId] = { rtcdatachannel, rtcpeerconn }
          this.onclientconnect(clientId)
        }
        rtcdatachannel.onclose = () => {
          delete this.clients[clientId]
        }
        rtcdatachannel.onerror = this.onerror
      }
      rtcpeerconn.onicecandidate = (event) => {
        if (!event || !event.candidate) return;
        console.log('got ice candidate', event.candidate)
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
