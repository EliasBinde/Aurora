<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { each } from 'svelte/internal';

	let image: string | null = null;
	let sls = '';

	let creating: boolean = true;

	let locations: any = [];
	let violations: any = [];
	let viewLocs: any[] = [];
	let selectedLocation: any = null;
	let searching: boolean = false;
	let kennzeichen = '';
	let violation: any;
	onMount(async () => {
		locations = (await axios.get('http://localhost:8080/locations')).data;
		violations = (await axios.get('http://localhost:8080/violations')).data;
	});

	//getBase64(file)
	const getBase64 = async (file: any) => {
		var reader = new FileReader();
		reader.readAsDataURL(file);

		//promise based on filereader
		return new Promise((resolve, reject) => {
			reader.onload = () => {
				resolve(reader.result);
			};
		});
	};

	const uploadToClient = async (event: any) => {
		if (event.target.files && event.target.files[0]) {
			const i = event.target.files[0];
			const res = `${await getBase64(i)}`;
			image = res;
		}
	};

	const filterLocs = (event: any) => {
		const value = event.target.value;
		if (value.length > 0) {
			searching = true;
			viewLocs = locations.filter((loc: any) => {
				return (
					loc.name.toLowerCase().includes(value.toLowerCase()) ||
					loc.address.toLowerCase().includes(value.toLowerCase()) ||
					loc.city.toLowerCase().includes(value.toLowerCase()) ||
					loc.postalCode.toLowerCase().includes(value.toLowerCase())
				);
			});
		} else {
			viewLocs = [];
			searching = false;
		}
	};

	const submit = async () => {
		const res = await axios.post('http://localhost:8080/createCTicket', {
			image: image,
			locationID: selectedLocation.id,
			address: selectedLocation.address,
			city: selectedLocation.city,
			postalCode: selectedLocation.postalCode,
			licensePlate: kennzeichen,
			violationID: violation
		});

		creating = false;
	};
</script>

<div class="flex justify-center w-screen">
	{#if creating}
		<div class="pt-6 px-4 max-w-3xl w-full">
			<div class="mb-6 text-center uppercase text-2xl">Neuen Vorgang erstellen</div>
			<div class="search relative mb-8">
				<input
					type="text"
					class={`bg-base-200 p-2 w-full rounded-lg text-center focus:outline-none border border-black/20 focus:border-accent shadow-md`}
					on:input={(e) => filterLocs(e)}
					bind:value={sls}
					placeholder={selectedLocation
						? selectedLocation.name + ' ' + selectedLocation.address + ' ' + selectedLocation.city
						: 'Location suchen'}
				/>
				<div
					class={`absolute bg-base-200 p-2 w-full rounded-lg mt-0.5 border border-black/20 shadow-md ${
						!searching && 'hidden'
					}`}
				>
					{#each viewLocs as location, index}
						<div
							class="my-2"
							on:click={() => {
								selectedLocation = location;
								sls = '';
								searching = false;
							}}
						>
							<div class="btn btn-outline justify-around w-full max-h-fit">
								<div class="w-1/3">{location.name}</div>
								<div class="w-1/3">{location.address}</div>
								<div class="w-1/3">{location.postalCode + ' ' + location.city}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<input
				type="text"
				class={`bg-base-200 p-2 w-full rounded-lg text-center focus:outline-none border border-black/20 focus:border-accent shadow-md mb-8`}
				placeholder="Kennzeichen"
				bind:value={kennzeichen}
			/>
			<select
				class="bg-base-200 p-2 w-full rounded-lg text-center focus:outline-none border border-black/20 focus:border-accent shadow-md mb-8"
				bind:value={violation}
			>
				<option disabled selected>Tatbestand wählen</option>
				{#each violations as violation}
					<option value={violation.id}>{violation.description}</option>
				{/each}
			</select>
			<div class="image mb-8">
				<input type="file" id="upload" class="hidden" on:change={(e) => uploadToClient(e)} />
				<label for="upload">
					{#if image}
						<div class="relative" />
						<img class="" src={`${image}`} alt="Preview" />
					{:else}
						<div class="btn w-full hover:btn-accent btn-outline">
							Beweisfoto auswählen / aufnemen
						</div>
					{/if}
				</label>
			</div>
			<button class="btn" on:click={submit}>Erstellen</button>
		</div>
	{:else}
		test
	{/if}
</div>
