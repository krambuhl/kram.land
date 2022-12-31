<script>
	import Button from 'src/components/Button.svelte'
	import Text from 'src/components/Text.svelte'

	export const prerender = true
</script>

<div class="m-auto p-6 max-w-3xl text-center flex flex-col items-center space-y-3">
	<Text variant="heading" size="xl">Extra Large Heading</Text>
	<Text variant="heading" size="lg">Large Heading</Text>
	<Text variant="heading" size="md">Medium Heading</Text>
	<Text variant="heading" size="sm">Small Heading</Text>
	<Text variant="heading" size="xs">Extra Small Heading</Text>

	<Text variant="body" size="xl"
		>Extra Large Body Ipsum nisi commodo mollit voluptate. Enim minim ullamco culpa esse aliquip
		enim quis. Magna aliquip minim dolore <a href="#!">ut laboris incididunt eiusmod</a>. Magna
		ipsum laborum deserunt sunt Lorem id reprehenderit.</Text
	>
	<Text variant="body" size="lg"
		>Large Body Nostrud dolore anim nulla sit Lorem consectetur laboris ex irure sunt consequat. Qui
		est dolore sit cillum esse do nostrud pariatur incididunt ea ullamco excepteur non ea. Anim
		laborum sit commodo et veniam duis ex nisi enim et. Anim fugiat proident dolore eu est officia
		proident duis est consequat id laborum ipsum.</Text
	>
	<Text variant="body" size="md"
		>Medium Body Incididunt minim sit cupidatat exercitation id id incididunt veniam. Dolor
		voluptate laborum culpa consequat laborum enim esse eu proident deserunt qui mollit. Duis do ad
		enim aliqua non esse culpa deserunt elit culpa. Ea magna ut id ea culpa consequat.</Text
	>
	<Text variant="body" size="sm"
		>Small Body Non irure exercitation dolore consectetur. Velit sunt laboris laboris deserunt nulla
		aliquip consectetur officia ea. Aliqua ipsum proident esse eu minim cillum.</Text
	>
	<Text variant="body" size="xs"
		>Extra Small Body Minim culpa nulla cupidatat dolor cillum anim sit esse culpa nulla. Quis
		laborum nulla reprehenderit irure velit deserunt in ut sunt officia laborum enim Lorem nulla.
		Commodo ipsum pariatur ex qui ea. Consequat duis reprehenderit deserunt velit. Occaecat non
		veniam sit magna sit est exercitation ex Lorem fugiat ut aliquip. Officia minim dolor sit sit
		sunt ullamco enim magna labore.</Text
	>

	<Button size="sm" on:click={() => console.log('hello')}>Small Button</Button>
	<Button size="md" on:click={() => console.log('hello')}>Medium Button</Button>
	<Button size="lg" on:click={() => console.log('hello')}>Large Button</Button>
</div>
