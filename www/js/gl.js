var gl = {};

gl.frames = 0;
gl.fps = 0;

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

gl.result = null;

gl.init = function (width, height, img) {

	var container, mesh;

	gl.encoder = new GIFEncoder();
	gl.encoder.setRepeat(0);
	gl.encoder.setDelay(1/gl.fps * 1000);
	gl.encoder.setSize(width,height);

	container = document.getElementById( 'container' );

	gl.camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1100 );
	gl.camera.target = new THREE.Vector3( 0, 0, 0 );

	gl.scene = new THREE.Scene();

	var geometry = new THREE.SphereGeometry( 500, 60, 40 );
	geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

	var material = new THREE.MeshBasicMaterial( {
		map: THREE.Texture(img)
	} );

	mesh = new THREE.Mesh( geometry, material );
	
	scene.add( mesh );

	gl.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
	gl.renderer.setPixelRatio( window.devicePixelRatio );
	gl.renderer.setSize( width, height );
	container.appendChild( gl.renderer.domElement );

	container.addEventListener( 'mousedown', gl.onDocumentMouseDown, false );
	container.addEventListener( 'mousemove', gl.onDocumentMouseMove, false );
	container.addEventListener( 'mouseup', gl.onDocumentMouseUp, false );
	container.addEventListener( 'mousewheel', gl.onDocumentMouseWheel, false );
	container.addEventListener( 'DOMMouseScroll', gl.onDocumentMouseWheel, false);

	container.addEventListener( 'dragover', function ( event ) {

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

	}, false );

	container.addEventListener( 'dragenter', function ( event ) {

		container.body.style.opacity = 0.5;

	}, false );

	container.addEventListener( 'dragleave', function ( event ) {

		container.body.style.opacity = 1;

	}, false );

	container.addEventListener( 'drop', function ( event ) {

		event.preventDefault();

		var reader = new FileReader();
		reader.addEventListener( 'load', function ( event ) {

			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;

		}, false );
		reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

		container.body.style.opacity = 1;

	}, false );

	container.addEventListener( 'dblclick', function () {
        
        if( !gl.isEncodeStarted ) {

            gl.encoder.start();
            gl.isEncodeStarted = true;

        }

    }

	window.addEventListener( 'resize', onWindowResize, false );
}

gl.onWindowResize = function () {

	gl.camera.aspect = width / height;
	gl.camera.updateProjectionMatrix();

	gl.renderer.setSize( width, height );

}

gl.onDocumentMouseDown = function ( event ) {

	event.preventDefault();

	gl.isUserInteracting = true;

	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;

	onPointerDownLon = gl.lon;
	onPointerDownLat = gl.lat;

}

go.onDocumentMouseMove = function( event ) {

	if ( gl.isUserInteracting === true ) {

		gl.lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		gl.lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

	}

}

gl.onDocumentMouseUp = function( event ) {

	gl.isUserInteracting = false;

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

	requestAnimationFrame( animate );
	gl.update();

    // Add frames
	if (gl.isEncodeStarted && gl.frames / gl.fps < 10) {                                                                                    
	    var readBuffer = new Uint8Array(width * height * 4);
	    var context = gl.renderer.getContext();
	    var canvas = gl.renderer.domElement;
	    context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, readBuffer);
	    
	    gl.encoder.addFrame(readBuffer, true);
        gl.frames++;
	}
	if (gl.frames / gl.fps == 10) {
	    gl.encoder.finish();
	    gl.result = encode64(gl.encoder.stream().getData());
	}
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
