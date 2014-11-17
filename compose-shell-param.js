var template = require('./param.hbs')
var BSON = require('./bson')
var cssAnimEventTypes = require('./anim-events')

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

      if (this.params.length > 0) {
        var groupEl = this.querySelector('.group')
        for (var param in this.params) {
          this.params[param].shell = this.shell
          this.params[param].addEventListener('shown', this.updateVisibility.bind(this))
          this.params[param].addEventListener('hid', this.updateVisibility.bind(this))
          groupEl.appendChild(this.params[param])
        }
      }

      // set them again
      // this.params = xtag.queryChildren(this, 'compose-shell-param')

      if (this.params.length === 0) {
        this.shell.registerParam(this)
      }

      this.visible = this.determineVisibility()
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
    shown: function(event){
      if (this.customInput)
        this.customInput.focus()
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
          xtag.fireEvent(this, 'shown')
          if (this.button)
            this.button.enabled = true
        } else if (visible === false) {
          this.setAttribute('hidden', true)
          xtag.fireEvent(this, 'hid')
          if (this.button)
            this.button.enabled = false
        }
      }
    },

    value: {
      get: function(){
        var val;
        if (this.customInput) {
          // ensure stuff by blurring.
          this.customInput.blur()

          val = this.customInput.textContent
          if (this.placeholder) {
            if (/placeholder/.test(this.customInput.className) && val === this.placeholder)
              val = ""
          }
          if (val && this.type === 'hash')
            val = '{'+val+'}'
        } else if (this.type === 'boolean') {
          val = this.visible ? 1 : 0
        }
        return this.serializeValue(val)
      }
    },

    button: {
      get: function(){ return this._button },
      set: function(button){
        this._button = button
        this.visible = this.determineVisibility()
      }
    }
  },

  methods: {
    registerParam: function(param){
      // Pass through
      this.shell.registerParam(param)
    },
    toggle: function(){
      this.visible = !this.visible
    },
    show: function(){
      this.visible = true
    },
    hide: function(){
      this.visible = false
    },
    updateVisibility: function(){
      this.visible = this.determineVisibility()
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
    },

    determineVisibility: function(){
      if (this.type === 'text')
        return true
      if (this.group) {
        var hasOneVisible = false
        for (var i in this.params) {
          if (this.params[i].visible) {
            hasOneVisible = true
          }
        }
        return hasOneVisible
      } else {
        if (this.button) {
          return this.button.enabled
        } else {
          return !this.optional && this.value
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