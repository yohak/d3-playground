import React, { Component } from "react";
import Scrollbars from "react-custom-scrollbars-2";

export class CustomScrollBar extends Component<any, any> {
  render() {
    return (
      <Scrollbars autoHide={true} universal={true}>
        {this.props.children}
      </Scrollbars>
    );
  }
}
