app =

  initialize: -> this.bindEvents()

  bindEvents: ->
    document.addEventListener 'deviceready', this.onDeviceReady, false

  onDeviceReady: ->
    app.receivedEvent 'deviceready'

  receivedEvent: (id) ->
    parentElement = document.getElementById(id)
    listeningElement = parentElement.querySelector('.listening')
    receivedElement = parentElement.querySelector('.received'

    listeningElement.setAttribute 'style', 'display:none'
    receivedElement.setAttribute 'style', 'display:block'
    
    console.log 'Received Event: ' + id
    console.log 'max benri'

window.onload = -> app.initialize()
