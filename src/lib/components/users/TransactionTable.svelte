<script lang="ts">
	import { enhance } from '$app/forms';

	export let transactions: {
		id: number;
		title: string;
		type: string;
		processedAt: Date;
		amount: number;
		fromId: number | null;
		toId: number | null;
		reversedBy: { id: number } | null;
		reverses: { id: number } | null;
	}[];
	export let title: string;
	export let userId: number;

	// Filter out reversal transactions and merge them with their original
	$: displayTransactions = transactions
		.filter((t) => !t.reverses)
		.map((t) => ({
			...t,
			isReverted: !!t.reversedBy,
			canUndo:
				!t.reversedBy && Date.now() - new Date(t.processedAt).getTime() < 5 * 60 * 1000,
			// Determine if this is money leaving (-) or arriving (+) for this user
			isIncoming: t.toId === userId,
			isOutgoing: t.fromId === userId
		}));
</script>

<figure class="bg-neutral-800 rounded-xl p-4">
	<figcaption class="text-xl">{title}</figcaption>
	<ul class="mt-4 grid gap-x-4 grid-cols-[auto_1fr_1fr_auto]">
		{#each displayTransactions as transaction (transaction.id)}
			<li class="contents">
				<span
					class="py-2 px-4 font-price text-2xl text-right"
					class:bg-green-950={transaction.isIncoming && !transaction.isReverted}
					class:bg-red-950={transaction.isOutgoing && !transaction.isReverted}
					class:bg-neutral-700={transaction.isReverted}
					class:line-through={transaction.isReverted}
					class:opacity-60={transaction.isReverted}
					>{transaction.isOutgoing ? '-' : '+'}{new Intl.NumberFormat(undefined, {
						style: 'currency',
						currency: 'EUR'
					}).format(transaction.amount / 100)}</span
				>
				<span class="self-center" class:opacity-60={transaction.isReverted}
					>{transaction.processedAt.toDateString()}</span
				>
				<span class="self-center" class:opacity-60={transaction.isReverted}>
					{#if transaction.isOutgoing}
						To {transaction.toId}
					{:else if transaction.isIncoming}
						From {transaction.fromId}
					{:else}
						{transaction.fromId} → {transaction.toId}
					{/if}
				</span>
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
