var share = {};
share.shareimg = function(str_base64, sharetext){
	str_base64 = "data:image/png;base64," + str_base64; 
	window.plugins.socialsharing.share("#openhackday", sharetext, str_base64, null);
};