app =

	initialize: -> this.bindEvents()

	bindEvents: ->
		document.addEventListener 'deviceready', this.onDeviceReady, false

	onDeviceReady: ->
		app.receivedEvent 'deviceready'

	receivedEvent: (id) ->
		console.log 'Received Event: ' + id
		console.log 'my page'
		($ "#share").click (e) -> share.shareimg("R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D",
																						 "hoge")

window.onload = -> app.initialize()
