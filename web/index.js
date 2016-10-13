import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/app.js'
import ClientApp from './components/clientapp.js'
import './main.css'

import Server from './server.js'
import Client from './client.js'

if (window.location.hash.length > 1) {
  var roomId = window.location.hash.slice(1)
  var client = new Client(roomId)

  client.connect((text) => {
    ReactDOM.render(
      <ClientApp sharedText={text} />,
      document.getElementById('app')
    )
  })

  ReactDOM.render(
    <ClientApp sharedText="" />,
    document.getElementById('app')
  )
} else {
  var server = new Server()
  var text = ""

  server.onclientconnect = (clientId) => {
    server.sendMessage(clientId, text)
  }

  var textChanged = (newText) => {
    text = newText
    server.sendAll(text)
  }

  server.connect((roomId) => {
    var shareLink = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/#${roomId}`
    ReactDOM.render(
      <App shareLink={shareLink} textChanged={textChanged} />,
      document.getElementById('app')
    )
  })

  ReactDOM.render(
    <App textChanged={textChanged} />,
    document.getElementById('app')
  )
}
