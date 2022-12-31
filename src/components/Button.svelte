<script lang="ts">
	type Element = 'button' | 'a'
	type Size = 'sm' | 'md' | 'lg'

	export let element: Element = 'button'
	export let size: Size = 'md'

	function getClass(size: Size) {
		switch (size) {
			case 'sm':
				return 'button-sm'
			case 'md':
				return 'button-md'
			case 'lg':
				return 'button-lg'
		}
	}

	let className = `button ${getClass(size)}`
</script>

<svelte:element this={element} class={className}>
	<slot />
</svelte:element>

<style lang="postcss">
	.button {
		@apply rounded-md border-2 border-black text-black hover:bg-black hover:text-white;
		@apply dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black;
	}
	.button-sm {
		@apply py-1 px-4;
	}
	.button-md {
		@apply py-2 px-4;
	}
	.button-lg {
		@apply py-3 px-6;
	}
</style>
