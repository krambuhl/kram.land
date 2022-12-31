<script>
	import '../app.postcss'
</script>

<svelte:head>
	<title>kram.land</title>
	<meta name="author" content="evan krambuhl" />
	<meta name="description" content="making internet with the nice people who live there" />

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://kram.land" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="kram.land" />
	<meta property="og:description" content="making internet with the nice people who live there" />
	<meta property="og:image" content="https://kram.land/ikea.png" />

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary" />
	<meta property="twitter:domain" content="kram.land" />
	<meta property="twitter:url" content="https://kram.land" />
	<meta name="twitter:title" content="kram.land" />
	<meta name="twitter:description" content="making internet with the nice people who live there" />
	<meta name="twitter:image" content="https://kram.land/ikea.png" />
</svelte:head>

<slot />
