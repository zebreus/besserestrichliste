<script lang="ts">
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import UserCard from '$lib/components/UserCard.svelte';
	import type { User } from '@prisma/client';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Users overview</h1>
	<main>
		<ul>
			{#each data.users as user (user.id)}
				<li>
					<UserCard {user} />
				</li>
			{/each}
		</ul>
	</main>
</section>