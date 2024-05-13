<script lang="ts">
	import type { User } from '@prisma/client';

	export let user: User;
	export let isPositive: boolean = user.balance > 0;
	export let balance: string = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'EUR'
	}).format(user.balance / 100);
</script>

<a href={`/users/${user.id}`} class="cursor-pointer flex flex-col">
	<h2 class="text-2xl text-neutral-300 p-2 font-bold">{user.name}</h2>
	<small
		class="text-xl text-right p-2"
		class:bg-green-950={isPositive}
		class:bg-red-950={!isPositive}>{balance}</small
	>
</a>
