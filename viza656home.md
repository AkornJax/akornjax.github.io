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
			{% assign projNum = item.title | slice: -2, 2 | plus: 0 %}
			{% if projNum > 3 %}
				{{ item.content | markdownify }}
			{% endif %}
		</li>
		
		
	{% endfor %}
</ul>