<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import PriceButton from '$lib/components/users/PriceButton.svelte';
	import TransactionTable from '$lib/components/users/TransactionTable.svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import { parseAmount } from '$lib/money';

	export let data: PageServerData;

	let transferError = '';
	let transferSuccess = '';
	let moneyError = '';
	let moneySuccess = '';

	function validateMoney({ formData, cancel }: { formData: FormData; cancel: () => void }) {
		const amount = parseAmount(formData.get('amount'));
		if (!amount) {
			cancel();
			moneyError = 'Amount required';
			moneySuccess = '';
		} else {
			moneyError = '';
			return async ({
				update
			}: {
				update: (opts?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
			}) => {
				await update();
				moneySuccess = 'Transaction successful';
			};
		}
	}

	function validateTransfer({ formData, cancel }: { formData: FormData; cancel: () => void }) {
		const amount = parseAmount(formData.get('amount'));
		const recipient = formData.get('recipient')?.toString().trim();
		if (!amount) {
			cancel();
			transferError = 'Amount required';
			transferSuccess = '';
			return;
		}
		if (!recipient) {
			cancel();
			transferError = 'Recipient required';
			transferSuccess = '';
			return;
		}
		transferError = '';
		return async ({
			update
		}: {
			update: (opts?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
		}) => {
			await update();
			transferSuccess = 'Transfer successful';
		};
	}
</script>

<div>
	<div class="bg-neutral-700 text-xl font-bold">
		<Container class="flex-1 flex justify-between">
			<h1 class="p-2">{data.user.name}</h1>
			<span>Last active at {data.user.lastActive.toString()}</span>
			<span
				class="p-2"
				class:bg-green-950={data.user.balance >= 0}
				class:bg-red-950={data.user.balance < 0}
			>
				Balance: {new Intl.NumberFormat(undefined, {
					style: 'currency',
					currency: 'EUR'
				}).format(data.user.balance / 100)}
			</span>
		</Container>
	</div>

	<form method="POST" action="?/transfer" use:enhance={validateTransfer}>
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
			<select name="recipient" id="recipient">
				<option value="" disabled selected hidden>Select recipient</option>
				{#each data.otherUsers as user (user.id)}
					<option value={user.id}>{user.name}</option>
				{/each}
			</select>
		</label>

		{#if transferError}
			<p class="text-red-500">{transferError}</p>
		{/if}
		{#if transferSuccess}
			<p class="text-green-500">{transferSuccess}</p>
		{/if}
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
		{#if moneyError}
			<p class="text-red-500">{moneyError}</p>
		{/if}
		{#if moneySuccess}
			<p class="text-green-500">{moneySuccess}</p>
		{/if}
		<form method="POST" action="?/withdraw" use:enhance={validateMoney}>
			<button name="amount" value="30">+0.30€</button>
			<button name="amount" value="50">+0.50€</button>
			<button name="amount" value="100">+1.00€</button>
			<button name="amount" value="130">+1.30€</button>
			<button name="amount" value="150">+1.50€</button>
			<button name="amount" value="250">+2.50€</button>
		</form>

		<form method="POST" use:enhance={validateMoney}>
			<label>
				Amount
				<input name="amount" type="number" />
			</label>
			<button formaction="?/deposit">Deposit</button>
			<button formaction="?/withdraw">Withdraw</button>
		</form>

		<form method="POST" action="?/deposit" use:enhance={validateMoney}>
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
			<form
				method="POST"
				action="?/deposit"
				class="grid grid-cols-3 gap-2"
				use:enhance={validateMoney}
			>
				<PriceButton amount={30} />
				<PriceButton amount={50} />
				<PriceButton amount={100} />
				<PriceButton amount={130} />
				<PriceButton amount={150} />
				<PriceButton amount={250} />
			</form>
			<form
				method="POST"
				class="bg-neutral-800 p-4 gap-4 flex flex-col justify-between"
				use:enhance={validateMoney}
			>
				<label class="flex flex-col justify-center items-center gap-4">
					<span class="font-bold text-xl">Amount</span>
					<input
						class="p-2 text-xl bg-neutral-950 text-white border-2 text-white"
						name="amount"
						type="number"
					/>
				</label>
				<div class="flex justify-center gap-8">
					<button
						class="p-4 border-green bg-green-950 text-lg font-bold border-3"
						formaction="?/deposit">Deposit</button
					>
					<button
						class="p-4 border-red bg-red-950 text-lg font-bold border-3"
						formaction="?/withdraw">Withdraw</button
					>
				</div>
			</form>
			<form
				method="POST"
				action="?/withdraw"
				class="grid grid-cols-3 gap-2"
				use:enhance={validateMoney}
			>
				<PriceButton amount={30} type="withdraw" />
				<PriceButton amount={50} type="withdraw" />
				<PriceButton amount={100} type="withdraw" />
				<PriceButton amount={130} type="withdraw" />
				<PriceButton amount={150} type="withdraw" />
				<PriceButton amount={250} type="withdraw" />
			</form>
		</Container>
		<Container class="grid lg:grid-cols-2 my-4	gap-4">
			<TransactionTable transactions={data.user.initiatorIn} title="Initiated transactions" />
			<TransactionTable transactions={data.user.recipientIn} title="Received transactions" />
		</Container>
	</main>
</div>
