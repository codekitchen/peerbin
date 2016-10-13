import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/app.js'
import './main.css'

import Server from './server.js'
import Client from './client.js'
import { RTCPeerConnection } from './rtc.js'

var appState = {
  text: "",
  isServer: true,
  errorMessage: null,
  shareLink: null
}

var textChanged = (newText) => {
  appState.text = newText
  if (appState.isServer) {
    server.sendAll(appState.text)
  }
}

var renderApp = () => {
  ReactDOM.render(
    <App {...appState} textChanged={textChanged} />,
    document.getElementById('app')
  )
}

if (!RTCPeerConnection) {
  appState.errorMessage = "Your browser doesn't support the WebRTC standard. Try Chrome or Firefox."
} else if (window.location.hash.length > 1) {
  var roomId = window.location.hash.slice(1)
  appState.isServer = false
  var client = new Client(roomId)

  client.onerror = (error) => {
    appState.errorMessage = "There was an error communicating with the host."
    if (error === 'ROOM_NO_EXIST') {
      appState.errorMessage = "This link is invalid or expired."
    }
    renderApp()
  }

  client.connect((text) => {
    appState.sharedText = text
    renderApp()
  })
} else {
  var server = new Server()

  server.onclientconnect = (clientId) => {
    server.sendMessage(clientId, appState.text)
  }

  server.onerror = (error) => {
    appState.errorMessage = "There was an error communicating with the host."
    renderApp()
  }

  server.connect((roomId) => {
    appState.shareLink = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/#${roomId}`
    renderApp()
  })
}

renderApp()
