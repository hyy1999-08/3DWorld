//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda AND
// Chapter 2: ColoredPoints.js (c) 2012 matsuda
//
// merged and modified to became:
//
// ControlMulti.js for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

//		--converted from 2D to 4D (x,y,z,w) vertices
//		--demonstrate how to keep & use MULTIPLE colored shapes 
//			in just one Vertex Buffer Object(VBO).
//		--demonstrate several different user I/O methods: 
//				--Webpage pushbuttons 
//				--Webpage edit-box text, and 'innerHTML' for text display
//				--Mouse click & drag within our WebGL-hosting 'canvas'
//				--Keyboard input: alphanumeric + 'special' keys (arrows, etc)
//
// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
// =========================
// Use globals to avoid needlessly complex & tiresome function argument lists,
// and for user-adjustable controls.
// For example, the WebGL rendering context 'gl' gets used in almost every fcn;
// requiring 'gl' as an argument won't give us any added 'encapsulation'; make
// it global.  Later, if the # of global vars grows too large, we can put them 
// into one (or just a few) sensible global objects for better modularity.
//------------For WebGL-----------------------------------------------
var gl;           // webGL Rendering Context. Set in main(), used everywhere.
var g_canvas = document.getElementById('webgl');     




                  // our HTML-5 canvas object that uses 'gl' for drawing.
                  
// ----------For tetrahedron & its matrix---------------------------------
var g_vertsMax = 0;                 // number of vertices held in the VBO 
                                    // (global: replaces local 'n' variable)
var g_modelMatrix = new Matrix4();  // Construct 4x4 matrix; contents get sent
                                    // to the GPU/Shaders as a 'uniform' var.
var g_modelMatLoc;                  // that uniform's location in the GPU



//------------For Animation---------------------------------------------
var g_isRun = true;                 // run/stop for animation; used in tick().
var g_lastMS = Date.now();    			// Timestamp for most-recently-drawn image; 
                                    // in milliseconds; used by 'animate()' fcn 
                                    // (now called 'timerAll()' ) to find time
                                    // elapsed since last on-screen image.
var g_angle01 = 0;                  // initial rotation angle
var g_angle01Rate = 45.0;           // rotation speed, in degrees/second 

var g_angle02 = 0;                  // initial rotation angle
var g_angle02Rate = 40.0;           // rotation speed, in degrees/second 

var g_angle03 = 0;                  // initial rotation angle
var g_angle03Rate = 40.0;           // rotation speed, in degrees/second 

var g_angle04 = 0;                  // initial rotation angle
var g_angle04Rate = 22.5;           // rotation speed, in degrees/second 

var g_angle05 = 0;                  // initial rotation angle
var g_angle05Rate = 15;           // rotation speed, in degrees/second 

var g_angle06 = 0;                  // initial rotation angle
var g_angle06Rate = 10;           // rotation speed, in degrees/second 


var g_angle07 = 0;                  // initial rotation angle
var g_angle07Rate = 10;           // rotation speed, in degrees/second 

var g_angle08 = 0;                  // initial rotation angle
var g_angle08Rate = 45;           // rotation speed, in degrees/second 
//------------For mouse click-and-drag: -------------------------------
var g_isDrag=false;		// mouse-drag: true when user holds down mouse button
var g_xMclik=0.0;			// last mouse button-down position (in CVV coords)
var g_yMclik=0.0;   
var g_xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var g_yMdragTot=0.0; 
var g_digits=5;			// DIAGNOSTICS: # of digits to print in console.log (
									//    console.log('xVal:', xVal.toFixed(g_digits)); // print 5 digits	




//------------For quarternion -------------------------------
var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)

var quatMatrix = new Matrix4();	// rotation matrix, made from latest qTot

//------------For camera------------------------------
// g_modelMatrix.lookAt(-4,-4, 4, 0, 0, 0, 0,0 ,1);
var eyex=-3.5;
var eyey=-3.5;
var eyez=3.5;
var aimx;
var aimy;
var aimz;
var angle=2*Math.PI/360*30;
var tilt=-0.6;			
									
//------------For keyboard -------------------------------

var moveFWD=false;
var movepacex=0.0;
var movepacey=0.0;
var movepacez=0.0;
var movepacey=0.0;


//------------For movetmp -------------------------------

var myTmp_1=0.0;
var myTmp_3=0.0;
var myTmp_4=0.0;
var myTmp_5=0.0;
var myTmp_6=0.0;

var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex

function main() {
//==============================================================================
/*REPLACED THIS: 
// Retrieve <canvas> element:
 var canvas = document.getElementById('webgl'); 
//with global variable 'g_canvas' declared & set above.
*/
  
  // Get gl, the rendering context for WebGL, from our 'g_canvas' object
  gl = getWebGLContext(g_canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Initialize a Vertex Buffer in the graphics system to hold our vertices
  g_maxVerts = initVertexBuffer(gl);  
  if (g_maxVerts < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

	// Register the Keyboard & Mouse Event-handlers------------------------------
	// When users move, click or drag the mouse and when they press a key on the 
	// keyboard the operating system create a simple text-based 'event' message.
	// Your Javascript program can respond to 'events' if you:
	// a) tell JavaScript to 'listen' for each event that should trigger an
	//   action within your program: call the 'addEventListener()' function, and 
	// b) write your own 'event-handler' function for each of the user-triggered 
	//    actions; Javascript's 'event-listener' will call your 'event-handler'
	//		function each time it 'hears' the triggering event from users.
	//
  // KEYBOARD:
  // The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
  //      including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc. 
	window.addEventListener("keydown", myKeyDown, false);
	// After each 'keydown' event, call the 'myKeyDown()' function.  The 'false' 
	// arg (default) ensures myKeyDown() call in 'bubbling', not 'capture' stage)
	// ( https://www.w3schools.com/jsref/met_document_addeventlistener.asp )
	window.addEventListener("keyup", myKeyUp, false);
	// Called when user RELEASES the key.  Now rarely used...

	// MOUSE:
	// Create 'event listeners' for a few vital mouse events 
	// (others events are available too... google it!).  
	window.addEventListener("mousedown", myMouseDown); 
	// (After each 'mousedown' event, browser calls the myMouseDown() fcn.)
  window.addEventListener("mousemove", myMouseMove); 
	window.addEventListener("mouseup", myMouseUp);	
	window.addEventListener("click", myMouseClick);				
	window.addEventListener("dblclick", myMouseDblClick); 
	// Note that these 'event listeners' will respond to mouse click/drag 
	// ANYWHERE, as long as you begin in the browser window 'client area'.  
	// You can also make 'event listeners' that respond ONLY within an HTML-5 
	// element or division. For example, to 'listen' for 'mouse click' only
	// within the HTML-5 canvas where we draw our WebGL results, try:
	// g_canvasID.addEventListener("click", myCanvasClick);
  //
	// Wait wait wait -- these 'mouse listeners' just NAME the function called 
	// when the event occurs!   How do the functions get data about the event?
	//  ANSWER1:----- Look it up:
	//    All mouse-event handlers receive one unified 'mouse event' object:
	//	  https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
	//  ANSWER2:----- Investigate:
	// 		All Javascript functions have a built-in local variable/object named 
	//    'argument'.  It holds an array of all values (if any) found in within
	//	   the parintheses used in the function call.
  //     DETAILS:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
	// END Keyboard & Mouse Event-Handlers---------------------------------------
	
  // Specify the color for clearing <canvas>
  gl.clearColor(0.3, 0.3, 0.3, 1.0);

	// // NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// // unless the new Z value is closer to the eye than the old one..
	// gl.depthFunc(gl.LESS);
	// gl.enable(gl.DEPTH_TEST); 	  
	
  // Get handle to graphics system's storage location of u_ModelMatrix
  g_modelMatLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!g_modelMatLoc) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
/* REPLACED by global var 'g_ModelMatrix' (declared, constructed at top)
  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
*/
/* REPLACED by global g_angle01 variable (declared at top)
  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
*/
drawResize();  
  // ANIMATION: create 'tick' variable whose value is this function:
  //----------------- 
  var tick = function() {
    animate();   // Update the rotation angle
    drawAll();   // Draw all parts
//    console.log('g_angle01=',g_angle01.toFixed(g_digits)); // put text in console.

//	Show some always-changing text in the webpage :  
//		--find the HTML element called 'CurAngleDisplay' in our HTML page,
//			 	(a <div> element placed just after our WebGL 'canvas' element)
// 				and replace it's internal HTML commands (if any) with some
//				on-screen text that reports our current angle value:
//		--HINT: don't confuse 'getElementByID() and 'getElementById()
		document.getElementById('CurAngleDisplayForMiniModel').innerHTML= 
			'g_angle01= '+g_angle01.toFixed(g_digits)+'<br>';
		// document.getElementById('CurAngleDisplay').innerHTML=
		// 'leftEar_Rate='+g_angle03Rate.toFixed(g_digits)+'<br>'
		// +'rightEar_Rate='+g_angle05Rate.toFixed(g_digits);
		// Also display our current mouse-dragging state:
		// document.getElementById('Mouse').innerHTML=
		// 	'Mouse Drag totals (CVV coords):\t'+
		// 	g_xMdragTot.toFixed(5)+', \t'+g_yMdragTot.toFixed(g_digits);	
		//--------------------------------
    requestAnimationFrame(tick, g_canvas);   
    									// Request that the browser re-draw the webpage
    									// (causes webpage to endlessly re-draw itself)
  };
  tick();							// start (and continue) animation: draw current image
	
}

function initVertexBuffer() {
//==============================================================================
// NOTE!  'gl' is now a global variable -- no longer needed as fcn argument!

	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);
						 
  makePikachu();
  makeGroundGrid();
  makeAxes();
  makeSphere();	
  makeCircle();
  makeCircle2();
  makeTet();
  makeCube();
  

  var mySiz = (pikachu.length + gndVerts.length+ myaxes.length+sphVerts.length+my_circle.length+my_circle2.length+my_tetrahedron.length+my_cube.length);					
  // How many vertices total?
  var nn = mySiz / floatsPerVertex;
  console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
  var colorShapes = new Float32Array(mySiz);
  //store pikachu
  for(i=0,j=0; j< pikachu.length; i++,j++) {
	colorShapes[i] = pikachu[j];
  }
  //store ground
  gndStart = i;						// next we'll store the ground-plane;
  for(j=0; j< gndVerts.length; i++,j++) {
	colorShapes[i] = gndVerts[j];
  }
  axeStart = i;
  for(j=0; j< myaxes.length; i++,j++) {
	colorShapes[i] = myaxes[j];
  }
  sphStart = i;
  for(j=0; j< sphVerts.length; i++,j++) {
	colorShapes[i] = sphVerts[j];
  }
  cirStart = i;
  for(j=0; j< my_circle.length; i++,j++) {
	colorShapes[i] = my_circle[j];
  }
  cirStart2 = i;
  for(j=0; j< my_circle2.length; i++,j++) {
	colorShapes[i] = my_circle2[j];
  }
  tetStart=i;
  for(j=0; j< my_tetrahedron.length; i++,j++) {
	colorShapes[i] = my_tetrahedron[j];
  }
  cubStart=i;
  for(j=0; j< my_cube.length; i++,j++) {
	colorShapes[i] = my_cube[j];
  }

  // Create a buffer object
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?
    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Use handle to specify how to retrieve position data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * floatsPerVertex, 		// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  		0);						// Offset -- now many bytes from START of buffer to the
  									// value we will actually use?
  gl.enableVertexAttribArray(a_Position);  
  									// Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(
  	a_Color, 				// choose Vertex Shader attribute to fill with data
  	3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
  	gl.FLOAT, 			// data type for each value: usually gl.FLOAT
  	false, 					// did we supply fixed-point data AND it needs normalizing?
  	FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  	FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w
  									
  gl.enableVertexAttribArray(a_Color);  
  									// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

/* REMOVED -- global 'g_vertsMax' means we don't need it anymore
  return nn;
*/
}

