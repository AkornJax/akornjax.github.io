"use strict";

/** Variables to be modified at runtime */
var shiny = .5;
var darkImageOpacity = .5;
var lightImageOpacity = .5;
var normalImageOpacity = .5;

var lightIntensity = .5;
var lightColor = new Float32Array(3);
var normalsExist = false;
var multiply = false;
var overlay = false;
var mousePosition = new Float32Array(2);

// Get A WebGL context
/** @type {HTMLCanvasElement} */
var canvas = document.querySelector("#canvas");
var gl = canvas.getContext("webgl2");
// setup GLSL program
var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
gl.useProgram(program);
//images variable to hold the images
var images;
var u_imageDarkLocation;
var u_imageLightLocation;
var u_imageNormalLocation;
var textures;

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;

  // Called each time an image finished
  // loading.
  var onImageLoad = function() {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad === 0) {
      callback(images);
    }
  };

  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}

function init(imgs) 
{
  images = imgs;
  
  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // create 2 textures
  textures = [];
  for (var ii = 0; ii < 3; ++ii) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

    // add the texture to the array of textures.
    textures.push(texture);
  }
  /** Would only need to be done if I were changing textures/images */
  // lookup the sampler locations.
  u_imageDarkLocation = gl.getUniformLocation(program, "u_imageDark");
  u_imageLightLocation = gl.getUniformLocation(program, "u_imageLight");
  u_imageNormalLocation = gl.getUniformLocation(program, "u_imageNormal");
  // set which texture units to render with.
  gl.uniform1i(u_imageDarkLocation, 0);  // texture unit 0
  gl.uniform1i(u_imageLightLocation, 1);  // texture unit 1
  gl.uniform1i(u_imageNormalLocation, 2);  // texture unit 1
  
  /**Things that need to be done to redraw */
  update();

  /** Needs to be done after setting variables */
  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

}
function getRelativeMousePosition(event, target) {
  target = target || event.target;
  var rect = target.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

// assumes target or event.target is canvas
function getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
  target = target || event.target;
  var pos = getRelativeMousePosition(event, target);

  pos.x = pos.x * target.width  / target.clientWidth;
  pos.y = pos.y * target.height / target.clientHeight;

  return pos;  
}

function update()
{   
  const darkOpacity_Loc = gl.getUniformLocation(program, "f_darkImageOpacity");
  const lightOpacity_Loc = gl.getUniformLocation(program, "f_lightImageOpacity");
  const normalOpacity_Loc = gl.getUniformLocation(program, "f_normalImageOpacity");
  const u_lightPosition_Loc = gl.getUniformLocation(program, "u_lightPosition");
  const u_lightIntensity_Loc = gl.getUniformLocation(program, "u_lightIntensity");
  const u_lightColor_Loc = gl.getUniformLocation(program, "u_lightColor");
  
  //set variables in shaderes
  gl.uniform1f(darkOpacity_Loc, darkImageOpacity);
  gl.uniform1f(lightOpacity_Loc, lightImageOpacity);
  gl.uniform1f(normalOpacity_Loc, normalImageOpacity);
 
 // console.log(mousePosition);
  gl.uniform2fv(u_lightPosition_Loc, mousePosition);    
  gl.uniform1f(u_lightIntensity_Loc, lightIntensity);    
  //gl.uniform3fv(u_lightColor_Loc, lightColor);    //need to make color slider
  
  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  // Set a rectangle the same size as the image. (When image is loaded)
  if(images == null)
    return
    //hm
  setRectangle(gl, 0, 0, images[0].width, images[0].height);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);



  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // bind the texcoord buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset);

  // Set each texture unit to use a particular texture.
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, textures[2]);
  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  }
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}

var dark = "/assets/img/project01Images/cara-dark.png";
var light = "/assets/img/project01Images/cara-light.png";
var normal = "/assets/img/project01Images/cara-normal.png";

function updateNow()
{
  update();
}

function main() {
  loadImages([
    dark,
    light,
    normal,
  ], init);

  updateNow();
  }
 


main();
