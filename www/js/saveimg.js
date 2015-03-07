var saveimg = function(base64_str){
	var data = b64utils.decode(base64_str);
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {  
		fs.root.getFile("date.gif" , {create:true, exclusive:false}, 
			function(entry) {
				entry.createWriter( 
					function(writer) {

						var cb = function() {
							console.log("write end"); alert("Save OK");
						}

						writer.onwrite = cb;
						writer.onerror = function() { console.log("write error"); }
						writer.write( data );

					} ,
					function() {
						console.log("create write error");
					}
					);
			} ,
			function(){ }
			);
	}, function() { });
};