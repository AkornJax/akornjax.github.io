"use strict";

/** Variables to be modified at runtime */
var shiny = .5;
var darkImageOpacity = 1;
var lightImageOpacity = 1;
var normalImageOpacity = 1;

var lightIntensity = 1;
var lightColor = new Float32Array(3);
var normalsExist = false;
var multiply = false;
var overlay = false;
var mousePosition = new Float32Array(3);

// Get A WebGL context
/** @type {HTMLCanvasElement} */
var canvas = document.querySelector("#canvas");
var gl = canvas.getContext("webgl2");
canvas.width = 400;
canvas.height = 700;

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


  function render(images) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
  
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }
  
    // setup GLSL program
    program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);
  
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
  
    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();
  
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
  
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
    var image = images['bright'].Image;
  
    var rectangleHeight = gl.canvas.height;
    var rectangleWidth = (image.width/image.height) * gl.canvas.height;
    var rectanglePosX = gl.canvas.width/2 - rectangleWidth/2;
    var rectanglePosY = 0;
  
    setRectangle(gl, rectanglePosX, rectanglePosY, rectangleWidth, rectangleHeight);
  
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
  
  
    // ------------------------------------------------------------------------------------- //
  
    var texturesNum = Object.keys(images).length;
    for (var key in images) {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
  
      if(key == 'normal_map') {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);  
      }  else {
        // Set the parameters so we can render any size image.
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
      // Upload the image into the texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[key].Image);
  
      // add the texture to the array of textures.
      images[key].Texture = texture;
    }
  
  
    for(var key in images) {
      images[key].UniformLoc = gl.getUniformLocation(program, "u_" + key);
    }
  
    // ------------------------------------------------------------------------------------- //
  
    // // Create a texture.
    // var texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // // Set the parameters so we can render any size image.
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
    // // Upload the image into the texture.
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
    // lookup uniforms
    resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  
    // lookup mouse 
    mouseLocation = gl.getUniformLocation(program, "u_mouse");
  
    // lookup ifUseVectorField
    ifuseVectorFieldLocation = gl.getUniformLocation(program, "u_ifUseVectorField");
  
    interpolateDistanceLoc = gl.getUniformLocation(program, "u_interpolateDistance");
  
    indexOfRefractionLoc = gl.getUniformLocation(program, "u_index_of_refraction");
  
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
  
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
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);
  
    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);
  
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);
  
    // --------------------------------------------------------------------------------- //
    var i = 0;
    for(var key in images) {
      gl.uniform1i(images[key].UniformLoc, i);
      i++;
    }
  
    i = 0;
    for(var key in images) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, images[key].Texture);
      i++;  
    }
    //----------------------------------------------------------------------------------- //
  
    animateScene();
  }
  
  function animateScene() {
    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  
    gl.uniform2f(mouseLocation, mousex * 1.0 / gl.canvas.width, mousey * 1.0 / gl.canvas.height);
  
    gl.uniform1i(ifuseVectorFieldLocation, ifUseVectorField);
  
    gl.uniform1f(interpolateDistanceLoc, interpolateDistance);
  
    gl.uniform1f(indexOfRefractionLoc, indexOfRefraction);
  
    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  
    requestAnimationFrame(animateScene);
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
  

  
  function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url)).origin !== window.location.origin) {
      img.crossOrigin = "";
    }
  }

  var dark = "/assets/img/project01Images/cara-dark.png";
  var light = "/assets/img/project01Images/cara-light.png";
  var normal = "/assets/img/project01Images/cara-normal.png";
  
  function main() {
    loadImages([
      dark,
      light,
      normal,
    ], init);
  
    updateNow();
    }
   
  
  
  main();