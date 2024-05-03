<script lang="ts">
    export let amount: 30 | 50 | 100 | 130 | 150 | 250;
    export let type: 'deposit' | 'withdraw' = 'deposit';
    const textBlack = type === 'withdraw' && (
        amount === 30 || amount === 100 || amount === 130
    );
</script>

<button
    class="p-4 text-2xl font-bold border-3"
    class:text-black={textBlack}
    class:bg-white={type === 'withdraw' && amount === 30}
    class:bg-blue-900={type === 'withdraw' && amount === 50}
    class:bg-amber={type === 'withdraw' && amount === 100}
    class:bg-green={type === 'withdraw' && amount === 130}
    class:bg-red-950={type === 'withdraw' && amount > 130}
    class:border-red={type === 'withdraw'}
    class:border-green={type === 'deposit'}
    class:bg-green-950={type === 'deposit'}
    name="amount"
    value="{amount}">
    {type === 'deposit' ? '+' : '-'}{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(amount / 100)}
    </button>