function drawAll() {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
// Great question from student:
// "?How can I get the screen-clearing color (or any of the many other state
//		variables of OpenGL)?  'glGet()' doesn't seem to work..."
// ANSWER: from WebGL specification page: 
//							https://www.khronos.org/registry/webgl/specs/1.0/
//	search for 'glGet()' (ctrl-f) yields:
//  OpenGL's 'glGet()' becomes WebGL's 'getParameter()'

	clrColr = new Float32Array(4);
	clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
	// console.log("clear value:", clrColr);

// //method 1 to make z reverse
 gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.
// gl.clearDepth(0.0); // each time we 'clear' our depth buffer, set all
//     // pixel depths to 0.0 (1.0 is DEFAULT)
// gl.depthFunc(gl.GREATER); // (gl.LESS is DEFAULT; reverse it!)

gl.viewport(0, 1*g_canvas.height/3, g_canvas.width/2, g_canvas.height/2);
//set identity
g_modelMatrix.setIdentity();  
//setperspective
perspective();

aimx=eyex+Math.cos(angle);
aimy=eyey+Math.sin(angle);
aimz=eyez+tilt;	

// console.log(aimx);
//set camera
//control camera
g_modelMatrix.lookAt(eyex,eyey,eyez,aimx,aimy,aimz,0,0,1);

pushMatrix(g_modelMatrix);     // SAVE world coord system;


Drawaxes();
//draw pikachu 
pushMatrix(g_modelMatrix);
g_modelMatrix.translate(0.0,0,0.01);
g_modelMatrix.translate(1.0,0,0.0);
g_modelMatrix.rotate(90,1,0,0);
//control world coordinate
// g_modelMatrix.translate(movepace,0,0);
// g_modelMatrix.translate(0,0,movepaceud);
g_modelMatrix.translate(0.25,0.25,0.25);
//model's middle is in(1.25,-0.25,1.26)



g_modelMatrix.rotate(-90,0,1,0);
g_modelMatrix.rotate(angle*180/Math.PI,0,1,0);


quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
g_modelMatrix.concat(quatMatrix);	// apply that matrix.
g_modelMatrix.rotate(-angle*180/Math.PI,0,1,0);
Drawaxes();
g_modelMatrix.rotate(90,0,1,0);

g_modelMatrix.translate(-0.25,-0.25,-0.25);

Drawpikachu();
g_modelMatrix=popMatrix();

//draw pikachu 
pushMatrix(g_modelMatrix);
g_modelMatrix.translate(0.0,0,0.01);
g_modelMatrix.translate(0,-2,0);
g_modelMatrix.rotate(90,1,0,0);
g_modelMatrix.rotate(180,0,1,0);

Drawpikachu();
g_modelMatrix=popMatrix();

//draw pikachu 
pushMatrix(g_modelMatrix);
g_modelMatrix.translate(0.0,0,0.01);
g_modelMatrix.translate(2,2,0);
g_modelMatrix.rotate(-g_angle01,0,0,1);
g_modelMatrix.rotate(90,1,0,0);
g_modelMatrix.rotate(90,0,1,0);
g_modelMatrix.translate(1,0,0);
Drawpikachu();
g_modelMatrix=popMatrix();
//drawpokeball
pushMatrix(g_modelMatrix);

g_modelMatrix.rotate(90,0,0,1);
g_modelMatrix.translate(1.5,1.5,0);
g_modelMatrix.translate(0,0,0.3);
g_modelMatrix.rotate(180,0,1,0);


g_modelMatrix.rotate(-90,1,0,0);


// g_modelMatrix.rotate(angle*180/Math.PI,0,1,0);
// quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
// g_modelMatrix.concat(quatMatrix);	// apply that matrix.
// Drawaxes();

// g_modelMatrix.rotate(-angle*180/Math.PI,0,1,0);
// g_modelMatrix.rotate(90,1,0,0);
Drawaxes();
g_modelMatrix.rotate(90,1,0,0);
Drawpokeball();
g_modelMatrix=popMatrix();

//drawhourgalss
pushMatrix(g_modelMatrix);

g_modelMatrix.rotate(90,0,0,1);
g_modelMatrix.translate(0,1.5,0);
g_modelMatrix.translate(0,0,0.5);
g_modelMatrix.rotate(180,0,1,0);
Drawhourglass();
g_modelMatrix=popMatrix();


//drawhouse
pushMatrix(g_modelMatrix);
g_modelMatrix.translate(2.5,-1.5,0);
g_modelMatrix.scale(3,3,2);
g_modelMatrix.rotate(90,0,0,1);

g_modelMatrix.translate(0,0,0);
g_modelMatrix.rotate(180,0,1,0);
Drawhouse();
g_modelMatrix.translate(0.25,0.23,-0.8);
g_modelMatrix.scale(3/4,3/4,3/4);
Drawpokeball();
g_modelMatrix=popMatrix();


//draw ground 
Drawground();

// view_II---------------------------------



gl.viewport(g_canvas.width/2,1*g_canvas.height/3, g_canvas.width/2, g_canvas.height/2);

g_modelMatrix.setIdentity();  
//set ortho(left, right, bottom, top, near, far)
//ortho   -z = (far-near)/3 ;(100-1)/3=33;
//
var changefromangle=35*Math.PI/360;
var ortho_Top=1*Math.tan(changefromangle)*(30-1)/3;
var ortho_Bottom=-ortho_Top;
var ortho_Right=ortho_Top*(g_canvas.width/g_canvas.height);
var ortho_Left=-ortho_Right;
 g_modelMatrix.setOrtho(ortho_Left,ortho_Right,ortho_Bottom,ortho_Top,1,30.0);
//g_modelMatrix.setOrtho(-4.5,4.5, -2,2,1, 100.0);
//set camera

//g_modelMatrix.lookAt(-3.5,-3.5, 3.5, -3.5+Math.cos(30*2*Math.PI/360), -3.5+Math.sin(30*2*Math.PI/360), 3.5-0.6, 0,0 ,1);
g_modelMatrix.lookAt(eyex,eyey,eyez,aimx,aimy,aimz,0,0,1);
Drawaxes();


pushMatrix(g_modelMatrix);     // SAVE world coord system;
// g_modelMatrix.scale(1,1,-1);//method 2 to make z reverse
// var dist = Math.sqrt(g_xMdragTot*g_xMdragTot + g_yMdragTot*g_yMdragTot);
// g_modelMatrix.rotate(dist*120.0, -g_yMdragTot+0.0001, g_xMdragTot+0.0001, 0.0);


//draw pikachu 
pushMatrix(g_modelMatrix);

g_modelMatrix.translate(0.0,0,0.01);
g_modelMatrix.translate(1.0,0,0.0);
g_modelMatrix.rotate(90,1,0,0);
//control world coordinate
// g_modelMatrix.translate(movepace,0,0);
// g_modelMatrix.translate(0,0,movepaceud);
g_modelMatrix.translate(0.25,0.25,0.25);
// //model's middle is in(1.25,-0.25,1.26)
// g_modelMatrix.rotate(-90,0,1,0);
// Drawaxes();
// g_modelMatrix.rotate(90,0,1,0);
// g_modelMatrix.translate(-0.25,-0.25,-0.25);
// Drawpikachu();

g_modelMatrix.rotate(-90,0,1,0);
g_modelMatrix.rotate(angle*180/Math.PI,0,1,0);


quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
g_modelMatrix.concat(quatMatrix);	// apply that matrix.
g_modelMatrix.rotate(-angle*180/Math.PI,0,1,0);
Drawaxes();
g_modelMatrix.rotate(90,0,1,0);

g_modelMatrix.translate(-0.25,-0.25,-0.25);

Drawpikachu();
g_modelMatrix=popMatrix();




//draw pikachu 
pushMatrix(g_modelMatrix);
g_modelMatrix.translate(0.0,0,0.01);
g_modelMatrix.translate(0,-2,0);
g_modelMatrix.rotate(90,1,0,0);
g_modelMatrix.rotate(180,0,1,0);

Drawpikachu();
g_modelMatrix=popMatrix();

//draw pikachu 
pushMatrix(g_modelMatrix);
g_modelMatrix.translate(0.0,0,0.01);
g_modelMatrix.translate(2,2,0);
g_modelMatrix.rotate(-g_angle01,0,0,1);
g_modelMatrix.rotate(90,1,0,0);
g_modelMatrix.rotate(90,0,1,0);
g_modelMatrix.translate(1,0,0);

Drawpikachu();
g_modelMatrix=popMatrix();

//drawpokeball
pushMatrix(g_modelMatrix);

g_modelMatrix.rotate(90,0,0,1);
g_modelMatrix.translate(1.5,1.5,0.3);
g_modelMatrix.rotate(180,0,1,0);
g_modelMatrix.rotate(-90,1,0,0);


// g_modelMatrix.rotate(angle*180/Math.PI,0,1,0);
// quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
// g_modelMatrix.concat(quatMatrix);	// apply that matrix.
// Drawaxes();

// g_modelMatrix.rotate(-angle*180/Math.PI,0,1,0);
// g_modelMatrix.rotate(90,1,0,0);
Drawaxes();
g_modelMatrix.rotate(90,1,0,0);
Drawpokeball();
g_modelMatrix=popMatrix();

//drawhourglass
pushMatrix(g_modelMatrix);

g_modelMatrix.rotate(90,0,0,1);
g_modelMatrix.translate(0,1.5,0);
g_modelMatrix.translate(0,0,0.5);
g_modelMatrix.rotate(180,0,1,0);
Drawhourglass();
g_modelMatrix=popMatrix();
//draw
pushMatrix(g_modelMatrix);
g_modelMatrix.translate(2.5,-1.5,0);
g_modelMatrix.scale(3,3,2);
g_modelMatrix.rotate(90,0,0,1);

g_modelMatrix.translate(0,0,0);
g_modelMatrix.rotate(180,0,1,0);
Drawhouse();
g_modelMatrix.translate(0.25,0.23,-0.8);
g_modelMatrix.scale(3/4,3/4,3/4);

Drawpokeball();
g_modelMatrix=popMatrix();

//draw ground 
Drawground();

// Drawminimodel();



}
function drawResize() {
	//==============================================================================
	// Called when user re-sizes their browser window , because our HTML file
	// contains:  <body onload="main()" onresize="winResize()">
	
		//Report our current browser-window contents:
	
		console.log('g_Canvas width,height=', g_canvas.width, g_canvas.height);		
	 console.log('Browser window: innerWidth,innerHeight=', 
																	innerWidth, innerHeight);	
																	// http://www.w3schools.com/jsref/obj_window.asp
	
		
		//Make canvas fill the top 3/4 of our browser window:
		var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
		g_canvas.width = innerWidth - xtraMargin;
		g_canvas.height = (innerHeight*3/4) - xtraMargin;
		// IMPORTANT!  Need a fresh drawing in the re-sized viewports.
		drawAll();				// draw in all viewports.
	}

function perspective(){
	 var vpAspect = g_canvas.width/2 /			// On-screen aspect ratio for
	 (g_canvas.height/2);	// this camera: width/height.
	// g_modelMatrix.setPerspective(40, vpAspect, 1, 1000);	// near, far (always >0).
	g_modelMatrix.setPerspective(35,vpAspect, 1, 30.0);
}




// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate() {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
// Update the current rotation angle (adjusted by the elapsed time)
//  limit the angle to move smoothly between +120 and -85 degrees:
//  if(angle >  120.0 && g_angle01Rate > 0) g_angle01Rate = -g_angle01Rate;
//  if(angle <  -85.0 && g_angle01Rate < 0) g_angle01Rate = -g_angle01Rate;
  //from right to left
  g_angle01 = g_angle01 + (g_angle01Rate * elapsed) / 1000.0;
  if(g_angle01 > 180.0) g_angle01 = g_angle01 - 360.0;
  if(g_angle01 <-180.0) g_angle01 = g_angle01 + 360.0;

	g_angle02 = g_angle02 + (g_angle02Rate * elapsed) / 1000.0;
  if(g_angle02 > 180.0) g_angle02 = g_angle02 - 360.0;
  if(g_angle02 <-180.0) g_angle02 = g_angle02 + 360.0;
  
  if(g_angle02 > 45.0 && g_angle02Rate > 0) g_angle02Rate *= -1.0;
  if(g_angle02 < 0.0  && g_angle02Rate < 0) g_angle02Rate *= -1.0;



  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +55 and -25 degrees:
  if(g_angle03>   55.0 && g_angle03Rate > 0)g_angle03Rate= -g_angle03Rate;
  if(g_angle03 <  -25.0 && g_angle03Rate < 0) g_angle03Rate= -g_angle03Rate;

  g_angle03= [g_angle03 + (g_angle03Rate * elapsed) / 1000.0]%360;

  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +25 and -20 degrees:
  if(g_angle04>   25.0 && g_angle04Rate > 0)g_angle04Rate= -g_angle04Rate;
  if(g_angle04 <  -20.0 && g_angle04Rate < 0) g_angle04Rate= -g_angle04Rate;
  g_angle04= [g_angle04 + (g_angle04Rate * elapsed) / 1000.0]%360;

  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +15and -15 degrees:
  if(g_angle05>   15.0&& g_angle05Rate > 0)g_angle05Rate= -g_angle05Rate;
  if(g_angle05 <  -15.0 && g_angle05Rate < 0) g_angle05Rate= -g_angle05Rate;
  g_angle05= [g_angle05 + (g_angle05Rate * elapsed) / 1000.0]%360;


    //  limit the angle to move smoothly between 0 and -20 degrees:
  if(g_angle06>   0.0 && g_angle06Rate > 0)g_angle06Rate= -g_angle06Rate;
    if(g_angle06 <  -20.0 && g_angle06Rate < 0) g_angle06Rate= -g_angle06Rate;
 		g_angle06= [g_angle06 + (g_angle06Rate * elapsed) / 1000.0]%360;

   //  limit the angle to move smoothly between 0 and -20 degrees:
   if(g_angle07>   0.0 && g_angle07Rate > 0)g_angle07Rate= -g_angle07Rate;
   if(g_angle07 <  -20.0 && g_angle07Rate < 0) g_angle07Rate= -g_angle07Rate;
		g_angle07= [g_angle07 + (g_angle07Rate * elapsed) / 1000.0]%360;


		g_angle08 = g_angle08 + (g_angle08Rate * elapsed) / 1000.0;
		if(g_angle08 > 180.0) g_angle08 = g_angle08 - 360.0;
		if(g_angle08 <-180.0) g_angle08 = g_angle08 + 360.0;

}

