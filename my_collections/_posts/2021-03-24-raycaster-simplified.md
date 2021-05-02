---
title: Raycaster Simplified - C++
---
> [!WARNING]
> This article is heavily WIP

> [!NOTE]
> Will eventually use http://sangsoonam.github.io/2019/01/20/syntax-highlighting-in-jekyll.html to color code

My goal with this article is to abstract the concepts of a raycaster away from the noisy mathamatics that drive the implementation. Taking a step back and learning the ideas will give us the ability to easily apply these concepts to future works. Any examples of implementation will be C++ focused and peripherials such as window creation are ignored, as I simply utilized basic OpenGL for those portions. 
- [Materials](#materials)
  - [Reflection](#reflection)
  - [Refraction](#refraction)
  - [Texture Mapping](#texture-mapping)
  - [Triangle Meshes](#triangle-meshes)
  - [Distributed Raytracer](#distributed-raytracer)
    - [Aliasing](#aliasing)
      - [Temporal Aliasing](#temporal-aliasing)
      - [Antialiasing](#antialiasing)
    - [Distributed Raytracing](#distributed-raytracing)
      - [Motion Blur](#motion-blur)
      - [Out-Of-Focus / DOF](#out-of-focus--dof)
      - [Gloss](#gloss)
      - [Translucency](#translucency)
    - [Final Gathering](#final-gathering)
  - [Lazy/Quick Implementation](#lazyquick-implementation)
    - [Cons](#cons)
  - [Better Implementation](#better-implementation)

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

# Materials
## Reflection
Reflection is simple to implement, with everything else set up correctly. The idea with reflection is that we're going to recursively iterate through Rays, starting with our initial ray, coming from the `image plane`, then continuing with `Ray(hit_position, reflected_direction)`. We definitely need to watch our for an infinite loop, so make sure you can control the amount of `steps` for the raytrace to go. Ultimately, we're using all the same framework just casting new rays from the recursively discovered locations then simply adding the new result to our `final_color`. Here is how your code to integrate reflections would possibly look:
```cpp
for(int i = 0, i < steps, i++){
  //check if ray hits
  Intersection intersection_info; //Intersected obj, intersect distance, etc...
  bool hit = CheckForIntersection(incoming_ray, intersection_info);
  if(hit){
    final_color += GetColorAtPoint(intersection_info)
    if(intersection_info.GetShape().GetMaterial().IsReflective()){
      //Calculate reflection direction
      ray_direction = -current_ray.GetDirection();
      reflection_direction = -ray_direction + 2.0f * dot(ray_direction, normal) * normal;
      //Change the incoming_ray to the newly reflected ray and continue
      incoming_ray = Ray(intersection_info.GetHitPoint(), reflection_direction)
    }
    else{
      //We can end our recursive stepping by breaking out of the loop
      break;
    }
  }
  else{
    final_color = background_color;
  }
}
```
## Refraction
## Texture Mapping
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

## Distributed Raytracer
### Aliasing
Because we are simply sending out a single ray from the center of each pixel, we don't have beautiful, smooth edges. This effect of jagged pixels is called **aliasing**. Sampling "the shape" higher than the **Nyquist frequency** allows us to avoid aliasing. The **Nyquist frequency** is a characteristic of a sampler (our raycaster which *samples* pixels) that converts a continuous function/signal into a discrete (enumerable) sequence. Because we have a high frequency of data, we'll need to sample at a higher rate to avoid losing information that should be in the signal. In general, you want to sample at *twice* the maximum frequency of the signal, known as the **Nyquist rate**.
#### Temporal Aliasing
Aliasing caused by sampling over time: the temporal domain. This commonly is referred to as the "Wagon Wheel Effect". Sometimes this can be a desired effect, but not in our case!
#### Antialiasing
The "anti" comes from our efforts to remove this unwanted effect from our render engines. The quickest and simplest way to implement some **antialiasing** in our ray caster is to have random jittered samples per pixel, the same technique we're using for our area lights.
### Distributed Raytracing
This approach is similar to our previous random jitter approaches, but this method will remove **temporal aliasing** and obtain out-of-focus effects caused by lenses.
1. Obtain a pixel region
2. Treat the pixel region as a window
3. Subdivide the pixel region
4. Obtain the subpixel region
#### Motion Blur
Haha not sure about yet. 
#### Out-Of-Focus / DOF
To achieve this effect we will specify a focus distance, `focus_distance`, along a our usual Camera ray. That point will then be used to alter the directions of the randomly distributed rays on the pixel region. The rays will converge at the focal point, so any rays hitting before and after the point will be spread out causing our blur effect! 
#### Gloss
Gloss is just blurred reflection. The blurring can probably be creating using our sub-pixel region logic, **but** a much easier approach is to simply randomly distribute the reflecting ray. The max of this random distribution will control how glossy the object will look. 
#### Translucency 
Virtually the same as gloss, except this time we're blurring the refraction of the rays. Again, you can use either the sub-pixel logic or randomly distributing the refracted ray.


### Final Gathering
Final gathering allows us to obtain four unique effects.
For these imagine we have a textured (although it's white for Ambient Occlusion), infinite sphere. We shoot rays from the *first* shading point. If they intersect with an object, we choose black, otherwise we choose white. 
> [!NOTE] It's a good idea to make sure your new **gathering** rays have a distance at which they die, that way your objects aren't being occluded/influenced by objects that are miles away!

| Effect                   | Intersection            | No Intersection          |
| Ambient Occlusion        | Black                   | White                    |
| Environment Illumination | Black                   | Color of Infinite Sphere |
| Color Bleeding           | Diffuse Color | Color of Infinite Sphere |
| Caustics                 | Compute Refractive or Specular | Color of Infinite Sphere |

## Lazy/Quick Implementation
With this implementation we will simply be adding a random vector, and with multiple samples, average to get our result.
1. Calculate the normalized direction of our **gathering** vector `G_i`
   1. `G_i = length(N_i + randomUnitVector());`
2. Compute `C_i` (color at intersection of `P_h`)
3. Shoot ray from `G_i` 
4. Compute weight of ray
   1. `G_w = dot(N_i, G_i);`
5. Compute weighted color
   1. `C_w = G_w * C_i;`
6. Compute final color to get weighted average of colors
   1. `final_color = C_w / G_w;`

### Cons
We most likely won't accurately portray the space without excessive sampling. Additionally, this could result in supersampling noise.
## Better Implementation
Use directions provided by a *guide shape*. Some recommended shapes:
- Parameteric Hemisphere
- Subdivided Hemicube
- Geodesic Domes
We're going to use these shapes as guides to distribute our samples, as opposed to trust a sequence of random vectors to do an even job. 
