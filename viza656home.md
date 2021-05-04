---
layout: default
title: VIZA 656 Image Processing
---
<ul>
	{% for item in site.VIZA_656 %}
		<li>
			<h1>
				<a href="{{ item.url }}">{{ item.title }}</a>
			</h1>
		</li>
		<!-- <p>{{ item.content | markdownify }}</p> !-->
	{% endfor %}
</ul>