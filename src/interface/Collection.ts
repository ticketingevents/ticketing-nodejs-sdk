export interface Collection<T>{
	current: Promise<number>
	pages: Promise<number>

	then<TResult1 = T[], TResult2 = never>(
		onfulfilled?: (value: T[]) => TResult1 | PromiseLike<TResult1>,
		onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
	): Promise<TResult1 | TResult2>

	filter(criteria: {[key: string]: string|number}): Collection<T>
	sort(field: string, ascending: boolean): Collection<T>
	next(): Collection<T>
	previous(): Collection<T>
	first(): Collection<T>
	goto(page: number): Collection<T>
	hasNext(): Promise<boolean>
	hasPrevious(): Promise<boolean>

	onCurrent(callback: () => number): void
	onPages(callback: () => number): void
	onFilter(callback: (criteria: {[key: string]: string}) => void): void
	onSort(callback: (field: string, ascending: string) => void): void
	onPageChange(callback: (page: number) => void): void
	onReset(callback: () => void): void
}