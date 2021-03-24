---
title: Raycaster Simplified - C++
---
> [!WARNING]
> This article is heavily WIP
My goal with this article is to abstract the concepts of a raycaster away from the noisy mathamatics that drive the implementation. Taking a step back and learning the ideas will give us the ability to easily apply these concepts to future works. 
## The Basics
A raycaster begins with the ray, which is a line that only has a **starting point** and a **direction**.
## Creating Primatives
To begin, we will need to create some to actually render... 
### Sphere

### Plane
## Lights
## Shadows
## Transformations
Matricies! Inverting them is unintutive but quickly reverts them. For a transformation matrix M which transforms some vector a to position v, then to get a matrix which transforms some vector v to a we just multiply by M−1
Rodriguez's Formula
