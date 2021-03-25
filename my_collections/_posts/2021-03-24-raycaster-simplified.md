---
title: Raycaster Simplified - C++
---
> [!WARNING]
> This article is heavily WIP

My goal with this article is to abstract the concepts of a raycaster away from the noisy mathamatics that drive the implementation. Taking a step back and learning the ideas will give us the ability to easily apply these concepts to future works. 
## The Basics
### Ray
A raycaster begins with the ray, which is a line that only has a **starting point** and a **direction**. The primary rays that we will be shooting from our camera will be in charge of detecting intersections within our virtual world and subsequently returning a pixel color.
### Camera
Your camera is your "eye" into this virtual world that you're creating. A perspective camera requires an "eye" and the render plane, while an orthographic camera would only need the render plane.
Quick example: If we are making a 600px by 600px window, then we will be shooting out 360,000 (600 * 600) rays from the render plane! 
## Creating Primatives
To begin, we will need to create some to actually render... 
### Sphere

### Plane
## Lights
### Point 
### Spot
### Area

## Shadows
Ultimately, a shadow is detected by doing one extra calculation per ray. This calculation will take the point of intersection and compare its visibilty to all light sources in the scene. Think of this as if the sun is setting and your watching it fall beneath the horizon; the direction of your sight will be the shadow vector and the sun is the light. You would be able to tell if you were in shadow, right? It's the same idea!
## Transformations
Matricies! Inverting them is unintutive but quickly reverts them. For a transformation matrix M which transforms some vector a to position v, then to get a matrix which transforms some vector v to a we just multiply by M−1
Rodriguez's Formula
