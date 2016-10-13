import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, makePeer } from './rtc.js'

export default class Client {
  constructor(roomId) {
    this.roomId = roomId
    this.rtcpeerconn = makePeer()
    this.rtcpeerconn.onicecandidate = this.onicecandidate
  }

  connect(textCb) {
    this.textCb = textCb
    this.websocket = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port + '/connect')
    this.websocket.onmessage = this.gotMessage
    this.websocket.onopen = this.createOffer
  }

  gotMessage = (input) => {
    var message = JSON.parse(input.data)
    console.log('got message', message)

    if (message.type === 'error') {
      this.onerror(message.message)
    }
    if (message.type === 'answer') {
      var answer = new RTCSessionDescription(message)
      this.rtcpeerconn.setRemoteDescription(answer, function() {/* handler required but we have nothing to do */}, this.onerror);
    }
    if (this.rtcpeerconn.remoteDescription && message.candidate) {
      // ignore ice candidates until remote description is set
      this.rtcpeerconn.addIceCandidate(new RTCIceCandidate(message.candidate))
    }
  }

  onerror = (message) => {
  }

  onicecandidate = (event) => {
    if (!event || !event.candidate) return
    console.log('got ice candidate', event.candidate)
    this.websocket.send(JSON.stringify({
      inst: 'send',
      roomId: this.roomId,
      message: {candidate: event.candidate}
    }))
  }

  createOffer = () => {
    this.rtcdatachannel = this.rtcpeerconn.createDataChannel('textdrop')
    this.rtcdatachannel.onmessage = (event) => {
      this.textCb(event.data)
    }

    this.rtcpeerconn.createOffer((offer) => {
      this.rtcpeerconn.setLocalDescription(offer, () => {
        var output = offer.toJSON()
        if(typeof output === 'string') output = JSON.parse(output) // normalize: RTCSessionDescription.toJSON returns a json str in FF, but json obj in Chrome
        console.log('sending offer', output)

        this.websocket.send(JSON.stringify({
          inst: 'join',
          roomId: this.roomId,
          message: output
        }))
      }, this.onerror)
    }, this.onerror)
  }
}
