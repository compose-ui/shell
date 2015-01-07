var template = require('./templates/param.hbs')
var BSON = require('./lib/bson')
var cssAnimEventTypes = require('./lib/anim-events')

xtag.register('compose-shell-param', {
  lifecycle: {
    created: function(){
      this.params = xtag.queryChildren(this, 'compose-shell-param')
      this.group = !!this.params.length

      this.innerHTML = template({
        before: this.getAttribute('before'),
        group: this.group,
        editable: this.editable,
        value: this.parseValue(this.getAttribute('value')),
        type: this.type,
        content: this.textContent,
        after: this.getAttribute('after'),
        placeholder: this.placeholder
      })
    },
    inserted: function(){
      this.hide()

      if (this.params.length > 0) {
        var groupEl = this.querySelector('.params-group')
        for (var param in this.params) {
          // this.onShellSet.push(function(){
          //   this.params[param].shell = this.shell
          // })
          this.params[param].shell = this.shell
          this.params[param].addEventListener('show', this.updateVisibility.bind(this))
          this.params[param].addEventListener('hide', this.updateVisibility.bind(this))
          groupEl.appendChild(this.params[param])
        }
      }

      if (this.type)
        this.shell.registerParam(this)// this.onShellSet = [function(){this.shell.registerParam(this)}].concat(this.onShellSet)

      if (this.type === 'text' || (this.getAttribute('value') || this.required))
        this.visible = true
      if (this.getAttribute('focus'))
        this.focusInput()
    }
  },

  events: {
    'focus:delegate(span[contenteditable])': function(event) {
      var param = event.currentTarget
      if (param.group) return
      if (param.placeholder) {
        if (this.textContent === param.placeholder && /placeholder/.test(this.className))
          this.textContent = ''
      }
    },
    'blur:delegate(span[contenteditable])': function(event) {
      var param = event.currentTarget
      if (param.group) return
      if (param.placeholder)
        if (this.textContent === '') {
          this.textContent = param.placeholder
          if (!/placeholder/.test(this.className))
            this.className += ' placeholder'
        } else {
          this.className = this.className.replace('placeholder', '')
        }
    },
    'paste:delegate(span[contenteditable])': function(event){
      var param = event.currentTarget
      if (param.group) return
      event.preventDefault()
      if (event.clipboardData) {
        var content = (event.originalEvent || event).clipboardData.getData('text/plain').replace(/^\s+|\s+$/g, '')
        document.execCommand('insertText', false, content)
      }
      else if (window.clipboardData) {
        var content = window.clipboardData.getData('Text').replace(/^\s+|\s+$/g, '')
        document.selection.createRange().pasteHTML(content)
      }

    },
    show: function(event){
      if (this.hint)
        this.showHint()
    }
  },

  accessors: {
    // params: { get: function(){ return xtag.queryChildren(this, 'compose-shell-param') } },
    name: { get: function(){ return this.getAttribute('name') } },
    type: { get: function(){ return this.getAttribute('type') } },
    placeholder: { get: function(){ return this.getAttribute('placeholder') } },
    hint: { get: function(){ return this.getAttribute('hint') } },
    required: { get: function(){ return this.getAttribute('required') } },
    focus:    { get: function(){ return this.getAttribute('focus') } },
    // group: { get: function() { return this.params.length > 0 } },
    editable: { get: function() { return !this.group && this.type && this.type !== 'boolean' } },
    optional: { get: function(){ return !!this.getAttribute('optional') } },
    dependency: { get: function(){ return this.getAttribute('dependency') } },
    customInput: { get: function() { return this.querySelector('span[contenteditable]') } },
    parser: { get: function() { return this.getAttribute('parser') } },
    visible: {
      get: function(){ return !this.getAttribute('hidden') },
      set: function(visible){
        if (visible === true) {
          this.removeAttribute('hidden')
          xtag.fireEvent(this, 'show')
        } else if (visible === false) {
          this.setAttribute('hidden', true)
          xtag.fireEvent(this, 'hide')
        }
      }
    },

    value: {
      get: function(){
        var val;
        if (!this.visible)
          return null // no value
        if (this.type === 'boolean') {
          val = 1
        } else if (this.customInput) {
          // ensure stuff by blurring.
          this.customInput.blur()

          val = this.customInput.textContent
          if (this.placeholder) {
            if (/placeholder/.test(this.customInput.className) && val === this.placeholder)
              val = ""
          }
          if (val && this.type === 'hash')
            val = '{' + val + '}'
        }
        return this.serializeValue(val)
      }
    }
  },

  methods: {
    toggle: function(){ this.visible = !this.visible },
    show: function(){ this.visible = true },
    hide: function(){ this.visible = false },

    focusInput: function(){
      if (this.customInput)
        this.customInput.focus()
    },
    
    updateVisibility: function(){
      this.visible = [].some.call(this.params, function(child){ return child.visible })
    },

    showHint: function(){
      var hintEl = this.querySelector('.hint')
      if (hintEl)
        this.removeChild(hintEl)
      
      hintEl = document.createElement('span')
      hintEl.className = 'hint'
      hintEl.textContent = this.hint

      clearTimeout(this.hintTimeout)
      this.appendChild(hintEl)
      this.hintTimeout = setTimeout(function(){
        hintEl.className += ' out'
        hintEl.addEventListener(cssAnimEventTypes.end, function animEnd(event){
          this.removeChild(hintEl)
          hintEl.removeEventListener(cssAnimEventTypes.end, animEnd)
        }.bind(this), false)
      }.bind(this), 2000)
    },

    serializeValue: function(value){
      if (!this.parser)
        return value

      if (this.parser === 'bson') {
        try {
          return JSON.stringify(BSON.bsonEval(value))
        } catch (error) {
          console.log(error)
          xtag.fireEvent(this, 'error', {detail: {error: new Error('Unparsable value for ' + this.name)}})
        }
      }
    },
    
    parseValue: function(value){
      if (!this.parser)
        return value
      if (this.parser === 'bson' && value) {
        try {
          return stripWrapper(BSON.toBsonString(JSON.parse(value), {indentation: 0}))
        } catch (error) {
          console.log(error)
          return value
        }
      }
    }
  }
})

function stripWrapper(queryString) {
  var matches = queryString.match(/\{(.+)\}/)
  if (matches)
    return matches[1]
}
