var template = require('./shell.hbs')

xtag.register('compose-shell', {
  lifecycle: {
    created: function(){
      var params = xtag.queryChildren(this, 'compose-shell-param')
      var buttons = xtag.queryChildren(this, 'compose-shell-button')
      
      // Render the initial template
      this.innerHTML = template({
        action: this.action,
        method: this.method
      })
      
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
      event.currentTarget.submit()
    },
    'toggle:delegate(compose-shell-button)': function(event) {
      var toggle = event.target.getAttribute('toggle')

      var shell = event.currentTarget
      var param = shell.params[toggle]
      if (param)
        param.toggle()
    },
    'shown:delegate(compose-shell-param)': function(event){
      var shell = event.currentTarget
      if (this.dependency && !shell.params[this.dependency].visible) {
        xtag.fireEvent(shell, 'notify', {detail: {message: this.name + ' requires ' + this.dependency}})
        shell.params[this.dependency].show()
      }
    },
    'hid:delegate(compose-shell-param)': function(event){
      var shell = event.currentTarget
      if (this.requiredBy && !this.visible && shell.params[this.requiredBy].visible) {
        shell.params[this.requiredBy].hide()
      }
    },
    'keypress:keypass(13):delegate(compose-shell-param)': function(event){
      event.preventDefault()
      event.currentTarget.submit()
    },
    notify: function(event){
      if (this.onNotify)
        this.onNotify(event.detail.message)
    }
  },

  accessors: {
    action: { get: function(){ return this.getAttribute('action') } },
    method: { get: function(){ return this.getAttribute('method') || 'GET' } },
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
      // this.associateButtonsAndParams(param.name)
    },
    registerButton: function(button){
      this.buttons = this.buttons || {}
      this.buttons[button.toggle] = button
      this.associateButtonsAndParams(button.toggle)
    },
    associateButtonsAndParams: function(name){
      if (this.params[name] && this.buttons[name]) {
        this.buttons[name].param = this.params[name]
        this.params[name].button = this.buttons[name]
      }
    },
    submit: function() {
      this.generateInputs()
      this.form.submit()
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