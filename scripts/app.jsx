import React from 'react';
import Shell from './components/shell.jsx';
import Param from './components/param.jsx';

window.React = React;

var shell1 = {
  params: [
    { name: "find", before: "find(", after: ")", params: [
      { name: "find[query]", before: "{" , after: "}", type: "hash", required: true, focus: true },
      { name: "find[fields]", before: ",{", after: "}", button: "fields{}", type: "hash", hint: "Fields" }
    ]},
    { name: "sort", before: ".sort({", after: "})", button: "sort()", type: "hash" },
    { name: "skip", before: ".skip(", after: ")", button: "skip()", type: "number" },
    { name: "limit", before: ".limit(", after: ")", type: "number", value: 10 },
    { name: "explain", text: ".explain()", button: "explain()" }
  ],
  submit: 'Run'
}

// <Shell>
//   <Param name="find" before="find(" after=")">
//     <Param name="find[query]" before="{" after="}" type="hash" focus required />
//     <Param name="find[fields]" before=",{" after="}" type="hash" hint="Fields" />
//   </Param>
//   <Param name="sort" before=".sort({" after="})" type="hash" />
//   <Param name="skip" before=".skip(" after=")" type="number" />
//   <Param name="limit" before=".limit(" after=")" type="number" value="10" />
//   <Param name="explain" before=".explain" type="boolean" />
// </Shell>,

React.render(
  <Shell params={shell1.params} />,
  document.getElementById('shell1')
);

// <compose-shell method="get" on-notify="Megatron.notify">
//   <compose-shell-param name="name" required="true" before="createCollection(" placeholder="name" type="string"></compose-shell-param>
//   <compose-shell-param name="options[capped]" before=", { capped: true" after="}" optional>
//     <compose-shell-param name="options[size]" before=", size: " type="number"></compose-shell-param>
//     <compose-shell-param name="options[max]" before=", max: " type="number" dependency="options[size]"></compose-shell-param>
//   </compose-shell-param>
//   <compose-shell-param type="text">)</compose-shell-param>
  
//   <compose-shell-button toggle="options[size]">size</compose-shell-button>
//   <compose-shell-button toggle="options[max]">max</compose-shell-button>

//   <compose-shell-button type="submit">Create collection</compose-shell-button>
// </compose-shell>

var shell2 = {
  params: [
    {name: 'name', required: true, before: 'createCollection(', placeholder: 'name', type: 'string'},
    {name: 'options[capped]', before: ', { capped: true', after: '}', params: [
      {name: 'options[size]', before: ', size: ', type: 'number', button: 'size'},
      {name: 'options[max]', before: ', max: ', type: 'number', dependency: 'options[size]', button: 'max'}
    ]},
    {text: ')'}
  ]
}

React.render(
  <Shell params={shell2.params} />,
  document.getElementById('shell2')
);