<script>
	import axios from 'axios';
	import { onMount } from 'svelte';
	/**
	 * @type {any[]}
	 */
	let tbs = [];
	let creating = false;

	let saving = false;

	onMount(async () => {
		let res = await axios.get('http://localhost:8080/violations');
		tbs = res.data;
	});

	let description = '';
	let stornoErlaubt = false;
	let preis = 0;
	let stripePriceId = '';

	const create = async () => {
		await axios.post('http://localhost:8080/createViolation', {
			description,
			stornoErlaubt,
			preis,
			stripePriceId
		});
		const res = await axios.get('http://localhost:8080/violations');
		tbs = res.data;
		description = '';
		stornoErlaubt = false;
		creating = false;
	};
</script>

<div
	class="bg-base-200 w-full top-0 left-0 mt-4 mr-4 ml-4 h-[calc(100vh-2rem)]  rounded-xl overflow-hidden shadow-xl"
>
	<div
		class="artboard artboard-demo p-3 uppercase font-bold text-xl rounded-lg mb-4 cursor-default relative"
	>
		Tatbestände
		<div class="absolute right-0 ">
			<div
				class={`btn btn-sm btn-${creating ? 'warning' : 'accent'} w-36 mr-4`}
				on:click={() => {
					description = '';
					stornoErlaubt = false;
					creating = !creating;
					preis = 0;
					stripePriceId = '';
				}}
			>
				{creating ? 'abbrechen' : 'erstellen'}
			</div>
		</div>
	</div>
	<div
		class="w-[calc(100%-2rem)] m-4 rounded-lg border border-accent bg-base-200 max-h-full overflow-scroll scrollbar-hidden"
	>
		<table class="table table-zebra w-full">
			<thead>
				<th> ID </th>
				<th> Beschreibung </th>
				<th> Preis </th>
				<th> Stripe Price ID </th>
				<th> Storno Erlaubt </th>
				<th />
			</thead>
			<tbody>
				{#if creating}
					<tr>
						<th>{Math.max(...tbs.map((o) => o.id)) + 1}</th>
						<td
							><input
								type="text"
								placeholder="Tatbestand"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={description}
							/>
						</td>

						<td
							><input
								type="number"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={preis}
							/>
						</td>
						<td
							><input
								type="text"
								placeholder="Stripe Price ID"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={stripePriceId}
							/>
						</td>
						<td>
							<input type="checkbox" class="checkbox checkbox-primary" bind:value={stornoErlaubt} />
						</td>
						<td
							><button
								class="btn btn-success w-36"
								disabled={description.length < 2 ? true : false}
								on:click={() => create()}
							>
								Speichern
							</button></td
						>
					</tr>
				{/if}

				{#each tbs as tb}
					<tr>
						<th>{tb.id}</th>
						<td>{tb.description}</td>
						<td>{tb.price / 100} €</td>
						<td>{tb.stripePriceId}</td>
						<td><input type="checkbox" class="checkbox" checked={tb.stornoErlaubt} disabled /></td>
						<td class="w-40"
							><button
								class="btn btn-error w-36"
								on:click={async () => {
									const delRes = await axios.delete(
										`http://localhost:8080/deleteViolation/${tb.id}`
									);
									const res = await axios.get('http://localhost:8080/violations');
									tbs = res.data;
								}}>Löschen</button
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
