share = {}
share.shareimg = (str_base64, sharetext) ->
	str_base64 = 'data:image/png;base64,' + str_base64
	#window.plugins.socialsharing.share 'theta-gif', sharetext, str_base64, (->
	#	console.log 'successful'
	#	return
	#), ->
	#	console.log 'failed'
	#	return
	window.plugins.socialsharing.share null, 'theta-gif', sharetext, str_base64, null
	return
