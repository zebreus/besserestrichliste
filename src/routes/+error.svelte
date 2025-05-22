<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	export let error: Error & { message: string };
	export let status: number;
</script>

<Container class="py-8 text-center">
	<h1 class="text-3xl font-bold mb-4">{status}</h1>
	<p class="mb-4">{error?.message}</p>
	<a href="/" class="underline text-blue-300">Back to Home</a>
</Container>
