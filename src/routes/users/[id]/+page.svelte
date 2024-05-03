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

			<form method="POST" action="?/deposit">
				<button name="amount" value="30">+0.30€</button>
				<button name="amount" value="50">+0.50€</button>
				<button name="amount" value="100">+1.00€</button>
				<button name="amount" value="130">+1.30€</button>
				<button name="amount" value="150">+1.50€</button>
				<button name="amount" value="250">+2.50€</button>
			</form>

			<form method="POST">
				<label>
					Amount
					<input name="amount" type="number" />
				</label>
				<button formaction="?/deposit">Deposit</button>
				<button formaction="?/withdraw">Withdraw</button>
			</form>

			<form method="POST" action="?/deposit">
				<button name="amount" value="50">+0.50€</button>
				<button name="amount" value="100">+1€</button>
				<button name="amount" value="200">+2€</button>
				<button name="amount" value="500">+5€</button>
				<button name="amount" value="1000">+10€</button>
				<button name="amount" value="2000">+20€</button>
			</form>

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
