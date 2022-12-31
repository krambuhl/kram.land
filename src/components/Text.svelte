<script lang="ts">
	type Element = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p' | 'div'
	type Variant = 'heading' | 'body'
	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

	export let element: Element = 'div'
	export let variant: Variant = 'body'
	export let size: Size = 'md'

	function getClass(variant: Variant, size: Size) {
		switch (variant) {
			case 'heading': {
				switch (size) {
					case 'xs':
						return 'heading-xs'
					case 'sm':
						return 'heading-sm'
					case 'md':
						return 'heading-md'
					case 'lg':
						return 'heading-lg'
					case 'xl':
						return 'heading-xl'
				}
			}
			case 'body': {
				switch (size) {
					case 'xs':
						return 'body-xs'
					case 'sm':
						return 'body-sm'
					case 'md':
						return 'body-md'
					case 'lg':
						return 'body-lg'
					case 'xl':
						return 'body-xl'
				}
			}
		}
	}

	let className = getClass(variant, size)
</script>

<svelte:element this={element} class={className}>
	<slot />
</svelte:element>

<style lang="postcss">
	.heading-xs {
		@apply font-mono font-bold text-base md:text-base lg:text-lg;
	}
	.heading-sm {
		@apply font-mono font-bold text-base md:text-lg lg:text-xl;
	}
	.heading-md {
		@apply font-mono font-bold text-lg md:text-xl lg:text-2xl;
	}
	.heading-lg {
		@apply font-mono font-bold text-xl md:text-2xl lg:text-3xl;
	}
	.heading-xl {
		@apply font-mono font-bold text-2xl md:text-3xl lg:text-4xl;
	}

	.body-xs {
		@apply font-mono font-normal text-xs;
	}
	.body-sm {
		@apply font-mono font-normal text-sm;
	}
	.body-md {
		@apply font-mono font-normal text-base;
	}
	.body-lg {
		@apply font-mono font-normal text-lg;
	}
	.body-xl {
		@apply font-mono font-normal text-xl;
	}
</style>
