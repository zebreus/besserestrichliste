<script lang="ts">
	import 'uno.css';
	import '@unocss/reset/tailwind.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
</script>

<div class="bg-neutral-900 text-neutral-50 min-h-screen flex flex-col">
	<Header />

	<main class="flex-1">
		<slot />
	</main>

	<Footer />
</div>