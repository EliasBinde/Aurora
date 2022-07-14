<script lang="ts">
	import axios from 'axios';
	import { EditIcon, TargetIcon, TrashIcon } from 'svelte-feather-icons';
	import dayjs from 'dayjs';

	import { onMount } from 'svelte';
	/**
	 * @type {any[]}
	 */
	let tickets: any = [];
	let creating = false;
	let saving = false;
	let violations: any = [];
	let locations: any = [];
	onMount(async () => {
		let res = await axios.get('http://localhost:8080/tickets');
		tickets = res.data;
		violations = await (await axios.get('http://localhost:8080/violations')).data;
		locations = await (await axios.get('http://localhost:8080/locations')).data;
	});
	let aktenzeichen = '';
	let tatbestand = 0;
	let address = '';
	let city = '';
	let postalCode = '';
	let time = '';
	let locationId = '';
	let licensePlate = '';

	let edit: any = null;
	const htChange = (e: any) => {
		let tmp = edit;
		tmp.time = new Date(e?.target?.value);
		edit = tmp;
	};

	const create = async () => {
		await axios.post('http://localhost:8080/createTicket', {
			aktenzeichen,
			tatbestand,
			address,
			city,
			postalCode,
			time,
			locationId,
			licensePlate
		});
		const res = await axios.get('http://localhost:8080/tickets');
		tickets = res.data;
		aktenzeichen = '';
		tatbestand = 0;
		address = '';
		city = '';
		postalCode = '';
		time = '';
		locationId = '';
		licensePlate = '';
		creating = false;
	};
	const getNewId = () => {
		return Math.max(...tickets.map((o: any) => o.id)) + 1;
	};
	const hLocChange = (e: any) => {
		let tmp = edit;
		const loc = locations.find((l: any) => l.id == e.target.value);
		tmp.address = loc.address;
		tmp.postalCode = loc.postalCode;
		tmp.city = loc.city;
		edit = tmp;
		console.log(
			`${new Date(edit.time).getFullYear()}-${new Date(edit.time).getMonth()}-${new Date(
				edit.time
			).getDate()}T${new Date(edit.time).getHours()}:${new Date(edit.time).getMinutes()}`
		);
	};
</script>

{#if edit}
	<div
		class="fixed z-20 h-screen w-screen backdrop-blur-2xl flex justify-center items-center"
		on:click={() => {
			edit = null;
		}}
	>
		<div
			class="border bg-base-300"
			on:click={(e) => {
				e.stopPropagation();
			}}
		>
			<div class="inner p-8">
				<input class="input" type="text" bind:value={edit.tatbestand} />
				<input class="input" type="text" bind:value={edit.address} />
				<input class="input" type="text" bind:value={edit.city} />
				<input class="input" type="text" bind:value={edit.postalCode} />
				<input
					type="datetime-local"
					class="input"
					value={dayjs(edit.time).format('YYYY-MM-DDTHH:mm:ss')}
					on:input={(e) => htChange(e)}
				/>
				<select class="input" type="text" value={edit.tatbestand}>
					{#each violations as vl}
						<option value={vl.id}>{vl.description}</option>
					{/each}
				</select>
				<select on:change={hLocChange} class="input" type="text" value={edit.locationId}>
					{#each locations as loc}
						<option value={loc.id}>{loc.name + ' ' + loc.address}</option>
					{/each}
				</select>
				<input class="input" type="text" bind:value={edit.licensePlate} />
			</div>
		</div>
	</div>
{/if}

<div
	class="bg-base-200 w-full top-0 left-0 mt-4 mr-4 ml-4 h-[calc(100vh-2rem)]  rounded-xl overflow-hidden shadow-xl"
>
	<div
		class="artboard artboard-demo p-3 uppercase font-bold text-xl rounded-lg mb-4 cursor-default relative"
	>
		Vorfälle
		<div class="absolute right-0 ">
			<div
				class={`btn btn-sm btn-${creating ? 'warning' : 'accent'} w-36 mr-4`}
				on:click={() => {
					aktenzeichen = '';
					tatbestand = 0;
					address = '';
					city = '';
					postalCode = '';
					time = '';
					locationId = '';
					licensePlate = '';
					creating = !creating;
				}}
			>
				{creating ? 'abbrechen' : 'erstellen'}
			</div>
		</div>
	</div>
	<div class="w-full  max-h-full overflow-scroll scrollbar-hidden">
		<table class="table table-compact table-zebra w-full">
			<thead>
				<th> ID </th>
				<th> Aktenzeichen </th>
				<th> Tatbestand </th>
				<th> Adresse </th>
				<th> Ort </th>
				<th> Postleitzahl </th>
				<th> Zeit </th>
				<th> Location Id </th>
				<th> Kennzeichen </th>
			</thead>
			<tbody>
				{#if creating}
					<tr>
						<th>{getNewId()}</th>
						<td
							><input
								type="text"
								placeholder="Aktenzeichen"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={aktenzeichen}
							/>
						</td>
						<td
							><input
								type="text"
								placeholder="Tatbestand"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={tatbestand}
							/>
						</td>
						<td
							><input
								type="text"
								placeholder="Addresse"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={address}
							/>
						</td>
						<td
							><input
								type="text"
								placeholder="Postleitzahl"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={postalCode}
							/>
						</td>
						<td
							><input
								type="text"
								placeholder="Stadt"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={city}
							/>
						</td>
						<td
							><input
								type="datetime-local"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={time}
							/>
						</td>
						<td
							><input
								type="text"
								placeholder="Location ID"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={locationId}
							/>
						</td>
						<td
							><input
								type="text"
								placeholder="Kennzeichen"
								class="input input-bordered input-sm w-full max-w-xs"
								bind:value={licensePlate}
							/>
						</td>
						<td
							><button class="btn btn-success w-36" disabled={false} on:click={() => create()}>
								Speichern
							</button></td
						>
					</tr>
				{/if}

				{#each tickets as tb}
					<tr>
						<th>{tb.id}</th>
						<td>{tb.aktenzeichen}</td>
						<td>{tb.tatbestand}</td>
						<td>{tb.address}</td>
						<td>{tb.city}</td>
						<td>{tb.postalCode}</td>
						<td>{new Date(tb.time).toLocaleString('de-DE')}</td>
						<td>{tb.locationId}</td>
						<td>{tb.licensePlate}</td>
						<td class="w-16">
							<button
								class="btn btn-info btn-sm"
								on:click={async () => {
									edit = tb;
								}}
							>
								<EditIcon />
							</button>
						</td>

						<td class="w-16"
							><button
								class="btn btn-error btn-sm"
								on:click={async () => {
									const delRes = await axios.delete(`http://localhost:8080/deleteTicket/${tb.id}`);
									const res = await axios.get('http://localhost:8080/tickets');
									tickets = res.data;
								}}
							>
								<TrashIcon />
							</button></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	th,
	td {
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}
</style>
