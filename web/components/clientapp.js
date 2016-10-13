import React from 'react'

import { Heading, TextArea, Button, Grid, GridRow, GridCol, Link } from 'instructure-ui'

export default class ClientApp extends React.Component {
  render() {
    if (!this.props.sharedText) {
      var text =
        <GridRow><GridCol>
          <p>Waiting for message...</p>
        </GridCol></GridRow>
    } else {
      var text =
        <GridRow><GridCol>
          <TextArea label="Message:" resize="vertical"
            width="100%" height="10em" value={this.props.sharedText} onChange={() => {}} disabled />
        </GridCol></GridRow>
    }

    return(
      <Grid>
        <GridRow><GridCol>
          <Heading level="h1">TextDrop</Heading>
        </GridCol></GridRow>
        {text}
      </Grid>
    )
  }
}
