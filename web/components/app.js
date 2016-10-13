import React from 'react'

import { Heading, TextArea, Button, Grid, GridRow, GridCol, Link, Alert } from 'instructure-ui'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { text: "", submitted: false }
  }

  textChanged = (text) => {
    this.setState({ text })
  }

  submitText = () => {
    this.setState({ submitted: true })
    this.props.textChanged(this.state.text)
  }

  render() {
    if (!this.state.submitted) {
      var shareLink = <p></p>
    } else if (this.props.shareLink) {
      var shareLink =
        <div>
          <p>While this page remains open, the data will be available to others at this URL:</p>
          <p><Link href={this.props.shareLink}>{this.props.shareLink}</Link></p>
          <p>Once you close this page, the data is gone for good.</p>
        </div>
    } else {
      var shareLink =
        <p>Configuring p2p channel...</p>
    }

    var textAreaProps = {
    }
    if (!this.props.isServer) {
      textAreaProps.value = this.props.sharedText
    }

    return(
      <Grid>
        <GridRow><GridCol>
          <Heading level="h1">PeerBin</Heading>
          { this.props.isServer &&
          <p>
            Send sensitive data to others over a peer-to-peer connection. The data is encrypted in transit, and sent directly from your browser to the recipient&rsquo;s without going through any server.
          </p>
          }
        </GridCol></GridRow>
        <GridRow><GridCol>
          { this.props.errorMessage ?
          <Alert variant="error">{ this.props.errorMessage }</Alert>
            :
          <TextArea label={ this.props.isServer ? "Your secrets:" : "Message:" } resize="vertical"
            width="100%" height="10em"
            placeholder={ this.props.isServer ? "My password is 1234" : "Waiting for message..." }
            onChange={this.textChanged} {...textAreaProps} />
          }
        </GridCol></GridRow>
        <GridRow><GridCol>
        { this.props.isServer && !this.props.errorMessage &&
          <Button isBlock disabled={this.state.text.length < 1} variant="primary" onClick={this.submitText}>Share</Button>
        }
        </GridCol></GridRow>
        <GridRow><GridCol>
        { this.props.isServer && shareLink }
        { !this.props.isServer &&
          <p><Link href="/">Start a new PeerBin</Link></p>
        }
        </GridCol></GridRow>
      </Grid>
    )
  }
}
