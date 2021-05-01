---
title: Image Synthesis Tips & Tricks
---

I personally found it really difficult jumping into this class without any guidance on how to start my raycaster project. With this FAQ-styled article, I'm hoping you'll feel a lot more comfortable getting into the thick of it. 

# Should I use C++?
I was pretty inexperienced with C++ when I made the decision to make my raycaster with it. It was infuriating to have late nights debugging memory allocation errors before I was even able to attempt implementation of ray caster concepts. So if you want a challenge or have been looking for a reason to learn C++, then yes I recommend it, but know it comes at the cost of spending 2x or 3x more time on the challenges. Otherwise, there are much simpler languages that you could use such as Python or C# (they're simpler because you don't have to worry about the everpresent issue of memory management).
Also getting your program set up initially, using the correct libs and dlls is a pain in the butt for even the most experienced developers. So if possible, try to find someone experienced to help you get set up!

# Is OpenGL helpful for this project?
Short answer: No. Long answer: For the life of me I couldn't figure out as to why my TA kept telling me that it wouldn't be helpful. It's 3D graphics from scratch, right? I kept flipping between the wonderful website https://learnopengl.com/ and the syllabus for the class and couldn't understand how it wouldn't help me. Basically, OpenGL handles all the low level operations that you're learning to implement throughout this class. It **was** helpful as a way to render straight to a viewport managed by OpenGL, but this can also be done with many other C++ modules.

# How can I speed up my render times?
The quickest approach I know to this is utilizing the power of multi-threading and parallel programming! This is obviously only possible in languages that support multi-threading. I used [OpenMP](https://www.openmp.org/spec-html/5.0/openmpse14.html) for my implementation. This DRAMATICALLY loweres your render times with a single line:
```
... 

#pragma omp parallel for
	for (int i = 0; i < width; i++)
	{
		for (int j = 0; j < height; j++)
		{
			glm::vec3 final_color(0, 0, 0);
			final_color = renderPixelAdvanced(i, j);

			pixmap[j][i][0] = (GLubyte)final_color.r;
			pixmap[j][i][1] = (GLubyte)final_color.g;
			pixmap[j][i][2] = (GLubyte)final_color.b;
		}
	}
	glDrawPixels(width, height, GL_RGB, GL_UNSIGNED_BYTE, pixmap);
}

...
```
All it's doing is allocating the execution of each loop iteration to the next available core. So instead of having one thread running through these instructions, I have six! So it's 6x faster.

# Are there any great suppplimental resources?
Yes! There are many! Here's a list:
- [Scratchapixel](https://www.scratchapixel.com/index.php?redirect)
  - Walks you through implementation of a lot of the ray caster functionalities, with fantastic diagrams and explanations.
- [Real-Time Rendering - Blog & Resources](https://www.realtimerendering.com/raytracing.html)
  - INCREDIBLE resource for those hungry for more information and applications. The entire website is pure gold and worth a browse. 
  - Books section has a lot of great content, the ones I checked out:
    - Ray Tracing: In One Weekend + Sequels
      - Great resource to see a more simplified implementation of the topics covered in this course. Also provides more diagrams to help understand the concepts as well as a few pointers on optimization.
    - An Introduction to Ray Tracing, edited by Andrew Glassner, Morgan Kaufmann, 1989.
      - And oldie, but goodie. It's crazy how much was known back in 1989! Oh boy how far we've come. This resource is if you really want to nerd out and learn about the original approaches to the challenges of image synthesis. 


# How does ray casting get any more advanced or complicated than the topics in this class? 
The real magic of modern implementations of render engines (Unreal Engine, Unity, etc) is the **optimization algorithms** used and the way the APIs handle memory. Learning APIs such as Vulkan or OpenGL will give you a taste of what areas graphics research is trying to improve.