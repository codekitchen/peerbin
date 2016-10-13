import React from 'react'

import { Heading, TextArea, Button, Grid, GridRow, GridCol, Link } from 'instructure-ui'

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
        <GridRow><GridCol>
          <p>While this page remains open, the data will be available to others at this URL:</p>
          <p><Link href={this.props.shareLink}>{this.props.shareLink}</Link></p>
          <p>Once you close this page, the data is gone for good.</p>
        </GridCol></GridRow>
    } else {
      var shareLink =
        <GridRow><GridCol>
          <p>Configuring p2p channel...</p>
        </GridCol></GridRow>
    }

    return(
      <Grid>
        <GridRow><GridCol>
          <Heading level="h1">TextDrop</Heading>
          <p>
            Send sensitive data to others over a peer-to-peer connection. The data is encrypted in transit, and sent directly from your browser to the recipient&rsquo;s without going through any server.
          </p>
        </GridCol></GridRow>
        <GridRow><GridCol>
          <TextArea label="Your secrets:" resize="vertical"
            width="100%" height="10em"
            placeholder="My password is 1234"
            onChange={this.textChanged} />
        </GridCol></GridRow>
        <GridRow><GridCol>
          <Button isBlock disabled={this.state.text.length < 1} variant="primary" onClick={this.submitText}>Share</Button>
        </GridCol></GridRow>
        {shareLink}
      </Grid>
    )
  }
}