//==================HTML Button Callbacks======================

function angleSubmit() {
// Called when user presses 'Submit' button on our webpage
//		HOW? Look in HTML file (e.g. ControlMulti.html) to find
//	the HTML 'input' element with id='usrAngle'.  Within that
//	element you'll find a 'button' element that calls this fcn.

// Read HTML edit-box contents:
	var UsrTxt = document.getElementById('usrAngle').value;	
// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='editBoxOut':
  document.getElementById('EditBoxOut').innerHTML ='You Typed: '+UsrTxt;
  console.log('angleSubmit: UsrTxt:', UsrTxt); // print in console, and
  g_angle01 = parseFloat(UsrTxt);     // convert string to float number 
};

function clearDrag() {
// Called when user presses 'Clear' button in our webpage
	g_xMdragTot = 0.0;
	g_yMdragTot = 0.0;
}

function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.


  //for g_angle03Rate
	if(g_angle03Rate<0){
		g_angle03Rate-=20;		
	}else{
		g_angle03Rate+=20;
	};

	//for g_angle04Rate
	 if(g_angle04Rate<0){
		g_angle04Rate-=11.25;
	}else{
		g_angle04Rate+=11.25;
	}
  //for g_angle05Rate
  if(g_angle05Rate<0){
		g_angle05Rate-=7.5;
	}else{
		g_angle05Rate+=7.5;
	}
    //for g_angle06Rate
	if(g_angle06Rate<0){
		g_angle06Rate-=5;
	}else{
		g_angle06Rate+=5;
	}
}
//For minimodel
function spinUpForMiniModel(){
	g_angle01Rate += 25; 
}
function spinDown() {
// Called when user presses the 'Spin <<' button


	//for g_angle03Rate
	if(g_angle03Rate<0){
		g_angle03Rate+=20;		
	}else if(g_angle03Rate>0){
		g_angle03Rate-=20;
	}

	//for g_angle04Rate
	if(g_angle04Rate<0){
		g_angle04Rate+=11.25;
	}else if(g_angle04Rate>0){
		g_angle04Rate-=11.25;
	}
	//for g_angle05Rate
	if(g_angle05Rate<0){
		g_angle05Rate+=7.5;
	}else if(g_angle05Rate>0){
		g_angle05Rate-=7.5;
	}
	//for g_angle06Rate
	if(g_angle06Rate<0){
		g_angle06Rate+=5;
	}else if(g_angle06Rate>0){
		g_angle06Rate-=5;
	}

}
function spinDownForMiniModel(){
	g_angle01Rate -= 25; 
}

function runStop() {
// Called when user presses the 'Run/Stop' button

	//if g_angle03Rate^2>1, so it is not zero
	if(g_angle03Rate*g_angle03Rate>1){
		myTmp_3 = g_angle03Rate;  // store the current rate,
		g_angle03Rate=0;	
	}else{
		//when it is zero
		g_angle03Rate=myTmp_3;
	}
	//if g_angle04Rate^2>1, so it is not zero
	if(g_angle04Rate*g_angle04Rate>1){
		myTmp_4 = g_angle04Rate;  // store the current rate,
		g_angle04Rate=0;
	}else{
		//when it is zero
		g_angle04Rate=myTmp_4;
	}


	//if g_angle05Rate^2>1, so it is not zero
	if(g_angle05Rate*g_angle05Rate>1){
		myTmp_5 = g_angle05Rate;  // store the current rate,
		g_angle05Rate=0;
	}else{
		//when it is zero
		g_angle05Rate=myTmp_5;
	}

	//if g_angle06Rate^2>1, so it is not zero
	if(g_angle06Rate*g_angle06Rate>1){
		myTmp_6 = g_angle06Rate;  // store the current rate,
		g_angle06Rate=0;
	}else{
		//when it is zero
		g_angle06Rate=myTmp_6;
	}

		// //if g_angle05Rate^2>1, so it is not zero
		// if(g_angle07Rate*g_angle07Rate>1){
		// 	myTmp_7 = g_angle07Rate;  // store the current rate,
		// 	g_angle07Rate=0;
		// }else{
		// 	//when it is zero
		// 	g_angle07Rate=myTmp_7;
		// }

	//if any one of them is decresed to 0 becasue of spin, when use stop, they all get to zero;
	if(g_angle03Rate*g_angle04Rate*g_angle05Rate*g_angle06Rate==0){
		g_angle03Rate = 0;
		g_angle04Rate = 0;
		g_angle05Rate = 0;
		g_angle06Rate = 0;
	}

}
function runStopForMiniModel(){

	if(g_angle01Rate*g_angle01Rate > 1) {  // if nonzero rate,
		myTmp_1 = g_angle01Rate;  // store the current rate,
		g_angle01Rate = 0;      // and set to zero.
	}
	else{    
		// but if rate is zero,
		g_angle01Rate = myTmp_1;  // use the stored rate.

	}


}

//===================Mouse and Keyboard event-handling Callbacks

function myMouseDown(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	g_isDrag = true;											// set our mouse-dragging flag
	g_xMclik = x;													// record where mouse-dragging began
	g_yMclik = y;
	// report on webpage
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Pikachu waited until u drag  '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);
};


function myMouseMove(ev) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(g_isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);		// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//									-1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	g_xMdragTot += (x - g_xMclik);			// Accumulate change-in-mouse-position,&
	g_yMdragTot += (y - g_yMclik);

	// AND use any mouse-dragging we found to update quaternions qNew and qTot.
	dragQuat(x - g_xMclik, y - g_yMclik);

	// // Report new mouse position & how far we moved on webpage:
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Pikachu is wandering around. Your location is '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);

	g_xMclik = x;											// Make next drag-measurement from here.
	g_yMclik = y;
};

function myMouseUp(ev) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords):\n\t xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):\n\t x, y=\t',x,',\t',y);
	
	g_isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	g_xMdragTot += (x - g_xMclik);
	g_yMdragTot += (y - g_yMclik);

	// AND use any mouse-dragging we found to update quaternions qNew and qTot;
	dragQuat(x - g_xMclik, y - g_yMclik);
	// Report new mouse position:
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Pika Pika? Your location is '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);
	console.log('myMouseUp: g_xMdragTot,g_yMdragTot =',
		g_xMdragTot.toFixed(g_digits),',\t',g_yMdragTot.toFixed(g_digits));
};

function myMouseClick(ev) {
//=============================================================================
// Called when user completes a mouse-button single-click event 
// (e.g. mouse-button pressed down, then released)
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouseClick() on button: ", ev.button); 
}	

function myMouseDblClick(ev) {
//=============================================================================
// Called when user completes a mouse-button double-click event 
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouse-DOUBLE-Click() on button: ", ev.button); 
}	

function myKeyDown(kev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard;
//
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of a mess of JavaScript keyboard event handling,
// see:    http://javascript.info/tutorial/keyboard-events
//
// NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
//        'keydown' event deprecated several read-only properties I used
//        previously, including kev.charCode, kev.keyCode. 
//        Revised 2/2019:  use kev.key and kev.code instead.
//
// Report EVERYTHING in console:
  console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
              "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
              "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);

// and report EVERYTHING on webpage:
	// document.getElementById('KeyDownResult').innerHTML = ''; // clear old results
 	//  document.getElementById('KeyModResult' ).innerHTML = ''; 
  // key details:
//   document.getElementById('KeyModResult' ).innerHTML = 
//         "   --kev.code:"+kev.code   +"      --kev.key:"+kev.key+
//     "<br>--kev.ctrlKey:"+kev.ctrlKey+" --kev.shiftKey:"+kev.shiftKey+
//     "<br>--kev.altKey:"+kev.altKey +"  --kev.metaKey:"+kev.metaKey;
 
	switch(kev.code) {
		case "KeyP":
			console.log("Pause/unPause!\n");                // print on console,
			document.getElementById('KeyDownResult').innerHTML =  
			'Your press p/P key. Pause/unPause!';   // print on webpage
			if(g_isRun==true) {
			  g_isRun = false;    // STOP animation
			  }
			else {
			  g_isRun = true;     // RESTART animation
			  tick();
			  }
			break;
		//------------------WASD navigation-----------------
		case "KeyA":
			console.log("a/A key: Camera are going LEFT!\n");
			
			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			var upperdirection=new Vector3([0,0,1]);
			var directionformove=direction.cross(upperdirection);
			movepacex=directionformove.elements[0];
			movepacey=directionformove.elements[1];
			movepacez=directionformove.elements[2];
			eyex=eyex-movepacex/10;
			eyey=eyey-movepacey/10;
			eyez=eyez-movepacez/10;
			aimx=aimx-movepacex/10;
			aimy=aimy-movepacey/10;
			aimz=aimz-movepacez/10;
			//movepace-=0.1;
			document.getElementById('KeyDownResult').innerHTML =  
			'Your press a/A key. Camera are going LEFT!';
			break;
    	case "KeyD":
			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			var upperdirection=new Vector3([0,0,1]);
			var directionformove=direction.cross(upperdirection);
			movepacex=directionformove.elements[0];
			movepacey=directionformove.elements[1];
			movepacez=directionformove.elements[2];
			eyex=eyex+movepacex/10;
			eyey=eyey+movepacey/10;
			eyez=eyez+movepacez/10;
			aimx=aimx+movepacex/10;
			aimy=aimy+movepacey/10;
			aimz=aimz+movepacez/10;
			console.log("d/D key: Camera are going Right!\n");
			//movepace+=0.1;
			document.getElementById('KeyDownResult').innerHTML = 
			'Your press d/D key. Camera are going Right!';
			break;
		case "KeyS":

			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			movepacex=direction.elements[0];
			movepacey=direction.elements[1];
			movepacez=direction.elements[2];
			eyex=eyex-movepacex/10;
			eyey=eyey-movepacey/10;
			eyez=eyez-movepacez/10;
			aimx=aimx-movepacex/10;
			aimy=aimy-movepacey/10;
			aimz=aimz-movepacez/10;
			console.log(eyex);

			//movepaceud-=0.1;
			console.log("s/S key: Camera are moving back!\n");
			document.getElementById('KeyDownResult').innerHTML = 
			'Your press s/S key. Camera are moving back!';
			break;
		case "KeyW":
			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			movepacex=direction.elements[0];
			movepacey=direction.elements[1];
			movepacez=direction.elements[2];
			eyex=eyex+movepacex/10;
			eyey=eyey+movepacey/10;
			eyez=eyez+movepacez/10;
			aimx=aimx+movepacex/10;
			aimy=aimy+movepacey/10;
			aimz=aimz+movepacez/10;
			console.log(eyex);
			console.log(eyey);
			console.log(eyez);
			console.log(aimx);
			console.log(aimy);
			console.log(aimz);
			//movepaceud+=0.1;
			console.log("w/W key: Camera are moving forward!\n");
			document.getElementById('KeyDownResult').innerHTML =  
			'Your press w/W key. Camera are moving forward!';
			break;
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			angle=(angle+0.01)%360;
			
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press ← key. Camera are looking left.'
			//+kev.keyCode;
			break;
		case "ArrowRight":

			angle=(angle-0.01)%360;
			
			console.log('right-arrow.');
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press → key. Camera are looking right.'
			//+kev.keyCode;
  		break;
		case "ArrowUp":	
			tilt=tilt+0.05;
			console.log(tilt);	
			console.log('   up-arrow.');
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press ↑ key. Camera are looking up.'
			  //+kev.keyCode;
			break;
		case "ArrowDown":
			tilt=tilt-0.05;	
			console.log(tilt);	
			console.log(' down-arrow.');
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press ↓ key. Camera are looking down.'
			  //+kev.keyCode;
  		break;	

		
    default:
      console.log("UNUSED!");
  		document.getElementById('KeyDownResult').innerHTML =
  			'myKeyDown(): UNUSED!';
      break;
	}
}

