<script lang="ts">
	export let transactions: {
		id: number;
		title: string;
		type: string;
		processedAt: Date;
		amount: number;
		initiatorId: number | null;
		recipientId: number | null;
	}[];
	export let title: string;
</script>

<figure class="bg-neutral-800 rounded-xl p-4">
	<figcaption class="text-xl">{title}</figcaption>
	<ul class="mt-4 grid gap-x-4 grid-cols-[auto_1fr_1fr]">
		{#each transactions as transaction (transaction.id)}
			<li class="contents">
				<span
					class="py-2 px-4 font-price text-2xl text-right"
					class:bg-green-950={transaction.amount > 0}
					class:bg-red-950={transaction.amount < 0}
					>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
						transaction.amount / 100
					)}</span
				>
				<span class="self-center">{transaction.processedAt.toDateString()}</span>
				<span class="self-center">From {transaction.initiatorId}</span>
			</li>
		{/each}
	</ul>
</figure>
