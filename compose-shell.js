var template = require('./templates/shell.hbs')

xtag.register('compose-shell', {
  lifecycle: {
    created: function(){
      var params = xtag.queryChildren(this, 'compose-shell-param')
      var buttons = xtag.queryChildren(this, 'compose-shell-button')
      var oldInputs = this.querySelectorAll('input,select,textarea')

      // Render the initial template
      this.innerHTML = template()

      for (var i in this.attributes) {
        var name = this.attributes[i].nodeName
        if (name)
          this.form.setAttribute(name, this.attributes[i].value)
      }

      [].forEach.call(oldInputs, function(input){
        this.form.appendChild(input)
      }.bind(this))
      
      var paramsEl = this.querySelector('.params')
      for (var i in params) {
        params[i].shell = this
        paramsEl.appendChild(params[i])
      }
      
      var buttonsEl = this.querySelector('.buttons')
      for (var i in buttons) {
        buttons[i].shell = this
        buttonsEl.appendChild(buttons[i])
      }

    }
  },

  events: {
    'submit:delegate(form)': function(event) {
      console.log('form submit')
      event.currentTarget.generateInputs()
    },
    'toggle:delegate(compose-shell-button)': function(event) {
      var toggle = event.target.getAttribute('toggle')

      var shell = event.currentTarget
      var param = shell.params[toggle]
      if (param) {
        param.toggle()
        param.focusInput()
      }
    },
    'show:delegate(compose-shell-param)': function(event){
      var shell = event.currentTarget
      if (this.dependency && !shell.params[this.dependency].visible) {
        xtag.fireEvent(shell, 'notify', {detail: {message: this.name + ' requires ' + this.dependency}})
        shell.params[this.dependency].show()
      }
      if (shell.buttons && shell.buttons[this.name])
        shell.buttons[this.name].enabled = true
    },
    'hide:delegate(compose-shell-param)': function(event){
      var shell = event.currentTarget
      if (this.requiredBy && !this.visible && shell.params[this.requiredBy].visible) {
        shell.params[this.requiredBy].hide()
      }
      if (shell.buttons && shell.buttons[this.name])
        shell.buttons[this.name].enabled = false
    },
    'keypress:keypass(13):delegate(compose-shell-param)': function(event){
      event.preventDefault()
      var submitEvent = new Event('submit', {bubbles: true, cancelable: true})
      var form = event.currentTarget.form
      form.dispatchEvent(submitEvent)
      setTimeout(function(){
        if (!submitEvent.defaultPrevented) {
          form.submit()
        }
      }, 50)
    },
    notify: function(event){
      if (this.onNotify)
        this.onNotify(event.detail.message)
    }
  },

  accessors: {
    form: { get: function(){ return this.querySelector('form') } },
    onNotify: {
      get: function(){
        var notify = this.getAttribute('on-notify')
        return notify && eval(notify) || false
      }
    }
  },

  methods: {
    registerParam: function(param){
      this.params = this.params || {}
      this.params[param.name] = param
      if (param.dependency && this.params[param.dependency])
        this.params[param.dependency].requiredBy = param.name
    },
    registerButton: function(button){
      this.buttons = this.buttons || {}
      this.buttons[button.toggle] = button
      if (this.params[button.toggle].visible)
        button.enabled = true
    },
    generateInputs: function() {
      for (var name in this.params) {
        if (this.params[name].value) {
          var input = document.createElement('input')
          input.type = 'hidden'
          input.value = this.params[name].value
          input.name = name
          this.form.appendChild(input)
        }
      }
    }
  }
})
