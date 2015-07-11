import React from 'react';

export default class Button extends React.Component {
  onClick(event){
    event.preventDefault()
    this.props.onClick({
      targetParam: this.props.name
    })
  }

  render() {
    return (
      <button className={this.props.className + " compose-shell-button"} onClick={this.onClick.bind(this)}>
        {this.props.button}
      </button>
    )
  }
}
