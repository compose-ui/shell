import React from 'react/addons';

export default class Input extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return <span
      ref='input'
      onInput={this.emitChange.bind(this)} 
      onBlur={this.emitChange.bind(this)}
      contentEditable
      dangerouslySetInnerHTML={{__html: this.getDisplayValue()}}
      spellCheck="false"
      className="{this.props.type}{this.props.placeholder ? ' ' + this.props.placeholder : ''}"
    ></span>;
  }

  getDisplayValue(){
    return this.props.value || this.props.placeholder || '';
  }

  shouldComponentUpdate(nextProps){
    return nextProps.html !== React.findDOMNode(this).innerHTML;
  }

  componentDidUpdate() {
    if ( this.props.value !== React.findDOMNode(this).innerHTML ) {
      React.findDOMNode(this).innerHTML = this.getDisplayValue();
    }
  }

  emitChange(){
    var html = React.findDOMNode(this).innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      this.props.onChange({
        target: {
          param: this.props.name,
          value: html
        }
      });
    }
    this.lastHtml = html;
  }
}