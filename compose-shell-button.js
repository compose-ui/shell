var template = require('./templates/button.hbs')

xtag.register('compose-shell-button', {
  lifecycle: {
    created: function(){
      this.type = this.getAttribute('type')
      this.innerHTML = template({
        enabled: this.enabled,
        type: this.type,
        content: this.textContent
      })
      if (this.type !== 'submit')
        this.shell.registerButton(this)
    }
  },

  events: {
    'click:delegate(button)': function(event) {
      var button = event.currentTarget
      if (button.type === 'submit')
        return
      event.preventDefault()
      event.currentTarget.enabled = !event.currentTarget.enabled
      xtag.fireEvent(button, 'toggle')
    }
  },

  accessors: {
    enabled: {
      get: function(){ return !!this.getAttribute('enabled') },
      set: function(enabled){
        if (enabled === true)
          this.setAttribute('enabled', true)
        else if (enabled === false)
          this.removeAttribute('enabled')
      }
    },
    toggle: {
      get: function(){ return this.getAttribute('toggle') }
    }
  }
})