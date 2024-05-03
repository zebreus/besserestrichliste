<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import TransactionTable from '$lib/components/users/TransactionTable.svelte';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<div>
	<div class="bg-neutral-700 text-xl font-bold">
		<Container class="flex-1 flex justify-between">
			<h1 class="p-2">{data.user.name}</h1>
			<span
				class="p-2"
				class:bg-green-950={data.user.balance >= 0}
				class:bg-red-950={data.user.balance < 0}
			>
				Balance: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
					data.user.balance / 100
				)}
			</span>
		</Container>
	</div>
	<main>
		<Container class="grid lg:grid-cols-2 my-4	gap-4">
			<TransactionTable transacitons={data.user.initiatorIn} title="Initiated transactions" />
			<TransactionTable transacitons={data.user.recipientIn} title="Received transactions" />
		</Container>
	</main>
</div>
