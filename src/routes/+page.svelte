<script lang="ts">
	import Container from '$lib/components/Container.svelte';
import UserCard from '$lib/components/UserCard.svelte';
	import type { PageServerData } from './$types';
	import '@fontsource/atkinson-hyperlegible';

	export let data: PageServerData;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<Container>
		<h1 class="text-2xl font-bold mb-4">Nutzerübersicht</h1>
		<ul class="grid grid-cols-5 gap-4">
			{#each data.users as user (user.id)}
				<li class="bg-neutral-800 border-gray-700 border-1">
					<UserCard {user} />
				</li>
			{/each}
		</ul>
	</Container>
</section>