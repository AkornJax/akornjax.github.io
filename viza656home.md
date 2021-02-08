---
layout: default
title: VIZA 656 Image Processing
---

<ul>
	{% for item in site.VIZA_656 %}
		<li>
			<a href="{{ item.url }}">{{ item.title }}</a>
		</li>
		<p>{{ item.content | markdownify }}</p>
	{% endfor %}
</ul>