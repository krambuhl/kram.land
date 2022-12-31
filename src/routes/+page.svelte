<script>
	import IkeaAvif from '../../static/ikea.png?w=192;384&format=avif&srcset'
	import IkeaWebp from '../../static/ikea.png?w=192;384&format=webp&srcset'
	import IkeaJpg from '../../static/ikea.png?w=192&format=jpg'
	export const prerender = true
</script>

<div class="py-20 px-6 text-center flex flex-col items-center space-y-12">
	<div class="m-auto max-w-[192px]">
		<picture>
			<source srcset={IkeaAvif} sizes="" type="image/avif" />
			<source srcset={IkeaWebp} type="image/webp" />
			<img src={IkeaJpg} alt="" class="rounded-lg" width={192} height={192} />
		</picture>
	</div>

	<div class="m-auto max-w-sm space-y-6">
		<h1 class="heading-md">oh hi. hello!</h1>
		<p class="body-md">
			i’m <b>evan krambuhl</b> and i make <b>components and tools</b> with nice people at
			<b>patreon</b>
		</p>
		<p class="body-md">
			a lifelong waterdog and outdoorser, i have a love for live music, drumming, <a
				href="https://www.instagram.com/ev.aart"
				target="_blank"
				rel="noreferrer">generative art</a
			> and the absurd
		</p>
		<p class="body-md">
			i specialize in <b>high quality ui</b> and <b>thoughtful tools</b> to make developers more productive
		</p>

		<p class="body-md">———</p>

		<p><a class="button button-md" href="mailto:hello@kram.land">say hello</a></p>

		<p class="m-auto max-w-[192px] body-xs">* i’m a busy hotdog, please be nice</p>
	</div>
</div>
