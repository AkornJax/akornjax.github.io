"use strict";

/** Variables to be modified at runtime */
var shiny = .5;

var lightIntensity = 1;
var lightColor = new Float32Array(3);
var normalsExist = false;
var multiply = false;
var overlay = false;
var mousePosition = new Float32Array(3);


// Image source: https://commons.wikimedia.org/wiki/File:Normal_map_example_-_Map.png
var imgURL;

var canvas, gl, program, image, resolutionLocation, mouseLocation, transparencyLoc, transparency;
var  mousex, mousey = 0;
var interpolateDistanceLoc, interpolateDistance;
var indexOfRefractionLoc;
var indexOfRefraction = 1.0;

var num_images;

var images_list;

var current_index, total_images;

function cartoonEffect(newValue) {
  var paramCartoon = parseInt(newValue);
  interpolateDistance = 0.5 - paramCartoon/100.0;
}

function changeIOR(newValue) {
  var paramIOR = (parseInt(newValue) - 100)/100;
  indexOfRefraction = Math.pow(2, paramIOR);
}


function main() {
  images_list = [{'bright' : {url : '/assets/img/testbackground.png', Image : null},
                    'dark' : {url : '/assets/img/foreground.png', Image : null},
                    'normal_map' : {url : '/assets/img/project01Images/cara-normal.png', Image : null},
                    'haha_color' : {url : '/assets/img/cara-cutout.png', Image : null}
                  }];
  current_index = 0;
  interpolateDistance = 0.2;
  mousex = 5;
  mousey = 5;
  //Init effects
  cartoonEffect(document.getElementById("fresnelSlider").value);
  changeIOR(document.getElementById("iorSlider").value);
  transparency = 0;
  loadImages(images_list[0], render);
}

function loadImage(url, callback) {
  console.log(url);
  var image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(m_images, callback) {
  // var images = [];
  var imagesToLoad = Object.keys(m_images).length;

  // Called each time an image finished loading.
  var onImageLoad = function() {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad == 0) {
      callback(m_images);
    }
  };

  for (var image_i in m_images) {
    var image = loadImage(m_images[image_i].url, onImageLoad);
    m_images[image_i].Image = image;
  }
}



function render(images) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */

  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
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

  var image = images['normal_map'].Image;

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

  for (var key in images) {
    var texture = gl.createTexture();
    
    //Declare new space for texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[key].Image);
    if(key == 'normal_map' || key == 'haha_color') {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER);
   
    }  else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // add the texture to the array of textures.
    images[key].Texture = texture;
  }

  for(var key in images) {
    images[key].UniformLoc = gl.getUniformLocation(program, "u_" + key);
  }

  // ------------------------------------------------------------------------------------- //

  resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  mouseLocation = gl.getUniformLocation(program, "u_mouse");
  interpolateDistanceLoc = gl.getUniformLocation(program, "u_interpolateDistance");
  indexOfRefractionLoc = gl.getUniformLocation(program, "u_index_of_refraction");
  transparencyLoc = gl.getUniformLocation(program, "u_transparency");

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

  gl.uniform1f(interpolateDistanceLoc, interpolateDistance);

  gl.uniform1f(transparencyLoc, transparency);

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

main();

function updateMouse(e) {
  mousex = e.clientX;
  mousey = e.clientY;

  mousex = (mousex - gl.canvas.width/2);
  mousey = -1.0 * (mousey - gl.canvas.height/2);
}
