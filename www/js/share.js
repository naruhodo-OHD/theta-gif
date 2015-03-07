var share = {};
share.shareimg = function(str_base64, sharetext){
	str_base64 = "data:image/gif;base64," + str_base64; 
	window.plugins.socialsharing.share(null, "theta-gif", sharetext, str_base64, null);
};
