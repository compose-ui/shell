var _ = require('lodash')
var Ractive = require('ractive')
var bean = require('bean')
var fs = require('fs')
var template = fs.readFileSync(__dirname + '/template.html', 'utf8')
var caret = require('./caret')
var cssAnimEventTypes = require('compose-animevent').types

require('./vendor/ractive-events-tap')
require('./vendor/ractive-events-keys')

var ShellView = Ractive.extend({
  template: template,
  beforeInit: function(options){
    this.shell = new Shell(options.params)
    console.log(this.shell)
    this.onSubmit = options.onSubmit
  },
  init: function(options) {
    this.set('fields', this.shell.fields)
    this.set('submitButton', options.params.submit)
    
    var self = this
    this.on({
      change: function(){
        console.log('change', arguments)
      },
      buttonClick: function(event){
        console.log('buttonClick', arguments)
        if (event.index) {// Comes from iterating on params
          event.original.preventDefault()
          self.toggleField(event)
        }
      },
      submit: function(event){
        if (event && event.original)
          event.original.preventDefault()
        console.log('submit', arguments)
        _.forEach(self.findAll('span[contenteditable]'), function(el){
          bean.fire(el, 'blur')
        })
        self.run()
        return false
      },
      focusField: function(event){
        console.log('focusField', event)
        var field = event.context
        if (field.placeholder && event.node.textContent === field.placeholder)
          event.node.textContent = Field.filler
        if (event.node)
          caret(event.node, event.node.textContent.length)
      },
      blurField: function(event){
        console.log('blurField', event)
        var text = event.node.textContent
        var field = event.context
        if (field.placeholder) {
          if (text === Field.filler || text === '') {
            event.node.textContent = field.placeholder
            event.node.className += 'placeholder'
          } else {
            event.node.className = event.node.className.replace('placeholder', '')
          }
        }
        this.set(event.keypath + '.value', text)
      },
      paste: function(event){
        console.log('paste', event)
        _.delay(function(){
          var el = event.node
          var text = el.textContent
          var c = caret(el)
          var end = text.length - c.start - c.length
          var dummy = document.createElement('textarea')
          console.log(text)
          dummy.textContent = text
          
          console.log(dummy)
          // focus on the textarea
          bean.fire(dummy, 'focus')
          caret(dummy, c)
          
          _.delay(function(){
            var text = dummy.textContent
            el.textContent = text
            bean.fire(el, 'focus')
            caret(el, text.length - end)
          }, 50)
        }, 1)
      }
    })
  },

  toggleField: function(event){
    var field = event.context
    this.toggle(event.keypath + '.visible')
    if (field.visible) {
      if (!field.text) {
        var inputEl = this.find('span[data-field="'+field.name+'"] span[contenteditable]')
        bean.fire(inputEl, 'focus')
      }
      if (field.hint) {
        console.log('field.hint toggle', field)
        var el = this.find('[data-field="'+field.name+'"]')
        console.log(el)
        var hintEl = this.find('[data-field="'+field.name+'"] .hint')
        if (hintEl)
          el.removeChild(hintEl)
        hintEl = document.createElement('span')
        hintEl.className = 'hint'
        hintEl.textContent = field.hint

        clearTimeout(field.hintTimeout)
        el.appendChild(hintEl)
        field.hintTimeout = setTimeout(function(){
          console.log('add out class')
          hintEl.className += ' out'
          hintEl.addEventListener(cssAnimEventTypes.end, function animEnd(event){
            el.removeChild(hintEl)
            hintEl.removeEventListener(cssAnimEventTypes.end, animEnd)
          }, false)
        }, 2000)
      }
    }
  },

  run: function(){
    console.log('RUN!')
    this.onSubmit(this.serialize())
  },

  serialize: function(){
    return this.shell.serialize()
  }
})

module.exports = ShellView


/**
 * Shell UI Component constructor
 * @param {String} selector  jQuery-compatible selector for the Shell element
 * @param {Array}  fields    Fields to present in the Shell
 */
function Shell(params) {
  this.fields = {}
  var fields = params.fields
  for (var field in fields) {
    if (fields[field].group) {
      this.fields[fields[field].name] = new FieldGroup(fields[field])
    } else {
      this.fields[fields[field].name] = new Field(fields[field])
    }
  }
}

Shell.prototype.serialize = function(){
  var params = {}
  _.forEach(this.fields, function(field, name){
    if (field instanceof FieldGroup) {
      _.forEach(field.getValue(), function(value, name){
        if (value !== null)
          params[name] = value
      })
    } else {
      var value = field.getValue()
      if (value !== null)
        params[name] = value
    }
  })
  return params
}

function FieldGroup(param){
  this.children = {}
  _.merge(this, new Field(param))
  var fields = param.group
  for (var field in fields) {
    if (fields[field].group) {
      this.children[fields[field].name] = new FieldGroup(fields[field])
    } else {
      this.children[fields[field].name] = new Field(fields[field], {child: true})
    }
  }
}

FieldGroup.prototype.getValue = function(){
  var params = {}
  _.forEach(this.children, function(field, name){
    params[name] = field.getValue()
  })
  return params
}

function Field(param, options){
  _.merge(this, Field.parse(param, options))
}

Field.prototype.getValue = function(){
  console.log('getValue', this.name, this.value)
  if (!this.visible)
    return null
  var value = '' + this.value + ''
  value = value.replace(Field.filler, '').replace(this.placeholder, '')
  if (value) {
    if (this.type === 'hash')
      value = '{' + value + '}' 
    return value
  } else {
    return null
  }
}

// Our defaults for a Field
Field.defaults = {
  name: false,
  value: '',
  text: '',
  before: '',
  after: '',
  'class': '',
  visible: false,
  button: false,
  hint: false,
  placeholder: '',
  group: false,
  type: 'text',
  optional: false,
  requires: false,
  inputClass: ''
}

Field.filler = '\u200B'

Field.parse = function(data, options){
  var options = options ? _.cloneDeep(options) : {}
  var field = _.defaults(_.cloneDeep(data), Field.defaults)

  // A field is visible if it either:
  // - has no button
  // - has `visible` set to true
  // - has a value
  var visible = !field.button || field.visible === true || field.value !== ''
  
  // Useful for templating purposes
  field.visible = !field.optional && visible

  // Use either its set value, the placeholder or in the last case, the filler
  field.value =
    !field.text && field.value ||
    field.placeholder ||
    Field.filler

  // Manage DOM classes

  if (field.text && options.child)
    field['class'] += ' text'
  if (field.optional)
    field['class'] += ' optional'
  if (field.placeholder)
    field.inputClass += ' placeholder'

  return field
}