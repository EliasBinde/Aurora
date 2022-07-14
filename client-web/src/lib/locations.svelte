<script>
	import axios from 'axios';
	import { onMount } from 'svelte';
	/**
	 * @type {any[]}
	 */
	let locations = [];
	let creating = false;
	let saving = false;
	onMount(async () => {
		let res = await axios.get('http://localhost:8080/locations');
		locations = res.data;
	});
	let name = '';
	let address = '';
	let city = '';
	let postalCode = '';
	let maxParkingMin = 0;

	const create = async () => {
		await axios.post('http://localhost:8080/createLocation', {
			name,
			address,
			city,
			postalCode,
			maxParkingMin
		});
		const res = await axios.get('http://localhost:8080/locations');
		locations = res.data;
		name = '';
		address = '';
		city = '';
		postalCode = '';
		maxParkingMin = 0;
		creating = false;
	};
</script>

<div
	class="bg-base-200 w-full top-0 left-0 mt-4 mr-4 ml-4 h-[calc(100vh-2rem)]  rounded-xl overflow-hidden shadow-xl"
>
	<div
		class="artboard artboard-demo p-3 uppercase font-bold text-xl rounded-lg mb-4 cursor-default relative"
	>
		Locations
		<div class="absolute right-0 ">
			<div
				class={`btn btn-sm btn-${creating ? 'warning' : 'accent'} w-36 mr-4`}
				on:click={() => {
					name = '';
					address = '';
					city = '';
					postalCode = '';
					maxParkingMin = 0;
					creating = !creating;
				}}
			>
				{creating ? 'abbrechen' : 'erstellen'}
			</div>
		</div>
	</div>
	<div
		class="w-[calc(100%-2rem)] m-4 rounded-lg border border-accent bg-base-200 max-h-full overflow-scroll scrollbar-hidden "
	>
		<table class="table table-zebra w-full ">
			<thead>
				<th> ID </th>
				<th> Name </th>
				<th> Addresse </th>
				<th> Postleitzahl </th>
				<th> Stadt </th>
				<th> Maximale Parkdauer </th>
				<th />
			</thead>
			<tbody>
				{#if creating}
					<tr>
						<th>{Math.max(...locations.map((o) => o.id)) + 1}</th>
						<td
							><input
								type="text"
								placeholder="Name"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={name}
							/>
						</td>
						<td>
							<input
								type="text"
								placeholder="Straße + Hausnummer"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={address}
							/>
						</td>
						<td>
							<input
								type="text"
								placeholder="Postleitzahl"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={postalCode}
							/></td
						>
						<td>
							<input
								type="text"
								placeholder="Stadt"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={city}
							/></td
						>
						<td>
							<input
								type="number"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={maxParkingMin}
							/>
						</td>

						<td
							><button class="btn btn-success w-36" disabled={false} on:click={() => create()}>
								Speichern
							</button></td
						>
					</tr>
				{/if}

				{#each locations as loc}
					<tr>
						<th>{loc.id}</th>
						<td>{loc.name}</td>
						<td>{loc.address}</td>
						<td>{loc.postalCode}</td>
						<td>{loc.city}</td>
						<td>{loc.maxParkingMin} Minuten</td>

						<td class="w-40"
							><button
								class="btn btn-error w-36"
								on:click={async () => {
									const delRes = await axios.delete(
										`http://localhost:8080/deleteLocation/${loc.id}`
									);
									const res = await axios.get('http://localhost:8080/locations');
									locations = res.data;
								}}>Löschen</button
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