function myKeyUp(kev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

	console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
}



function dragQuat(xdrag, ydrag) {
	//==============================================================================
	// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
	// We find a rotation axis perpendicular to the drag direction, and convert the 
	// drag distance to an angular rotation amount, and use both to set the value of 
	// the quaternion qNew.  We then combine this new rotation with the current 
	// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
	// 'draw()' function converts this current 'qTot' quaternion to a rotation 
	// matrix for drawing. 
		var res = 5;
		var qTmp = new Quaternion(0,0,0,1);
		 var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
		// // console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
		// //change it to 
		// var direction_tomy_model=new Vector3([1.25-eyex,-0.25-eyey,1.26-eyez]);
		// var upper_direction1=new Vector3([0,0,1]);
		// var new_xaxie=direction_tomy_model.cross(upper_direction1);
		// var tan0=Math.abs(new_xaxie.elements[1])/Math.abs(new_xaxie.elements[0]);
		// var angletorotate=Math.atan(tan0)*360/(2*Math.PI);
		// g_modelMatrix.rotate(angletorotate,0,1,0);

		// // console.log("angle:",angletorotate);
		// qTmp2.setFromAxisAngle(0,angle,0,0);
		//qTmp3.setFromAxisAngle(0,1,0,angle*180/Math.PI-90);
		qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
		// (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
								// why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
								// -- to rotate around +x axis, drag mouse in -y direction.
								// -- to rotate around +y axis, drag mouse in +x direction.

		qTmp.multiply(qNew,qTot);

		// qTmp.multiply(qNew,qTmp2);
		//--------------------------
		// IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
		// ANSWER: Because 'duality' governs ALL transformations, not just matrices. 
		// If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
		// first by qTot, and then by qNew--we would apply mouse-dragging rotations
		// to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
		// rotations FIRST, before we apply rotations from all the previous dragging.
		//------------------------
		// IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store 
		// them with finite precision. While the product of two (EXACTLY) unit-length
		// quaternions will always be another unit-length quaternion, the qTmp length
		// may drift away from 1.0 if we repeat this quaternion multiply many times.
		// A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
		// Matrix4.prototype.setFromQuat().
	//	qTmp.normalize();						// normalize to ensure we stay at length==1.0.
		qTot.copy(qTmp);
		// show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
		// document.getElementById('QuatValue').innerHTML= 
		// 													 '\t X=' +qTot.x.toFixed(res)+
		// 													'i\t Y=' +qTot.y.toFixed(res)+
		// 													'j\t Z=' +qTot.z.toFixed(res)+
		// 													'k\t W=' +qTot.w.toFixed(res)+
		// 													'<br>length='+qTot.length().toFixed(res);
	};
	




function DrawHead(){
//draw pikachu's face
pushMatrix(g_modelMatrix);
	
  //g_modelMatrix.scale(1.0,1.0,1.0);
  g_modelMatrix.scale(1.0,1.0,1.0);
  gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,0,36);
g_modelMatrix=popMatrix();

}
function Drawlefteyes(){
	//draw pikachu's eyes
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1.0,1.0,1.0);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_FAN,36,38);
	g_modelMatrix=popMatrix();

	
}
function Drawlefteyes_white(){
	//draw left eyes white
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1.0,1.0,1.0);
	
	gl.drawArrays(gl.TRIANGLE_FAN,74,38);
	g_modelMatrix=popMatrix();

		
}
function Drawrighteyes(){
	//draw right eyes
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1.0,1.0,1.0);
		gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,112,38);
	g_modelMatrix=popMatrix();

	
	}
function Drawrighteyes_white(){
	
	  //draw right eyes white
	  pushMatrix(g_modelMatrix);
	  g_modelMatrix.scale(1.0,1.0,1.0);
	  gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLE_FAN,150,38);
	g_modelMatrix=popMatrix();

	
	}
function Drawnose(){
	//draw nose
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1.0,1.0,1.0);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_FAN,188,38);
	g_modelMatrix=popMatrix();

	
	}
function Drawleftmouth(){
	
	//draw left mouth
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1.0,1.0,1.0);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.LINE_STRIP,226,13);
	g_modelMatrix=popMatrix();

	
	}
function Drawrightmouth(){
	//draw right mouth
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1.0,1.0,1.0);

	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.LINE_STRIP,239,13);
	g_modelMatrix=popMatrix();

	
}

function Drawleftearpart1(){
	pushMatrix(g_modelMatrix);	
	g_modelMatrix.translate(0.0,0.5,0.25);// -toward back，+ toward front，only after set identity's scale(1,1,-1)
	g_modelMatrix.rotate(-30,0,0,1);
	g_modelMatrix.rotate(-g_angle03, 0, 0, 1); 
	pushMatrix(g_modelMatrix);


	g_modelMatrix.scale(0.4,0.4,0.4);	
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 252, 18);
	g_modelMatrix=popMatrix();
}


function Drawleftearpart2(){
	
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(90,0,0,1);
	g_modelMatrix.translate(0,0.125*0.4,0);
	g_modelMatrix.rotate(-g_angle04, 0, 0, 1);
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(0.25,0.25,0.25);		
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 270, 12);
	g_modelMatrix=popMatrix();
		
}
function Drawleftearpart3(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0,0.25*0.25*Math.sqrt(6)/3,0);
	pushMatrix(g_modelMatrix);

	g_modelMatrix.scale(1.0,1.0,1.0);			
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 282,24);
	g_modelMatrix= popMatrix();	
}
function Drawleftearpart4(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0,0.3,0);
	pushMatrix(g_modelMatrix);

	g_modelMatrix.scale(1.0,1.0,1.0);	
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 306,12);
	popMatrix();
	popMatrix();
	popMatrix();
	popMatrix();
	g_modelMatrix= popMatrix();//get to head	
}


function Drawrightearpart1(){
	pushMatrix(g_modelMatrix);	
	g_modelMatrix.translate(0.5,0.5,0.25); // -toward back，+ toward front，only after set identity's scale(1,1,-1)

	g_modelMatrix.rotate(30,0,0,1);
	g_modelMatrix.rotate(g_angle05, 0, 0, 1); 
	pushMatrix(g_modelMatrix);


	g_modelMatrix.scale(0.4,0.4,0.4);	
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 318, 18);
	g_modelMatrix=popMatrix();
}

function DrawleftBlush(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.07*0.5,0.12,0.5011);
	g_modelMatrix.scale(0.07,0.07,1.0);
		gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,336,29);
	
	g_modelMatrix=popMatrix();

	pushMatrix(g_modelMatrix);

	g_modelMatrix.translate(0.0, 0.12, 0.5011);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLES,365,3);
	g_modelMatrix=popMatrix();
}
function DrawrightBlush(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.5-0.07*0.5,0.12,0.5011);
	g_modelMatrix.scale(0.07,0.07,1.0);
	g_modelMatrix.scale(-1,1,1);
		gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,336,29);
	
	g_modelMatrix=popMatrix();

	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.5, 0.12, 0.5011);
	g_modelMatrix.scale(-1,1,1);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLES,365,3);
	g_modelMatrix=popMatrix();

}
//Blush in the left side
function DrawleftBlush_left(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0, 0.12, 0.50);
	g_modelMatrix.rotate(90,0,1,0);
	g_modelMatrix.translate(-0.002, 0.0, 0);
	g_modelMatrix.scale(0.025,0.061,1);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_FAN,368,22);
	g_modelMatrix=popMatrix();


}

//blush in the right side
function DrawrightBlush_left(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.5, 0.12, 0.50);
	g_modelMatrix.rotate(90,0,1,0);
	g_modelMatrix.translate(-0.002, 0.0, 0);
	g_modelMatrix.scale(0.025,0.061,1);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_FAN,390,22);
	g_modelMatrix=popMatrix();


}
function Drawlefteye_brown(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.15, 0.26, 0.5012);
	g_modelMatrix.scale(0.050,0.025,1);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_FAN,412,22);
	g_modelMatrix=popMatrix();



}
function Drawrighteye_brown(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.35, 0.26, 0.5012);
	g_modelMatrix.scale(0.050,0.025,1);
	gl.uniformMatrix4fv(g_modelMatLoc,false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_FAN,412,22);
	g_modelMatrix=popMatrix();



}



function Drawrightearpart2(){
	
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(-90,0,0,1);
	g_modelMatrix.translate(0,0.125*0.4,0);
	g_modelMatrix.rotate(g_angle06, 0, 0, 1);
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(0.25,0.25,0.25);		
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 270, 12);//re call it is the same
	g_modelMatrix=popMatrix();
		
}
function Drawrightearpart3(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0,0.25*0.25*Math.sqrt(6)/3,0);
	pushMatrix(g_modelMatrix);

	g_modelMatrix.scale(1.0,1.0,1.0);	
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 282,24);//re call it is the same
	g_modelMatrix= popMatrix();	
}
function Drawrightearpart4(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0,0.3,0);
	pushMatrix(g_modelMatrix);

	g_modelMatrix.scale(1.0,1.0,1.0);		
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 306,12);//re call it is the same
	popMatrix();
	popMatrix();
	popMatrix();
	popMatrix();
	g_modelMatrix= popMatrix();//get to head	
}

function Drawminimodel(){

//set identity
g_modelMatrix.setIdentity();  
g_modelMatrix.setTranslate(-0.7,0.7,0.0);  
g_modelMatrix.scale(0.3,0.3,0.3);//
g_modelMatrix.rotate(g_angle01, 0, 1, 0);  //from right to left
g_modelMatrix.rotate(g_angle02, 1, 0, 0);  // from up to down

//on head part
DrawHead();
Drawlefteyes();
Drawlefteyes_white();
Drawrighteyes();
Drawrighteyes_white();
Drawnose();
Drawleftmouth();
Drawrightmouth();
DrawleftBlush();
DrawleftBlush_left();
DrawrightBlush();
DrawrightBlush_left();
Drawlefteye_brown();
Drawrighteye_brown();
//left_ear
Drawleftearpart1();
Drawleftearpart2();
Drawleftearpart3();
Drawleftearpart4();
//right_ear
Drawrightearpart1();
Drawrightearpart2();
Drawrightearpart3();
Drawrightearpart4();

}

function Drawtailpart1(){
	pushMatrix(g_modelMatrix);	
	g_modelMatrix.translate(0.225,0.05,-0.01);// 
	g_modelMatrix.rotate(90,0,1,0);
	g_modelMatrix.rotate(-g_angle07, 0, 0, 1); 
	pushMatrix(g_modelMatrix);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);

	gl.drawArrays(gl.TRIANGLES, 434, 16);
	g_modelMatrix=popMatrix();
}
function Drawtailpart2(){

	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.025*Math.sqrt(15),0,0);
	pushMatrix(g_modelMatrix);		
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 450, 36);//re call it is the same
	g_modelMatrix=popMatrix();

}
function Drawtailpart3(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.5*0.025*Math.sqrt(15),0,0);
	pushMatrix(g_modelMatrix);

	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);


	gl.drawArrays(gl.TRIANGLES, 486, 36);//re call it is the same
	g_modelMatrix= popMatrix();	
}
function Drawtailpart4(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(1.5*0.025*Math.sqrt(15),0,0);
	pushMatrix(g_modelMatrix);	
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);

	gl.drawArrays(gl.TRIANGLES, 522, 18);//re call it is the same
	popMatrix();
	popMatrix();
	popMatrix();
	popMatrix();
	g_modelMatrix= popMatrix();//get to head	
}
function Drawground(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	g_modelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
		gndStart/floatsPerVertex,	// start at this vertex number, and
		gndVerts.length/floatsPerVertex);	// draw this many vertices.
	g_modelMatrix= popMatrix();//get to head	
}
function Drawaxes(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	g_modelMatrix.scale(0.4, 0.4, 0.4);				// Make it smaller.
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
		axeStart/floatsPerVertex,	// start at this vertex number, and
		myaxes.length/floatsPerVertex);	// draw this many vertices.
	g_modelMatrix= popMatrix();//get to head	
}
function Drawsphere(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
		sphStart/floatsPerVertex,	// start at this vertex number, and 
		sphVerts.length/floatsPerVertex);	// draw this many vertices.
	g_modelMatrix= popMatrix();//get to head	
}
function Drawpokeball_partI(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
		sphStart/floatsPerVertex,	// start at this vertex number, and 
		sphVerts.length/floatsPerVertex);	// draw this many vertices.
}
function Drawpokeball_partII(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	// g_modelMatrix.translate(0.2,0.2,0.2);
	g_modelMatrix.rotate(90,0,1,0);
	g_modelMatrix.translate(0,0,1);
	g_modelMatrix.translate(0.1,0,0);
	g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLE_FAN,				// use this drawing primitive, and
		cirStart/floatsPerVertex,	// start at this vertex number, and 
		my_circle.length/floatsPerVertex);	// draw this many vertices.

}
function Drawpokeball_partIII(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	// g_modelMatrix.translate(0.2,0.2,0.2);
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.LINE_LOOP,				// use this drawing primitive, and
		cirStart2/floatsPerVertex,	// start at this vertex number, and 
		my_circle2.length/floatsPerVertex);	// draw this many vertices.
	popMatrix();
	popMatrix();
	g_modelMatrix=popMatrix();
}

