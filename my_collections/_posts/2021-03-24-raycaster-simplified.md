---
title: Raycaster Simplified - C++
---
> [!WARNING]
> This article is heavily WIP

My goal with this article is to abstract the concepts of a raycaster away from the noisy mathamatics that drive the implementation. Taking a step back and learning the ideas will give us the ability to easily apply these concepts to future works. Any examples of implementation will be C++ focused and peripherials such as window creation are ignored, as I simply utilized basic OpenGL for those portions. 
- [The Basics](#the-basics)
  - [Raycaster Structure](#raycaster-structure)
  - [Ray](#ray)
  - [Camera](#camera)
- [Creating Primatives](#creating-primatives)
  - [Sphere](#sphere)
  - [Plane](#plane)
- [Lights](#lights)
  - [Point](#point)
  - [Spot](#spot)
  - [Area](#area)
- [Shadows](#shadows)
  - [Avoiding Self-Shadowing](#avoiding-self-shadowing)
- [Transformations](#transformations)
- [Texture Mapping](#texture-mapping)
  - [The Basic Idea](#the-basic-idea)
- [Triangle Meshes](#triangle-meshes)

## The Basics
### Raycaster Structure
This will be a template for your raycaster to follow. Simply use it as a suggestion or a frame of reference when reading the article!
```
-main.cpp
-Ray.h // The building block of our implementation
-Camera.h // Our looking glass
-Object.h // Points at which rays will intersect, alongside some descriptive attributes
    -Sphere.h
    -Plane.h
-Light.h // Illuminate our world, make it feel less CG
    -Area.h
    -Point.h
    -Spot.h
-Material.h
```
### Ray
A raycaster begins with the ray, which is a line that only has a **starting point** and a **direction**. The primary rays that we will be shooting from our camera will be in charge of detecting intersections within our virtual world and subsequently returning a pixel color.
### Camera
Your camera is your **eye** into this virtual world that you're creating. A perspective camera requires an **eye** and the render plane, while an orthographic camera would only need the render plane.
Quick example: If we are making a 600px by 600px window, then we will be shooting out 360,000 (600 * 600) rays from the render plane! 
## Creating Primatives
To begin, we will need to create some to actually render... Primatives are representations of mathamatical models within the 3-Dimensional space that we're creating.
### Sphere
The ray will intersect the sphere using the equation `insert equation here` and then will return the **diffuse color** assigned. 
### Plane
## Lights
Lights quickly make your computer go brrrrr, this is due to their costly implementation! Lights will be the beginning of our journey to follow a ray and gather data past the initial intersection. We'll now be able to compute the **diffuse intensity** of our pixel! No more flat shading, but note that we're not to casting shadows yet. 
### Point 
### Spot
### Area

## Shadows
Ultimately, a shadow is detected by doing one extra calculation per ray. This calculation will take the point of intersection and compare its visibilty to all light sources in the scene. Think of this as if the sun is setting and your watching it fall beneath the horizon; the direction of your sight will be the shadow vector and the sun is the light. You would be able to tell if you were in shadow, right? It's the same idea! 
### Avoiding Self-Shadowing
You may notice some weird "freckling", this is caused by that previously mentioned shadow ray immediately intersecting with our geometry, typically this is simply due to the behind-the-scenes rounding that happens. To prevent this, we simply shift the hit point `P_h` some small distance `t` in the direction of the surface normal `N_h`. Giving us a simple `P'= P_h + t * N_h`.  
## Transformations
Matricies! Inverting them is unintutive but quickly reverts them. For a transformation matrix M which transforms some vector a to position v, then to get a matrix which transforms some vector v to a we just multiply by M−1
Rodriguez's Formula

## Texture Mapping
### The Basic Idea
Take the hit point `P_h` then using a mapping equation, unique to the primitive that has been hit, you solve to find the `u` and `v` of the **texture coordinates**. These values have a max of `1` and a min of `0`. They are then converted to **image coordinates** by multiplying the **texture coordinates** by the texture image size. 
```
float X = u * X_max;
float Y = v * Y_max
```
We then compute the pixel of the `X,Y` **image coordinates** by simply converting it from a `float` to an `integer`.
```
I = (int) X;
J = (int) Y;
```
Then, we compute the position of the point within the pixel `I,J`:
```
i = X - I;
j = Y - J;
```
Then lastly, we compute the final color by using **billinear interpolation**:
```
C = C_IJ (1−i)(1−j) + C_I1_J i(1−j) + C_I1_J1(i)(j) + C_I_J1 (1−i)(j)
```
You may be wondering, well how do I get the colors `C_IJ`, `C_I1_J`, `C_I1_J1`, and `C_I_J1`? These are the pixel colors that are found when looking at pixel `I,J`, `I+1,J`, `I+1,J+1`, and `I,J+1`. So we're sampling the nearby pixels, then combining them based off the weighted values `i,j` that represent the position of the point within the pixel.

## Triangle Meshes
Triangles are how we're going to start including the REALLY cool shapes into our raytracer. Since we're going to eventually have over 9000 triangles in our scene, we might as well go ahead and make a class to easy manage all the information, just like we've done with `Ray.h`, we'll make `Triangle.h`. This class will simply store the three locations of its corners and provide us with easy access to its normal property with `glm::vec3 LocalNormalAt(){};`.