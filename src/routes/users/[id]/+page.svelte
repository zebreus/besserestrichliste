<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import PriceButton from '$lib/components/users/PriceButton.svelte';
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

	<form method="POST" action="?/transfer">
		<h2>Send money</h2>
		<label>
			Amount
			<input name="amount" type="number" />
		</label>
		<label>
			Reason
			<input name="reason" type="text" />
		</label>
		<label>
			Recipient
			<input list="recipients" name="recipient" id="recipient" />
			<datalist id="recipients">
				{#each data.otherUsers as user (user.id)}
					<option value={user.name}> </option>
				{/each}
			</datalist>
		</label>

		<button>Send</button>
	</form>

	<form method="POST" action="?/edit">
		<h2>Edit User</h2>
		<label>
			Username
			<input name="name" type="text" value={data.user.name} />
		</label>

		<button>Update User</button>
	</form>

	<div>
		<h2>Deposit/Withdraw money</h2>
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
	</div>

	<main>
		<Container class="grid grid-cols-3 mt-4 gap-4">
			<form method="POST" action="?/deposit" class="grid grid-cols-3 gap-2">
				<PriceButton amount={30} />
				<PriceButton amount={50} />
				<PriceButton amount={100} />
				<PriceButton amount={130} />
				<PriceButton amount={150} />
				<PriceButton amount={250} />
			</form>
			<form method="POST" class="bg-neutral-800 p-4 gap-4 flex flex-col justify-between">
				<label class="flex flex-col justify-center items-center gap-4">
					<span class="font-bold text-xl">Amount</span>
					<input class="p-2  text-xl bg-neutral-950 text-white border-2 text-white" name="amount" type="number" />
				</label>
				<div class="flex justify-center gap-8">
					<button class="p-4 border-green bg-green-950 text-lg font-bold border-3" formaction="?/deposit">Deposit</button>
					<button class="p-4 border-red bg-red-950 text-lg font-bold border-3" formaction="?/withdraw">Withdraw</button>	
				</div>
			</form>
			<form method="POST" action="?/deposit" class="grid grid-cols-3 gap-2">
				<PriceButton amount={30} type="withdraw" />
				<PriceButton amount={50} type="withdraw" />
				<PriceButton amount={100} type="withdraw" />
				<PriceButton amount={130} type="withdraw" />
				<PriceButton amount={150} type="withdraw" />
				<PriceButton amount={250} type="withdraw" />
			</form>
		</Container>
		<Container class="grid lg:grid-cols-2 my-4	gap-4">
			<TransactionTable transacitons={data.user.initiatorIn} title="Initiated transactions" />
			<TransactionTable transacitons={data.user.recipientIn} title="Received transactions" />
		</Container>
	</main>
</div>