function Drawhourglass_partI(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	// g_modelMatrix.translate(0.2,0.2,0.2);
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  //g_modelMatrix.rotate(180,0,1,0);
	  g_modelMatrix.rotate(90,0,1,0);
	  g_modelMatrix.scale(4,2,2);
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
		tetStart/floatsPerVertex,	// start at this vertex number, and 
		my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
}

function Drawhourglass_partII(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	// g_modelMatrix.translate(0.2,0.2,0.2);
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  g_modelMatrix.rotate(180,0,1,0);
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
		tetStart/floatsPerVertex,	// start at this vertex number, and 
		my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
		popMatrix();
	g_modelMatrix=popMatrix();
}

function Drawhouse_partI(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	// g_modelMatrix.translate(0.2,0.2,0.2);
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:
	  g_modelMatrix.rotate(90,0,1,0);
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
		cubStart/floatsPerVertex,	// start at this vertex number, and 
		my_cube.length/floatsPerVertex);	// draw this many vertices.
}

function Drawhouse_partII(){
	pushMatrix(g_modelMatrix);  // SAVE world drawing coords.
	// g_modelMatrix.translate(0.2,0.2,0.2);
  	// Drawing:
  	// Pass our current matrix to the vertex shaders:

	  g_modelMatrix.translate(0.5+0.125,0.20,0.25);
	  g_modelMatrix.scale(1,2,2);
	  g_modelMatrix.translate(0.125,0,0);
	  g_modelMatrix.scale(2,1,1);
	  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
		tetStart/floatsPerVertex,	// start at this vertex number, and 
		my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
	popMatrix();
	g_modelMatrix=popMatrix();
}








function Drawpikachu(){

//on head part
DrawHead();
Drawlefteyes();
Drawlefteyes_white();
Drawrighteyes();
Drawrighteyes_white();
Drawnose();
Drawleftmouth();
Drawrightmouth();
DrawleftBlush();
DrawleftBlush_left();
DrawrightBlush();
DrawrightBlush_left();
Drawlefteye_brown();
Drawrighteye_brown();
//left_ear
Drawleftearpart1();
Drawleftearpart2();
Drawleftearpart3();
Drawleftearpart4();
//right_ear
Drawrightearpart1();
Drawrightearpart2();
Drawrightearpart3();
Drawrightearpart4();
//tail
Drawtailpart1();
Drawtailpart2();
Drawtailpart3();
Drawtailpart4();

}






function makeGroundGrid() {
	//==============================================================================
	// Create a list of vertices that create a large grid of lines in the x,y plane
	// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.
	
		var xcount = 100;			// # of lines to draw in x,y to make the grid.
		var ycount = 100;		
		var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
		 var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
		 var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
		 
		// Create an (global) array to hold this ground-plane's vertices:
		gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
							// draw a grid made of xcount+ycount lines; 2 vertices per line.
							
		var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
		var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
		
		// First, step thru x values as we make vertical lines of constant-x:
		for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
			if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
				gndVerts[j  ] = -xymax + (v  )*xgap;	// x
				gndVerts[j+1] = -xymax;								// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			else {				// put odd-numbered vertices at (xnow, +xymax, 0).
				gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
				gndVerts[j+1] = xymax;								// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			gndVerts[j+4] = xColr[0];			// red
			gndVerts[j+5] = xColr[1];			// grn
			gndVerts[j+6] = xColr[2];			// blu
		}
		// Second, step thru y values as wqe make horizontal lines of constant-y:
		// (don't re-initialize j--we're adding more vertices to the array)
		for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
			if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
				gndVerts[j  ] = -xymax;								// x
				gndVerts[j+1] = -xymax + (v  )*ygap;	// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			else {					// put odd-numbered vertices at (+xymax, ynow, 0).
				gndVerts[j  ] = xymax;								// x
				gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			gndVerts[j+4] = yColr[0];			// red
			gndVerts[j+5] = yColr[1];			// grn
			gndVerts[j+6] = yColr[2];			// blu
		}
	}
function makeAxes(){

	myaxes=new Float32Array([
     	// Drawing Axes: Draw them using gl.LINES drawing primitive;
     	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// 						 (endpoint: red)
		 
		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  0.3,	// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,	//						 (endpoint: blue)
	]);
}

