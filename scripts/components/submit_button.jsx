import React from 'react';

export default class SubmitButton extends React.Component {

  render(){
    return <button className={this.props.className + " compose-shell-button"} type="submit">{this.props.children}</button>
  }

}