<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import UserCard from '$lib/components/UserCard.svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import '@fontsource/atkinson-hyperlegible';

	export let data: PageServerData;
	let createError = '';

	function validateCreateUser({ formData, cancel }: { formData: FormData; cancel: () => void }) {
		const name = formData.get('name')?.toString().trim();
		if (!name) {
			cancel();
			createError = 'Name is required';
		} else {
			createError = '';
		}
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<Container>
		<h1 class="text-2xl font-bold mb-4">Nutzerübersicht</h1>
		<ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
			{#each data.users as user (user.id)}
				<li class="bg-neutral-800 border-gray-700 border-1">
					<UserCard {user} />
				</li>
			{/each}
		</ul>
	</Container>
	<form method="POST" action="?/createUser" use:enhance={validateCreateUser}>
		<label>
			Username
			<input name="name" type="text" />
		</label>
		{#if createError}
			<p class="text-red-500">{createError}</p>
		{/if}
		<button type="submit">Create User</button>
	</form>
</section>