function makePikachu(){
	var j=Math.PI/180;
	pikachu = new Float32Array([
		   //my cube part I(36)
		   //upper side
		   0.0, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //base
			0.0,  0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.5, 1.0,  		250/255,214/255,29/255,
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,	
			0.5,  0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   //left
		   0.0, 0.0, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //right
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
			0.5, 0.0, 0.5, 1.0,  		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //front
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   //back
			0.0,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.0, 1.0, 		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.0, 0.50, 1.0,		250/255,214/255,29/255,
			//left eyes(38)
			0.15, 0.3, 0.501, 1.0, 0,0,0,
			(Math.sin(j)+0.15*15)/15,(Math.cos(j)+0.3*15)/15, 0.501, 1.0,    0, 0, 0,
			(Math.sin(10*j)+0.15*15)/15,(Math.cos(10*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(20*j)+0.15*15)/15,(Math.cos(20*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(30*j)+0.15*15)/15,(Math.cos(30*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(40*j)+0.15*15)/15,(Math.cos(40*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(50*j)+0.15*15)/15,(Math.cos(50*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(60*j)+0.15*15)/15,(Math.cos(60*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(70*j)+0.15*15)/15,(Math.cos(70*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(80*j)+0.15*15)/15,(Math.cos(80*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(90*j)+0.15*15)/15,(Math.cos(90*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(100*j)+0.15*15)/15,(Math.cos(100*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(110*j)+0.15*15)/15,(Math.cos(110*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(120*j)+0.15*15)/15,(Math.cos(120*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(130*j)+0.15*15)/15,(Math.cos(130*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(140*j)+0.15*15)/15,(Math.cos(140*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(150*j)+0.15*15)/15,(Math.cos(150*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(160*j)+0.15*15)/15,(Math.cos(160*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(170*j)+0.15*15)/15,(Math.cos(170*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(180*j)+0.15*15)/15,(Math.cos(180*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(190*j)+0.15*15)/15,(Math.cos(190*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(200*j)+0.15*15)/15,(Math.cos(200*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(210*j)+0.15*15)/15,(Math.cos(210*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(220*j)+0.15*15)/15,(Math.cos(220*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(230*j)+0.15*15)/15,(Math.cos(230*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(240*j)+0.15*15)/15,(Math.cos(240*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(250*j)+0.15*15)/15,(Math.cos(250*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(260*j)+0.15*15)/15,(Math.cos(260*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(270*j)+0.15*15)/15,(Math.cos(270*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(280*j)+0.15*15)/15,(Math.cos(280*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(290*j)+0.15*15)/15,(Math.cos(290*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(300*j)+0.15*15)/15,(Math.cos(300*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(310*j)+0.15*15)/15,(Math.cos(310*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(320*j)+0.15*15)/15,(Math.cos(320*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(330*j)+0.15*15)/15,(Math.cos(330*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(340*j)+0.15*15)/15,(Math.cos(340*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(350*j)+0.15*15)/15,(Math.cos(350*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(361*j)+0.15*15)/15,(Math.cos(361*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
	  
			//left_eye_white(38)
			0.17, 0.32, 0.5011, 1.0, 1,1,1,
			(Math.sin(j)+0.17*22)/22,(Math.cos(j)+0.32*22)/22, 0.5011, 1.0,    1, 1, 1,
			(Math.sin(10*j)+0.17*22)/22,(Math.cos(10*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(20*j)+0.17*22)/22,(Math.cos(20*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(30*j)+0.17*22)/22,(Math.cos(30*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(40*j)+0.17*22)/22,(Math.cos(40*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(50*j)+0.17*22)/22,(Math.cos(50*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(60*j)+0.17*22)/22,(Math.cos(60*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(70*j)+0.17*22)/22,(Math.cos(70*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(80*j)+0.17*22)/22,(Math.cos(80*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(90*j)+0.17*22)/22,(Math.cos(90*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(100*j)+0.17*22)/22,(Math.cos(100*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(110*j)+0.17*22)/22,(Math.cos(110*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(120*j)+0.17*22)/22,(Math.cos(120*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(130*j)+0.17*22)/22,(Math.cos(130*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(140*j)+0.17*22)/22,(Math.cos(140*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(150*j)+0.17*22)/22,(Math.cos(150*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(160*j)+0.17*22)/22,(Math.cos(160*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(170*j)+0.17*22)/22,(Math.cos(170*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(180*j)+0.17*22)/22,(Math.cos(180*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(190*j)+0.17*22)/22,(Math.cos(190*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(200*j)+0.17*22)/22,(Math.cos(200*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(210*j)+0.17*22)/22,(Math.cos(210*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(220*j)+0.17*22)/22,(Math.cos(220*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(230*j)+0.17*22)/22,(Math.cos(230*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(240*j)+0.17*22)/22,(Math.cos(240*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(250*j)+0.17*22)/22,(Math.cos(250*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(260*j)+0.17*22)/22,(Math.cos(260*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(270*j)+0.17*22)/22,(Math.cos(270*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(280*j)+0.17*22)/22,(Math.cos(280*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(290*j)+0.17*22)/22,(Math.cos(290*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(300*j)+0.17*22)/22,(Math.cos(300*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(310*j)+0.17*22)/22,(Math.cos(310*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(320*j)+0.17*22)/22,(Math.cos(320*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(330*j)+0.17*22)/22,(Math.cos(330*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(340*j)+0.17*22)/22,(Math.cos(340*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(350*j)+0.17*22)/22,(Math.cos(350*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(361*j)+0.17*22)/22,(Math.cos(361*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  //right eyes(38)
		  0.35, 0.3, 0.501, 1.0, 0,0,0,
		  (Math.sin(j)+0.35*15)/15,(Math.cos(j)+0.3*15)/15, 0.501, 1.0,    0, 0, 0,
		  (Math.sin(10*j)+0.35*15)/15,(Math.cos(10*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(20*j)+0.35*15)/15,(Math.cos(20*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(30*j)+0.35*15)/15,(Math.cos(30*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(40*j)+0.35*15)/15,(Math.cos(40*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(50*j)+0.35*15)/15,(Math.cos(50*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(60*j)+0.35*15)/15,(Math.cos(60*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(70*j)+0.35*15)/15,(Math.cos(70*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(80*j)+0.35*15)/15,(Math.cos(80*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(90*j)+0.35*15)/15,(Math.cos(90*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(100*j)+0.35*15)/15,(Math.cos(100*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(110*j)+0.35*15)/15,(Math.cos(110*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(120*j)+0.35*15)/15,(Math.cos(120*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(130*j)+0.35*15)/15,(Math.cos(130*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(140*j)+0.35*15)/15,(Math.cos(140*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(150*j)+0.35*15)/15,(Math.cos(150*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(160*j)+0.35*15)/15,(Math.cos(160*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(170*j)+0.35*15)/15,(Math.cos(170*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(180*j)+0.35*15)/15,(Math.cos(180*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(190*j)+0.35*15)/15,(Math.cos(190*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(200*j)+0.35*15)/15,(Math.cos(200*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(210*j)+0.35*15)/15,(Math.cos(210*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(220*j)+0.35*15)/15,(Math.cos(220*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(230*j)+0.35*15)/15,(Math.cos(230*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(240*j)+0.35*15)/15,(Math.cos(240*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(250*j)+0.35*15)/15,(Math.cos(250*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(260*j)+0.35*15)/15,(Math.cos(260*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(270*j)+0.35*15)/15,(Math.cos(270*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(280*j)+0.35*15)/15,(Math.cos(280*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(290*j)+0.35*15)/15,(Math.cos(290*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(300*j)+0.35*15)/15,(Math.cos(300*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(310*j)+0.35*15)/15,(Math.cos(310*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(320*j)+0.35*15)/15,(Math.cos(320*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(330*j)+0.35*15)/15,(Math.cos(330*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(340*j)+0.35*15)/15,(Math.cos(340*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(350*j)+0.35*15)/15,(Math.cos(350*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(361*j)+0.35*15)/15,(Math.cos(361*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  
		  //right_eye_white(38)
		  0.37, 0.32, 0.5011, 1.0, 1,1,1,
		  (Math.sin(j)+0.37*22)/22,(Math.cos(j)+0.32*22)/22, 0.5011, 1.0,    1, 1, 1,
		  (Math.sin(10*j)+0.37*22)/22,(Math.cos(10*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(20*j)+0.37*22)/22,(Math.cos(20*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(30*j)+0.37*22)/22,(Math.cos(30*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(40*j)+0.37*22)/22,(Math.cos(40*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(50*j)+0.37*22)/22,(Math.cos(50*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(60*j)+0.37*22)/22,(Math.cos(60*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(70*j)+0.37*22)/22,(Math.cos(70*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(80*j)+0.37*22)/22,(Math.cos(80*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(90*j)+0.37*22)/22,(Math.cos(90*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(100*j)+0.37*22)/22,(Math.cos(100*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(110*j)+0.37*22)/22,(Math.cos(110*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(120*j)+0.37*22)/22,(Math.cos(120*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(130*j)+0.37*22)/22,(Math.cos(130*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(140*j)+0.37*22)/22,(Math.cos(140*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(150*j)+0.37*22)/22,(Math.cos(150*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(160*j)+0.37*22)/22,(Math.cos(160*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(170*j)+0.37*22)/22,(Math.cos(170*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(180*j)+0.37*22)/22,(Math.cos(180*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(190*j)+0.37*22)/22,(Math.cos(190*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(200*j)+0.37*22)/22,(Math.cos(200*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(210*j)+0.37*22)/22,(Math.cos(210*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(220*j)+0.37*22)/22,(Math.cos(220*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(230*j)+0.37*22)/22,(Math.cos(230*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(240*j)+0.37*22)/22,(Math.cos(240*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(250*j)+0.37*22)/22,(Math.cos(250*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(260*j)+0.37*22)/22,(Math.cos(260*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(270*j)+0.37*22)/22,(Math.cos(270*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(280*j)+0.37*22)/22,(Math.cos(280*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(290*j)+0.37*22)/22,(Math.cos(290*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(300*j)+0.37*22)/22,(Math.cos(300*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(310*j)+0.37*22)/22,(Math.cos(310*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(320*j)+0.37*22)/22,(Math.cos(320*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(330*j)+0.37*22)/22,(Math.cos(330*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(340*j)+0.37*22)/22,(Math.cos(340*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(350*j)+0.37*22)/22,(Math.cos(350*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(361*j)+0.37*22)/22,(Math.cos(361*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  //noses(38)
		  0.254, 0.235, 0.501, 1.0, 0,0,0,
		  (Math.sin(j)+0.254*75)/75,(Math.cos(j)+0.235*120)/120, 0.5011, 1.0,    0, 0, 0,
		  (Math.sin(10*j)+0.254*75)/75,(Math.cos(10*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(20*j)+0.254*75)/75,(Math.cos(20*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(30*j)+0.254*75)/75,(Math.cos(30*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(40*j)+0.254*75)/75,(Math.cos(40*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(50*j)+0.254*75)/75,(Math.cos(50*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(60*j)+0.254*75)/75,(Math.cos(60*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(70*j)+0.254*75)/75,(Math.cos(70*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(80*j)+0.254*75)/75,(Math.cos(80*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(90*j)+0.254*75)/75,(Math.cos(90*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(100*j)+0.254*75)/75,(Math.cos(100*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(110*j)+0.254*75)/75,(Math.cos(110*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(120*j)+0.254*75)/75,(Math.cos(120*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(130*j)+0.254*75)/75,(Math.cos(130*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(140*j)+0.254*75)/75,(Math.cos(140*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(150*j)+0.254*75)/75,(Math.cos(150*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(160*j)+0.254*75)/75,(Math.cos(160*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(170*j)+0.254*75)/75,(Math.cos(170*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(180*j)+0.254*75)/75,(Math.cos(180*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(190*j)+0.254*75)/75,(Math.cos(190*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(200*j)+0.254*75)/75,(Math.cos(200*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(210*j)+0.254*75)/75,(Math.cos(210*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(220*j)+0.254*75)/75,(Math.cos(220*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(230*j)+0.254*75)/75,(Math.cos(230*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(240*j)+0.254*75)/75,(Math.cos(240*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(250*j)+0.254*75)/75,(Math.cos(250*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(260*j)+0.254*75)/75,(Math.cos(260*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(270*j)+0.254*75)/75,(Math.cos(270*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(280*j)+0.254*75)/75,(Math.cos(280*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(290*j)+0.254*75)/75,(Math.cos(290*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(300*j)+0.254*75)/75,(Math.cos(300*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(310*j)+0.254*75)/75,(Math.cos(310*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(320*j)+0.254*75)/75,(Math.cos(320*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(330*j)+0.254*75)/75,(Math.cos(330*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(340*j)+0.254*75)/75,(Math.cos(340*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(350*j)+0.254*75)/75,(Math.cos(350*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(361*j)+0.254*75)/75,(Math.cos(361*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
	  //left_Mouth(13)
	  (Math.sin(120*j)+0.20*15)/15,(Math.cos(120*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(130*j)+0.20*15)/15,(Math.cos(130*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(140*j)+0.20*15)/15,(Math.cos(140*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(150*j)+0.20*15)/15,(Math.cos(150*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(160*j)+0.20*15)/15,(Math.cos(160*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(170*j)+0.20*15)/15,(Math.cos(170*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(180*j)+0.20*15)/15,(Math.cos(180*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(190*j)+0.20*15)/15,(Math.cos(190*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(200*j)+0.20*15)/15,(Math.cos(200*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(210*j)+0.20*15)/15,(Math.cos(210*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(220*j)+0.20*15)/15,(Math.cos(220*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(230*j)+0.20*15)/15,(Math.cos(230*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(240*j)+0.20*15)/15,(Math.cos(240*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  
	  //right_Mouth(13)
	  (Math.sin(120*j)+0.31*15)/15,(Math.cos(120*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(130*j)+0.31*15)/15,(Math.cos(130*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(140*j)+0.31*15)/15,(Math.cos(140*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(150*j)+0.31*15)/15,(Math.cos(150*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(160*j)+0.31*15)/15,(Math.cos(160*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(170*j)+0.31*15)/15,(Math.cos(170*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(180*j)+0.31*15)/15,(Math.cos(180*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(190*j)+0.31*15)/15,(Math.cos(190*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(200*j)+0.31*15)/15,(Math.cos(200*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(210*j)+0.31*15)/15,(Math.cos(210*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(220*j)+0.31*15)/15,(Math.cos(220*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(230*j)+0.31*15)/15,(Math.cos(230*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(240*j)+0.31*15)/15,(Math.cos(240*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  
	  //left_ear_part1
	  //left side
	  -0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255, //2
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  -0.125, -0.10, -0.125, 1.00, 225/255, 151/255, 32/255, 	 //1
	  -0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	  //4
	  
	  //base side
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,   //2
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  //front side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  -0.125, -0.10, 0.125, 1.00,    255/255, 222/255, 0,	  //4
	  //upper side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,    //2
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  //lower side
	  -0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  -0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	 //4
	  
	  
	  //left_ear_part2
	  //base side
	  0.125,0.25*Math.sqrt(6)/3,-0.125*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//1
	  0.00, 0.00, 0.00, 1.00,  245/255,233/255,126/255,//3
	  -0.125, 0.25*Math.sqrt(6)/3, -0.125*Math.sqrt(3)/3, 1.00,  245/255,233/255,126/255,//2
	  
	  //right side
	  0.00, 0.00, 0.00, 1.00, 245/255,233/255,126/255,//3
	  0.125,0.25*Math.sqrt(6)/3,-0.125*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//1
	  0,0.25*Math.sqrt(6)/3,0.25*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//4
	  //left side
	  0,0.25*Math.sqrt(6)/3,0.25*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//4
	  -0.125, 0.25*Math.sqrt(6)/3, -0.125*Math.sqrt(3)/3, 1.00,  245/255,233/255,126/255,//2
	  0.00, 0.00, 0.00, 1.00, 245/255,233/255,126/255,//3
	  //upper side
	  0.125,0.25*Math.sqrt(6)/3,-0.125*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//1
	  -0.125, 0.25*Math.sqrt(6)/3, -0.125*Math.sqrt(3)/3, 1.00,  245/255,233/255,126/255,//2
	  0,0.25*Math.sqrt(6)/3,0.25*Math.sqrt(3)/3,1.00, 250/255,214/255,29/255,//4
	  
	  //left_ear_part3
	  //base side
	  0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,   255/255, 222/255, 0,//7
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,   225/255, 151/255, 32/255,//1
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  255/255, 222/255, 0,//5
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  255/255, 222/255, 0,//5
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,   225/255, 151/255, 32/255,//1
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  225/255, 151/255, 32/255,//2
	  //lower side
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//1
	  0,0,0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//4
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//2
	  //right side
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//5
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//2
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//2
	  0,0,0.25*Math.sqrt(3)/3,1.00,  250/255,214/255,29/255,//4
	  //left side
	  0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,   250/255,214/255,29/255,//7
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//1
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//1
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  0,0,0.25*Math.sqrt(3)/3, 1.00, 250/255,214/255,29/255,//4
	  //upper sider
	  0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,   250/255,214/255,29/255,//7
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//5
	  0,0.3,0.25*0.25*Math.sqrt(3)/3,1.00,  250/255,214/255,29/255,//6
	  
	  
	  
	  //left_ear_part4
	  //lower side
	  0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,   0,0,0,//7
	  0,0.0,0.25*0.25*Math.sqrt(3)/3, 1.00,  0,0,0,//6
	  -0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,  0,0,0,//5
	  //base side
	  
	  0.00, 0.10, 0.00, 1.00,   0,0,0,//3
	  0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,   0,0,0,//7
	  -0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,  0,0,0,//5
	  //left side
	  0.00, 0.10, 0.00, 1.00,   0,0,0,//3
	  -0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,  0,0,0,//5
	  0,0.0,0.25*0.25*Math.sqrt(3)/3, 1.00,  0,0,0,//6
	  //right side
	  0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,   0,0,0,//7
	  0.00, 0.10, 0.00, 1.00,   0,0,0,//3
	  0,0.0,0.25*0.25*Math.sqrt(3)/3, 1.00,  0,0,0,//6
	  
	  //right_ear_part1
	  //left side
	  0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,   //2
	  0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,		//3
	  0.125, -0.10, -0.125, 1.00, 225/255, 151/255, 32/255, 	 //1
	  0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.125, 0.15, 0.125, 1.00,    255/255, 222/255, 0,		//3
	  0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	 //4
	  
	  //base side
	  0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,  //2
	  0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  //front side
	  0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,		//3
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255, //0
	  0.125, -0.10, 0.125, 1.00,    255/255, 222/255, 0,	 //4
	  //upper side
	  0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,   //2
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  0.125, 0.15, 0.125, 1.00,    255/255, 222/255, 0,		//3
	  //lower side
	  0.125, -0.10, -0.125, 1.00,   255/255, 226/255, 111/255, //1
	  0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	 //4
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  
	  //leftBlush
	  0,0,0,1,  246/255, 45/255, 20/255,
	  Math.sin(-31*j),Math.cos(-31*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-30*j),Math.cos(-30*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-20*j),Math.cos(-20*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-10*j),Math.cos(-10*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-1*j),Math.cos(-1*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(j),Math.cos(j), 0,  1.0,     246/255, 45/255, 20/255,
	  Math.sin(10*j),Math.cos(10*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(20*j),Math.cos(20*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(30*j),Math.cos(30*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(40*j),Math.cos(40*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(50*j),Math.cos(50*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(60*j),Math.cos(60*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(70*j),Math.cos(70*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(80*j),Math.cos(80*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(90*j),Math.cos(90*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(100*j),Math.cos(100*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(110*j),Math.cos(110*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(120*j),Math.cos(120*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(130*j),Math.cos(130*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(140*j),Math.cos(140*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(150*j),Math.cos(150*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(160*j),Math.cos(160*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(170*j),Math.cos(170*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(180*j),Math.cos(180*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(190*j),Math.cos(190*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(200*j),Math.cos(200*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(210*j),Math.cos(210*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(211*j),Math.cos(211*j),0, 1.0,      246/255, 45/255, 20/255,
	  
	  //Triangle for left Blush
	  0.07*0.5, 0.00, 0.00, 1.00, 246/255, 45/255, 20/255,
	  0, 0.07*0.5*Math.sqrt(3), 0.00, 1.00, 246/255, 45/255, 20/255,
	  0, -0.07*0.5*Math.sqrt(3), 0.00, 1.00, 246/255, 45/255, 20/255,
	  
	  
	  //leftblush_left
	  0,0,-0.001,1,  246/255, 45/255, 20/255,
	  Math.sin(-1*j),Math.cos(-1*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(1*j),Math.cos(1*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(10*j),Math.cos(10*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(20*j),Math.cos(20*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(30*j),Math.cos(30*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(40*j),Math.cos(40*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(50*j),Math.cos(50*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(60*j),Math.cos(60*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(70*j),Math.cos(70*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(80*j),Math.cos(80*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(90*j),Math.cos(90*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(100*j),Math.cos(100*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(110*j),Math.cos(110*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(120*j),Math.cos(120*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(130*j),Math.cos(130*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(140*j),Math.cos(140*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(150*j),Math.cos(150*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(160*j),Math.cos(160*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(170*j),Math.cos(170*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(180*j),Math.cos(180*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(181*j),Math.cos(181*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  //rightblush_left
	  0,0,0.001,1,  246/255, 45/255, 20/255,
	  Math.sin(-1*j),Math.cos(-1*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(1*j),Math.cos(1*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(10*j),Math.cos(10*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(20*j),Math.cos(20*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(30*j),Math.cos(30*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(40*j),Math.cos(40*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(50*j),Math.cos(50*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(60*j),Math.cos(60*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(70*j),Math.cos(70*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(80*j),Math.cos(80*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(90*j),Math.cos(90*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(100*j),Math.cos(100*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(110*j),Math.cos(110*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(120*j),Math.cos(120*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(130*j),Math.cos(130*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(140*j),Math.cos(140*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(150*j),Math.cos(150*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(160*j),Math.cos(160*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(170*j),Math.cos(170*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(180*j),Math.cos(180*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(181*j),Math.cos(181*j),0.001,1.0,     246/255, 45/255, 20/255,
	  
	  //eyebrown(22)
	  0,0,0.001,1,  104/255, 73/255, 44/255,
	  Math.sin(91*j),Math.cos(91*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(90*j),Math.cos(90*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(100*j),Math.cos(100*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(110*j),Math.cos(110*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(120*j),Math.cos(120*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(130*j),Math.cos(130*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(140*j),Math.cos(140*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(150*j),Math.cos(150*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(160*j),Math.cos(160*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(170*j),Math.cos(170*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(180*j),Math.cos(180*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(190*j),Math.cos(190*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(200*j),Math.cos(200*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(210*j),Math.cos(210*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(220*j),Math.cos(220*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(230*j),Math.cos(230*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(240*j),Math.cos(240*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(250*j),Math.cos(250*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(260*j),Math.cos(260*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(270*j),Math.cos(270*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(271*j),Math.cos(271*j),0.001,1.0,     104/255, 73/255, 44/255,
	  //tail_part_I 434//(16)
	  //front
	  0.025*Math.sqrt(15),0.1, 0.025, 1.0, 104/255, 73/255, 44/255,//2
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  0.025*Math.sqrt(15), 0.0, 0.025, 1.0, 104/255, 73/255, 44/255,//1
	  //back
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  0.025*Math.sqrt(15),0.1, -0.025, 1.0, 104/255, 73/255, 44/255,//3
	  0.025*Math.sqrt(15), 0.0, -0.025, 1.0, 104/255, 73/255, 44/255,//4
	  //upper
	  0.025*Math.sqrt(15),0.1, -0.025, 1.0, 104/255, 73/255, 44/255,//3
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  0.025*Math.sqrt(15),0.1, 0.025, 1.0, 104/255, 73/255, 44/255,//2
	  //base
	  0.025*Math.sqrt(15), 0.0, -0.025, 1.0, 104/255, 73/255, 44/255,//4
	  0.025*Math.sqrt(15), 0.0, 0.025, 1.0, 104/255, 73/255, 44/255,//1
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  //right
	  0.025*Math.sqrt(15),0.1, -0.025, 1.0, 104/255, 73/255, 44/255,//3
	  0.025*Math.sqrt(15),0.1, 0.025, 1.0, 104/255, 73/255, 44/255,//2
	  0.025*Math.sqrt(15), 0.0, 0.025, 1.0, 104/255, 73/255, 44/255,//1
	  0.025*Math.sqrt(15), 0.0, -0.025, 1.0, 104/255, 73/255, 44/255,//4
	  //tail_part_II(36)
	  //front
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//5
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.0, -0.05, 0.025, 1.0, 250/255, 214/255, 29/255,//1
	  //back
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//7
	  //left
	  0.0, -0.05, 0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  //right
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//7
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  
	  //upper
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  
	  //bottom
	  0.0, -0.05, 0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  
	  //tail_part_III(36)
	  //front
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  //back
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  1.5*0.025*Math.sqrt(15),0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  //left
	  0, -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  //right
	  1.5*0.025*Math.sqrt(15),0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  //upper
	  1.5*0.025*Math.sqrt(15),0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  //bottom
	  0, -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  
	  
	  //tail_part_IV(18)
	  
	  //
	  //front
	  0.2*Math.sqrt(3),0.15, 0,  1.0, 250/255, 214/255, 29/255,//4
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0,0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  //back
	  0, 0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.2*Math.sqrt(3),0.15, 0,  1.0, 250/255, 214/255, 29/255,//4
	  //left
	  0, 0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, 0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0, 0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  //upper
	  0.2*Math.sqrt(3),0.15, 0,  1.0, 250/255, 214/255, 29/255,//4
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  //bottom
	  0,0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0,0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  
		]);





}


function makeSphere() {
	//==============================================================================
	// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
	// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
	// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
	// sphere from one triangle strip.
	  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
												// (choose odd # or prime# to avoid accidental symmetry)
	  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
												// (same number of vertices on bottom of slice, too)
	  var topColr = new Float32Array([1.0, 1.0, 1.0]);	// North Pole: light gray
	  var equColr = new Float32Array([1.0, 0.0, 0.0]);	// Equator:    bright green
	  var botColr = new Float32Array([1.0, 1.0, 1.0]);	// South Pole: brightest gray.
	  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.
	
		// Create a (global) array to hold this sphere's vertices:
	  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
											// # of vertices * # of elements needed to store them. 
											// each slice requires 2*sliceVerts vertices except 1st and
											// last ones, which require only 2*sliceVerts-1.
											
		// Create dome-shaped top slice of sphere at z=+1
		// s counts slices; v counts vertices; 
		// j counts array elements (vertices * elements per vertex)
		var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
		var sin0 = 0.0;
		var cos1 = 0.0;
		var sin1 = 0.0;	
		var j = 0;							// initialize our array index
		var isLast = 0;
		var isFirst = 1;
		for(s=0; s<slices; s++) {	// for each slice of the sphere,
			// find sines & cosines for top and bottom of this slice
			if(s==0) {
				isFirst = 1;	// skip 1st vertex of 1st slice.
				cos0 = 1.0; 	// initialize: start at north pole.
				sin0 = 0.0;
			}
			else {					// otherwise, new top edge == old bottom edge
				isFirst = 0;	
				cos0 = cos1;
				sin0 = sin1;
			}								// & compute sine,cosine for new bottom edge.
			cos1 = Math.cos((s+1)*sliceAngle);
			sin1 = Math.sin((s+1)*sliceAngle);
			// go around the entire slice, generating TRIANGLE_STRIP verts
			// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
			//if(s==slices-1) isLast=1;	// skip last vertex of last slice.
			for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
				if(v%2==0)
				{				// put even# vertices at the the slice's top edge
								// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
								// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
					sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
					sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
					sphVerts[j+2] = cos0;		
					sphVerts[j+3] = 1.0;			
				}
				else { 	// put odd# vertices around the slice's lower edge;
								// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
								// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
					sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
					sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
					sphVerts[j+2] = cos1;																				// z
					sphVerts[j+3] = 1.0;																				// w.		
				}

				if(s<slices/2) {	// finally, set some interesting colors for vertices:
					sphVerts[j+4]=topColr[0]; 
					sphVerts[j+5]=topColr[1]; 
					sphVerts[j+6]=topColr[2];	
					}
				// else if(s==slices-1) {
				// 	sphVerts[j+4]=botColr[0]; 
				// 	sphVerts[j+5]=botColr[1]; 
				// 	sphVerts[j+6]=botColr[2];	
				// }
				else {
						sphVerts[j+4]= equColr[0];// Math.random()
						sphVerts[j+5]=equColr[1];//Math.random()
						sphVerts[j+6]=equColr[2];//Math.random()				
				}
			}
		}
	}

function makeCircle(){
	var j=Math.PI/180;
my_circle=new Float32Array([
	0.0, 0.0, 0.001, 1.0, 1, 1, 1,
	Math.sin(j),Math.cos(j), 0.001, 1.0,    1, 1, 1,
	Math.sin(10*j),Math.cos(10*j),0.001,1.0,    1, 1, 1,
	Math.sin(20*j),Math.cos(20*j),0.001,1.0,    1, 1, 1,
	Math.sin(30*j),Math.cos(30*j),0.001,1.0,    1, 1, 1,
	Math.sin(40*j),Math.cos(40*j),0.001,1.0,    1, 1, 1,
	Math.sin(50*j),Math.cos(50*j),0.001,1.0,    1, 1, 1,
	Math.sin(60*j),Math.cos(60*j),0.001,1.0,    1, 1, 1,
	Math.sin(70*j),Math.cos(70*j),0.001,1.0,    1, 1, 1,
	Math.sin(80*j),Math.cos(80*j),0.001,1.0,    1, 1, 1,
	Math.sin(90*j),Math.cos(90*j),0.001,1.0,    1, 1, 1,
	Math.sin(100*j),Math.cos(100*j),0.001,1.0,    1, 1, 1,
	Math.sin(110*j),Math.cos(110*j),0.001,1.0,    1, 1, 1,
	Math.sin(120*j),Math.cos(120*j),0.001,1.0,    1, 1, 1,
	Math.sin(130*j),Math.cos(130*j),0.001,1.0,    1, 1, 1,
	Math.sin(140*j),Math.cos(140*j),0.001,1.0,    1, 1, 1,
	Math.sin(150*j),Math.cos(150*j),0.001,1.0,    1, 1, 1,
	Math.sin(160*j),Math.cos(160*j),0.001,1.0,    1, 1, 1,
	Math.sin(170*j),Math.cos(170*j),0.001,1.0,    1, 1, 1,
	Math.sin(180*j),Math.cos(180*j),0.001,1.0,    1, 1, 1,
	Math.sin(190*j),Math.cos(190*j),0.001,1.0,    1, 1, 1,
	Math.sin(200*j),Math.cos(200*j),0.001,1.0,    1, 1, 1,
	Math.sin(210*j),Math.cos(210*j),0.001,1.0,    1, 1, 1,
	Math.sin(220*j),Math.cos(220*j),0.001,1.0,    1, 1, 1,
	Math.sin(230*j),Math.cos(230*j),0.001,1.0,    1, 1, 1,
	Math.sin(240*j),Math.cos(240*j),0.001,1.0,    1, 1, 1,
	Math.sin(250*j),Math.cos(250*j),0.001,1.0,    1, 1, 1,
	Math.sin(260*j),Math.cos(260*j),0.001,1.0,    1, 1, 1,
	Math.sin(270*j),Math.cos(270*j),0.001,1.0,    1, 1, 1,
	Math.sin(280*j),Math.cos(280*j),0.001,1.0,    1, 1, 1,
	Math.sin(290*j),Math.cos(290*j),0.001,1.0,    1, 1, 1,
	Math.sin(300*j),Math.cos(300*j),0.001,1.0,    1, 1, 1,
	Math.sin(310*j),Math.cos(310*j),0.001,1.0,    1, 1, 1,
	Math.sin(320*j),Math.cos(320*j),0.001,1.0,    1, 1, 1,
	Math.sin(330*j),Math.cos(330*j),0.001,1.0,    1, 1, 1,
	Math.sin(340*j),Math.cos(340*j),0.001,1.0,    1, 1, 1,
	Math.sin(350*j),Math.cos(350*j),0.001,1.0,    1, 1, 1,
	Math.sin(361*j),Math.cos(361*j),0.001,1.0,    1, 1, 1,
]);

}
function makeCircle2(){
	var j=Math.PI/180;
my_circle2=new Float32Array([
	Math.sin(j),Math.cos(j), 0.001, 1.0,    0, 0, 0,
	Math.sin(10*j),Math.cos(10*j),0.001,1.0,    0, 0, 0,
	Math.sin(20*j),Math.cos(20*j),0.001,1.0,    0, 0, 0,
	Math.sin(30*j),Math.cos(30*j),0.001,1.0,    0, 0, 0,
	Math.sin(40*j),Math.cos(40*j),0.001,1.0,    0, 0, 0,
	Math.sin(50*j),Math.cos(50*j),0.001,1.0,    0, 0, 0,
	Math.sin(60*j),Math.cos(60*j),0.001,1.0,    0, 0, 0,
	Math.sin(70*j),Math.cos(70*j),0.001,1.0,    0, 0, 0,
	Math.sin(80*j),Math.cos(80*j),0.001,1.0,    0, 0, 0,
	Math.sin(90*j),Math.cos(90*j),0.001,1.0,    0, 0, 0,
	Math.sin(100*j),Math.cos(100*j),0.001,1.0,    0, 0, 0,
	Math.sin(110*j),Math.cos(110*j),0.001,1.0,    0, 0, 0,
	Math.sin(120*j),Math.cos(120*j),0.001,1.0,    0, 0, 0,
	Math.sin(130*j),Math.cos(130*j),0.001,1.0,    0, 0, 0,
	Math.sin(140*j),Math.cos(140*j),0.001,1.0,    0, 0, 0,
	Math.sin(150*j),Math.cos(150*j),0.001,1.0,    0, 0, 0,
	Math.sin(160*j),Math.cos(160*j),0.001,1.0,    0, 0, 0,
	Math.sin(170*j),Math.cos(170*j),0.001,1.0,    0, 0, 0,
	Math.sin(180*j),Math.cos(180*j),0.001,1.0,    0, 0, 0,
	Math.sin(190*j),Math.cos(190*j),0.001,1.0,    0, 0, 0,
	Math.sin(200*j),Math.cos(200*j),0.001,1.0,    0, 0, 0,
	Math.sin(210*j),Math.cos(210*j),0.001,1.0,    0, 0, 0,
	Math.sin(220*j),Math.cos(220*j),0.001,1.0,    0, 0, 0,
	Math.sin(230*j),Math.cos(230*j),0.001,1.0,    0, 0, 0,
	Math.sin(240*j),Math.cos(240*j),0.001,1.0,    0, 0, 0,
	Math.sin(250*j),Math.cos(250*j),0.001,1.0,    0, 0, 0,
	Math.sin(260*j),Math.cos(260*j),0.001,1.0,    0, 0, 0,
	Math.sin(270*j),Math.cos(270*j),0.001,1.0,    0, 0, 0,
	Math.sin(280*j),Math.cos(280*j),0.001,1.0,    0, 0, 0,
	Math.sin(290*j),Math.cos(290*j),0.001,1.0,    0, 0, 0,
	Math.sin(300*j),Math.cos(300*j),0.001,1.0,    0, 0, 0,
	Math.sin(310*j),Math.cos(310*j),0.001,1.0,    0, 0, 0,
	Math.sin(320*j),Math.cos(320*j),0.001,1.0,    0, 0, 0,
	Math.sin(330*j),Math.cos(330*j),0.001,1.0,    0, 0, 0,
	Math.sin(340*j),Math.cos(340*j),0.001,1.0,    0, 0, 0,
	Math.sin(350*j),Math.cos(350*j),0.001,1.0,    0, 0, 0,
	Math.sin(361*j),Math.cos(361*j),0.001,1.0,    0, 0, 0,
]);

}
function makeCircle2(){
	var j=Math.PI/180;
my_circle2=new Float32Array([
	Math.sin(j),Math.cos(j), 0.001, 1.0,    0, 0, 0,
	Math.sin(10*j),Math.cos(10*j),0.001,1.0,    0, 0, 0,
	Math.sin(20*j),Math.cos(20*j),0.001,1.0,    0, 0, 0,
	Math.sin(30*j),Math.cos(30*j),0.001,1.0,    0, 0, 0,
	Math.sin(40*j),Math.cos(40*j),0.001,1.0,    0, 0, 0,
	Math.sin(50*j),Math.cos(50*j),0.001,1.0,    0, 0, 0,
	Math.sin(60*j),Math.cos(60*j),0.001,1.0,    0, 0, 0,
	Math.sin(70*j),Math.cos(70*j),0.001,1.0,    0, 0, 0,
	Math.sin(80*j),Math.cos(80*j),0.001,1.0,    0, 0, 0,
	Math.sin(90*j),Math.cos(90*j),0.001,1.0,    0, 0, 0,
	Math.sin(100*j),Math.cos(100*j),0.001,1.0,    0, 0, 0,
	Math.sin(110*j),Math.cos(110*j),0.001,1.0,    0, 0, 0,
	Math.sin(120*j),Math.cos(120*j),0.001,1.0,    0, 0, 0,
	Math.sin(130*j),Math.cos(130*j),0.001,1.0,    0, 0, 0,
	Math.sin(140*j),Math.cos(140*j),0.001,1.0,    0, 0, 0,
	Math.sin(150*j),Math.cos(150*j),0.001,1.0,    0, 0, 0,
	Math.sin(160*j),Math.cos(160*j),0.001,1.0,    0, 0, 0,
	Math.sin(170*j),Math.cos(170*j),0.001,1.0,    0, 0, 0,
	Math.sin(180*j),Math.cos(180*j),0.001,1.0,    0, 0, 0,
	Math.sin(190*j),Math.cos(190*j),0.001,1.0,    0, 0, 0,
	Math.sin(200*j),Math.cos(200*j),0.001,1.0,    0, 0, 0,
	Math.sin(210*j),Math.cos(210*j),0.001,1.0,    0, 0, 0,
	Math.sin(220*j),Math.cos(220*j),0.001,1.0,    0, 0, 0,
	Math.sin(230*j),Math.cos(230*j),0.001,1.0,    0, 0, 0,
	Math.sin(240*j),Math.cos(240*j),0.001,1.0,    0, 0, 0,
	Math.sin(250*j),Math.cos(250*j),0.001,1.0,    0, 0, 0,
	Math.sin(260*j),Math.cos(260*j),0.001,1.0,    0, 0, 0,
	Math.sin(270*j),Math.cos(270*j),0.001,1.0,    0, 0, 0,
	Math.sin(280*j),Math.cos(280*j),0.001,1.0,    0, 0, 0,
	Math.sin(290*j),Math.cos(290*j),0.001,1.0,    0, 0, 0,
	Math.sin(300*j),Math.cos(300*j),0.001,1.0,    0, 0, 0,
	Math.sin(310*j),Math.cos(310*j),0.001,1.0,    0, 0, 0,
	Math.sin(320*j),Math.cos(320*j),0.001,1.0,    0, 0, 0,
	Math.sin(330*j),Math.cos(330*j),0.001,1.0,    0, 0, 0,
	Math.sin(340*j),Math.cos(340*j),0.001,1.0,    0, 0, 0,
	Math.sin(350*j),Math.cos(350*j),0.001,1.0,    0, 0, 0,
	Math.sin(361*j),Math.cos(361*j),0.001,1.0,    0, 0, 0,
]);

}
function makeTet(){
	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);			
my_tetrahedron=new Float32Array([
		// 	// Face 0: (right side)  
		// 	0.0,	 0.0, sq2, 1.0,		0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
		// 	c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
		// 	0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
		// 		   // Face 1: (left side)
		// 		0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
		// 	0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
		//    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
		// 	   // Face 2: (lower side)
		// 		0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue) 
		//    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
		// 	c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red) 
		// 		// Face 3: (base side)  
		//    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
		// 	0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
		// 	c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
		//left_ear_part1
	  //left side
	  -0.125, 0.15, -0.125, 1.00,	0,0,1, //2
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, 0.125, 1.00,  1,0,0,	//3
	  -0.125, 0.15, 0.125, 1.00,   1,0,0,	//3
	  -0.125, -0.10, -0.125, 1.00, 225/255, 151/255, 32/255, 	 //1
	  -0.125, -0.10, 0.125, 1.00,   0,1,0,  //4
	  
	  //base side
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, -0.125, 1.00,	0,0,1,   //2
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  //front side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, 0.125, 1.00,  1,0,0,	//3
	  -0.125, -0.10, 0.125, 1.00,     0,1,0,	  //4
	  //upper side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, -0.125, 1.00,	0,0,1,    //2
	  -0.125, 0.15, 0.125, 1.00,   1,0,0,	//3
	  //lower side
	  -0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  -0.125, -0.10, 0.125, 1.00,  0,1,0,	 //4
]);
}

function makeCube(){
	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);			
my_cube=new Float32Array([
		// 	// Face 0: (right side)  
		// 	0.0,	 0.0, sq2, 1.0,		0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
		// 	c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
		// 	0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
		// 		   // Face 1: (left side)
		// 		0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
		// 	0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
		//    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
		// 	   // Face 2: (lower side)
		// 		0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue) 
		//    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
		// 	c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red) 
		// 		// Face 3: (base side)  
		//    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
		// 	0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
		// 	c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
	  //left_ear_part1
	  //left side
//my cube part I(36)
		   //upper side
		   0.0, 0.5, 0.0, 1.0,		0.0, 	0.0,	1.0,
		   0.0, 0.5, 0.5, 1.0,		0.0, 	0.0,	1.0,
		   0.5, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.0, 1.0,		0.0, 	0.0,	1.0,
		   0.0, 0.5, 0.5, 1.0,		0.0, 	0.0,	1.0,
		   0.5, 0.5, 0.5, 1.0,		0.0, 	1.0,	1.0,
		   //base
			0.0,  0.0, 0.0, 1.0,		0.0, 	1.0,	1.0,
			0.5,  0.0, 0.0, 1.0,			0.0, 	1.0,	1.0,
			0.0, 0.0, 0.5, 1.0,	        0.0, 	0.0,	1.0,
			0.0, 0.0, 0.5, 1.0,  		0.0, 	1.0,	1.0,
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,	
			0.5,  0.0, 0.5, 1.0,		1,0,0,
		   //left
		   0.0, 0.0, 0.0, 1.0,		0.0, 	0.0,	1.0,
		   0.0, 0.0, 0.5, 1.0,		0.0, 	1.0,	1.0,
		   0.0, 0.5, 0.0, 1.0,		0.0, 	0.2,	1.0,
		   0.0, 0.5, 0.0, 1.0,	    1.0, 	1.0,	0.0,
		   0.0, 0.0, 0.5, 1.0,		0.0, 	1.0,	1.0,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //right
			0.5,  0.0, 0.0, 1.0,		250/255,4/255,29/255,
			0.5,  0.5, 0.0, 1.0,		20/255,214/255,29/255,
			0.5, 0.0, 0.5, 1.0,		50/255,24/255,29/255,
			0.5, 0.0, 0.5, 1.0,  		2/255,24/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,21/255,29/255,
			0.5,  0.5, 0.5, 1.0,		250/255,2/255,229/255,
		   //front
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,219/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,229/255,
		   0.5, 0.5, 0.5, 1.0,		220/255,214/255,249/255,
		   0.0, 0.0, 0.5, 1.0,		210/255,24/255,29/255,
		   0.5, 0.0, 0.5, 1.0,		20/255,22/255,29/255,
		   //back
			0.0,  0.5, 0.0, 1.0,		250/255,214/255,219/255,
			0.5,  0.5, 0.0, 1.0,		230/255,24/255,230/255,
			0.0, 0.0, 0.0, 1.0,		230/255,224/255,29/255,
			0.0, 0.0, 0.0, 1.0, 		220/255,244/255,22/255,
			0.5,  0.5, 0.0, 1.0,		220/255,224/255,211/255,
			0.5,  0.0, 0.50, 1.0,		210/255,224/255,220/255,


]);

}

function Drawhourglass(){
	Drawhourglass_partI();
	Drawhourglass_partII();

}




function Drawpokeball(){
Drawpokeball_partI();
Drawpokeball_partII();
Drawpokeball_partIII();
}
function Drawhouse(){

Drawhouse_partI();
Drawhouse_partII();

}