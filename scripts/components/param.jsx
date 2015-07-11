import React from 'react/addons';
import Input from './input.jsx';

export default class Param extends React.Component {

  onChange(event){
    this.props.onChange(event)
  }

  htmlContent(){
    if (this.props.children && this.props.children.length > 0) {
      console.log(this.props.name, this.props.children)
      return <span className="params-group">{this.props.children}</span>;
    } else {
      if (this.props.text) {
        return <span>{this.props.text}</span>;
      } else if (this.props.type === 'boolean') {
        return <span className="boolean">{this.props.children}</span>;
      } else {
        return <Input {...this.props} onChange={this.onChange.bind(this)} />
      }
    }
  }

  render() {
    return (
      <div className="compose-shell-param" style={this.props.style}>
        <span className="before">{this.props.before}</span>
        {this.htmlContent()}
        <span className="after">{this.props.after}</span>
      </div>
    );
  }
}
