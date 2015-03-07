var gl = {};

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
             window.setTimeout(callback, 1000 / 60);
        };
})();

gl.frames = 0;
gl.fps = 15;
gl.timeLimit = 10;

gl.camera = null;
gl.scene = null;
gl.renderer = null;

gl.encoder = null;

gl.isUserInteracting = false;
gl.isEncodeStarted = false;

gl.onMouseDownMouseX = 0;
gl.onMouseDownMouseY = 0,
gl.lon = 0;
gl.onMouseDownLon = 0;
gl.lat = 0;
gl.onMouseDownLat = 0;
gl.phi = 0;
gl.theta = 0;

gl.width = 0;
gl.height = 0;

gl.result = null;

gl.init = function (width, height, img) {

	var container, mesh;

    gl.width = width;
    gl.height = height;

	gl.encoder = new GIFEncoder();
	gl.encoder.setRepeat(0);
	gl.encoder.setDelay(1/gl.fps * 1000);
	gl.encoder.setSize(gl.width,gl.height);

	container = document.getElementById( 'container' );

	gl.camera = new THREE.PerspectiveCamera( 75, gl.width / gl.height, 1, 1100 );
	gl.camera.target = new THREE.Vector3( 0, 0, 0 );

	gl.scene = new THREE.Scene();

	var geometry = new THREE.SphereGeometry( 500, 60, 40 );
	geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

    var texture = new THREE.Texture(img);
    texture.needsUpdate = true;

	var material = new THREE.MeshBasicMaterial( {
		map: texture,
        overdraw: true
	});

	mesh = new THREE.Mesh( geometry, material );
	
	gl.scene.add( mesh );

	gl.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
	gl.renderer.setPixelRatio( window.devicePixelRatio );
	gl.renderer.setSize( gl.width, gl.height );
	container.appendChild( gl.renderer.domElement );

    var hammertime = new Hammer(gl.renderer.domElement);
    hammertime.get('tap').set({taps: 2});

    hammertime.on('panstart', gl.onDocumentMouseDown);
    hammertime.on('panmove', gl.onDocumentMouseMove);
    hammertime.on('panend', gl.onDocumentMouseUp);
    hammertime.on('tap', function () {
        
        if( !gl.isEncodeStarted ) {

            console.log("encoding started!");

            gl.encoder.start();
            gl.isEncodeStarted = true;

        }

    });

	gl.renderer.domElement.addEventListener( 'mousewheel', gl.onDocumentMouseWheel, false );
	gl.renderer.domElement.addEventListener( 'DOMMouseScroll', gl.onDocumentMouseWheel, false);

	gl.renderer.domElement.addEventListener( 'dragover', function ( event ) {

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

	}, false );

	gl.renderer.domElement.addEventListener( 'dragenter', function ( event ) {

		container.body.style.opacity = 0.5;

	}, false );

	gl.renderer.domElement.addEventListener( 'dragleave', function ( event ) {

		container.body.style.opacity = 1;

	}, false );

	gl.renderer.domElement.addEventListener( 'drop', function ( event ) {

		event.preventDefault();

		var reader = new FileReader();
		reader.addEventListener( 'load', function ( event ) {

			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;

		}, false );
		reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

		container.body.style.opacity = 1;

	}, false );

	window.addEventListener( 'resize', gl.onWindowResize, false );
}

gl.onWindowResize = function () {

	gl.camera.aspect = gl.width / gl.height;
	gl.camera.updateProjectionMatrix();

	gl.renderer.setSize( gl.width, gl.height );

}

gl.onDocumentMouseDown = function ( ) {

	gl.isUserInteracting = true;

	onPointerDownLon = gl.lon;
	onPointerDownLat = gl.lat;

}

gl.onDocumentMouseMove = function(touch) {

    event.preventDefault();

	if ( gl.isUserInteracting === true ) {

		gl.lon = -touch.deltaX * 0.5 + onPointerDownLon;
		gl.lat = touch.deltaY * 0.5 + onPointerDownLat;

	}

}

gl.onDocumentMouseUp = function( ) {

	gl.isUserInteractsng = false;

}

gl.onDocumentMouseWheel = function( event ) {

	// WebKit

	if ( event.wheelDeltaY ) {

		gl.camera.fov -= event.wheelDeltaY * 0.05;

	// Opera / Explorer 9

	} else if ( event.wheelDelta ) {

		gl.camera.fov -= event.wheelDelta * 0.05;

	// Firefox

	} else if ( event.detail ) {

		gl.camera.fov += event.detail * 1.0;

	}

	gl.camera.updateProjectionMatrix();

}

gl.animate = function () {

	gl.update();

    // Add frames
	if (gl.isEncodeStarted && ((gl.frames / gl.fps) < gl.timeLimit)) {

        var readBuffer = new Uint8Array(gl.width * gl.height * 4);
        var context = gl.renderer.getContext();
        var canvas = gl.renderer.domElement;
        context.readPixels(0, 0, gl.width, gl.height, context.RGBA, context.UNSIGNED_BYTE, readBuffer);
        		  
        gl.encoder.addFrame(readBuffer, true);

        gl.frames++;
	}
	if (gl.frames / gl.fps == gl.timeLimit) {
	    gl.encoder.finish();
	    gl.result = encode64(gl.encoder.stream().getData());
        console.log('finished encoding!');
        console.log(gl.result);
        share.shareimg(gl.result, null);

        var im = new Image();
        im.src = "data:image/gif;base64," + gl.result;

        $('#container').append(im);

        return true;
	}
	window.requestAnimationFrame( gl.animate );
}

gl.update = function() {

	if ( gl.isUserInteracting === false ) {

		gl.lon += 0.1;

	}

	gl.lat = Math.max( - 85, Math.min( 85, gl.lat ) );
	gl.phi = THREE.Math.degToRad( 90 - gl.lat );
	gl.theta = THREE.Math.degToRad( gl.lon );

	gl.camera.target.x = 500 * Math.sin( gl.phi ) * Math.cos( gl.theta );
	gl.camera.target.y = 500 * Math.cos( gl.phi );
	gl.camera.target.z = 500 * Math.sin( gl.phi ) * Math.sin( gl.theta );

	gl.camera.lookAt( gl.camera.target );

	gl.renderer.render( gl.scene, gl.camera );

}
