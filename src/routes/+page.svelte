<script lang="ts">
	import IkeaAvif from 'static/ikea.png?w=192;384&format=avif&srcset'
	import IkeaWebp from 'static/ikea.png?w=192;384&format=webp&srcset'
	import IkeaJpg from 'static/ikea.png?w=192&format=jpg'
	import Tooltip from 'src/components/Tooltip.svelte'
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

		<p>
			i’m <b>evan krambuhl</b> and i make <b>internet</b> with real nice people at
			<b>patreon</b>
		</p>

		<p>
			i specialize in <b>high quality ui</b> and <b>thoughtful patterns</b> to help developers be more
			productive
		</p>

		<p>
			an <Tooltip title="read: never owned an unbrella">oregon</Tooltip> native, you'll find me outdoorsing
			and swimming in the rivers when they're not mountain runoff
		</p>

		<p>
			i love making
			<a href="https://www.instagram.com/ev.aart" target="_blank" rel="noreferrer">generative art</a
			>
			and playing drums and have an endless appetite for live music and
			<Tooltip title="one must imagine sisyphus happy">absurdity</Tooltip>
		</p>

		<p>———</p>

		<p class="text-sm">
			say hello: <a href="mailto:hello@kram.land">email</a>
			<a href="https://stumptownbear.com">portfolio</a>
		</p>

		<p class="m-auto max-w-[192px] text-xs">* i’m a busy hotdog, please be nice</p>
	</div>
</div>
