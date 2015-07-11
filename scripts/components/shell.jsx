import React from 'react';
import Param from './param.jsx';
import Button from './button.jsx';
import SubmitButton from './submit_button.jsx';

export default class Shell extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {};
    props.params.forEach(setParamVisibility.bind(this));
    console.log(this.state)
  }

  getParamVisibility(param){
    if (param.params)
      for (let p in param.params)
        if (this.getParamVisibility(param.params[p]))
          return true
    return ((param.text && !param.button) || (typeof param.value !== 'undefined' || !!param.required))
  }

  getParamsButtons(){
    let buttons = []
    this.props.params.forEach(pushButton.bind(this, buttons));
    return buttons
  }

  onButtonClick(event){
    console.log('button clicked', event.targetParam)
    this.setState({[`${event.targetParam}:visible`]: !this.state[event.targetParam + ':visible']})
  }

  onParamChange(event){
    console.log('param changed', event)
  }

  makeParam(param){
    return <Param
      key={'param:' + param.name}
      {...param}
      onChange={this.onParamChange.bind(this)}
      style={{display: this.state[param.name + ':visible'] ? 'inline-block' : 'none'}}
    >
      {(param.params || []).map(this.makeParam.bind(this))}
    </Param>
  }

  render() {
    return (
      <div className="compose-shell">
        <form>
          <div className="editor">
            <div className="params">
              {this.props.params.map(this.makeParam.bind(this))}
            </div>
            <div className="buttons">
              {this.getParamsButtons()}
              <SubmitButton className='run'>Run</SubmitButton>
            </div>
          </div>
        </form>
      </div>
    );
  }
};



function setParamVisibility(param){
  this.state[param.name + ':visible'] = this.getParamVisibility(param)
  if (param.params) {
    param.params.forEach(setParamVisibility.bind(this))
  }
}

function pushButton(buttons, param){
  if (param.required || (!param.params && !param.button))
    return
  if (param.params) {
    param.params.forEach(pushButton.bind(this, buttons))
  } else {
    buttons.push(<Button key={'button:' + param.name} {...param} onClick={this.onButtonClick.bind(this)} className={this.state[param.name + ':visible'] ? 'enabled': ''} />)
  }
}

function mappingFunction(map, child){
  map[child.props.name] = child.props
  if (child.props.children)
    child.props.children.forEach(mappingFunction.bind(this, map));
};