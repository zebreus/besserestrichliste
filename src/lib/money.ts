export function parseAmount(value: FormDataEntryValue | null): number | null {
	if (value === null) return null;
	const n = typeof value === 'string' ? Number(value) : Number(value.toString());
	if (Number.isNaN(n) || n <= 0) {
		return null;
	}
	return n;
}
