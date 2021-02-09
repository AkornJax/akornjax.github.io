#version 300 es
precision mediump float;

// our textures
uniform sampler2D u_image0;
uniform sampler2D u_image1;
uniform float shininess;
uniform float image01Opacity;
uniform float image02Opacity;

//For light
uniform vec2 u_lightIntensity;
uniform vec3 u_lightColor;
uniform vec2 u_lightPosition;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;


//https://stackoverflow.com/questions/32851529/drawing-2d-lights-using-shaders
void main() {
    vec4 color0 = texture2D(u_image0, v_texCoord) * image01Opacity;
    vec4 color1 = texture2D(u_image1, v_texCoord) * image02Opacity;

//custom normalize
vec3 generatedNormal = vec3(((2.0 * color0.r) - 1.0),((2.0 * color0.b) - 1.0),((2.0 * color0.g) - 1.0));

//light

//mp - mouse position
//   vec2 mp = vec2(u_lightPosition.x / resolution.x, 1.0 - u_lightPosition.y / resolution.y);
// Vector from the current pixel to the light
vec3 toLight = vec3((u_lightPosition - v_texCoord), 0);

    vec3 pixelcolor = color0.xyz;
    vec3 lightcolor = vec3(1, 0.83, 0.63);
    // Vector from the current pixel to the light oi9u_lightPosition - v_texCoord), 0);

    // This computes how much is the pixel lit based on where it faces
    float brightness = clamp(dot(normalize(toLight), pixelcolor), 0.0, 1.0);

    // If it faces towards the light it is lit fully, if it is perpendicular
    // to the direction towards the light then it is not lit at all.
    float lightradius = 10.0;
    // This reduces the brightness based on the distance form the light and the light's radius
    brightness *= clamp(1.0 - (length(toLight) / lightradius), 0.0, 1.0);
    // The final color of the pixel.
    vec3 finalcolor = pixelcolor * normalize(toLight) * brightness;
    // If you have multiple lights multiply the pixel's color by the combined color of all lights
    // like:
//  finalcolor = pixelcolor * (lightcolor1 * brightness1 + lightcolor2 * brightness2);

// Note that some things are clamped to avoid going into negative values

// gl_FragColor =   color0 * vec4(1,1) * dot(color1, vec2(1, 1));
    gl_FragColor =   color0;
//  gl_FragColor =   color * lightEnergy * dot(normalVector, lightVector);

// gl_FragColor = vec4(.4,.4,.4,.4);
}