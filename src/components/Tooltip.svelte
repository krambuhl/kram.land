<script lang="ts">
	import { offset, flip, shift } from '@floating-ui/dom'
	import { createFloatingActions } from 'svelte-floating-ui'

	export let title: string

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: 'absolute',
		placement: 'top',
		middleware: [offset(4), flip(), shift({ padding: 12 })]
	})

	let showTooltip: boolean = false
</script>

<span
	class="underline decoration-dotted"
	use:floatingRef
	on:mouseenter={() => (showTooltip = true)}
	on:mouseleave={() => (showTooltip = false)}
>
	<slot />
</span>

{#if showTooltip}
	<div
		class="
			absolute py-2 px-3 rounded-md
			text-xs
			bg-neutral-300 border-neutral-300 text-black 
			dark:bg-neutral-800 dark:border-neutral-600 dark:text-white
		"
		use:floatingContent
	>
		{title}
	</div>
{/if}
