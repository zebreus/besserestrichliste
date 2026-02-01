<script lang="ts">
	import { enhance } from '$app/forms';

	export let transactions: {
		id: number;
		title: string;
		type: string;
		processedAt: Date;
		amount: number;
		initiatorId: number | null;
		recipientId: number | null;
		reversedBy: { id: number } | null;
		reverses: { id: number } | null;
	}[];
	export let title: string;

	// Filter out reversal transactions and merge them with their original
	$: displayTransactions = transactions
		.filter((t) => !t.reverses)
		.map((t) => ({
			...t,
			isReverted: !!t.reversedBy,
			canUndo: !t.reversedBy && Date.now() - new Date(t.processedAt).getTime() < 5 * 60 * 1000
		}));
</script>

<figure class="bg-neutral-800 rounded-xl p-4">
	<figcaption class="text-xl">{title}</figcaption>
	<ul class="mt-4 grid gap-x-4 grid-cols-[auto_1fr_1fr_auto]">
		{#each displayTransactions as transaction (transaction.id)}
			<li class="contents">
				<span
					class="py-2 px-4 font-price text-2xl text-right"
					class:bg-green-950={transaction.amount > 0 && !transaction.isReverted}
					class:bg-red-950={transaction.amount < 0 && !transaction.isReverted}
					class:bg-neutral-700={transaction.isReverted}
					class:line-through={transaction.isReverted}
					class:opacity-60={transaction.isReverted}
					>{new Intl.NumberFormat(undefined, {
						style: 'currency',
						currency: 'EUR'
					}).format(transaction.amount / 100)}</span
				>
				<span class="self-center" class:opacity-60={transaction.isReverted}
					>{transaction.processedAt.toDateString()}</span
				>
				<span class="self-center" class:opacity-60={transaction.isReverted}
					>From {transaction.initiatorId}</span
				>
				<span class="self-center">
					{#if transaction.isReverted}
						<span class="text-neutral-400 text-sm">Reverted</span>
					{:else if transaction.canUndo}
						<form method="POST" action="?/undo" use:enhance class="inline">
							<input type="hidden" name="transactionId" value={transaction.id} />
							<button
								type="submit"
								class="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm"
								aria-label="Undo transaction"
							>
								Undo
							</button>
						</form>
					{/if}
				</span>
			</li>
		{/each}
	</ul>
</figure>
