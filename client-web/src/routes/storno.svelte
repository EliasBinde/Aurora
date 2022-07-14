<script lang="ts">
	import axios from 'axios';

	let aktenzeichen = '';
	let step = 0;
	let filename = '';
	let checkProgress = 0;

	let paying = false;

	let result: any = {};

	let image = '';
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
			filename = i.name;
			image = res;
		}
	};
	const submit = async () => {
		step = 2;
		setTimeout(() => {
			checkProgress = 15 + Math.floor(Math.random() * 30);
		}, 100);
		const res = await axios.post('http://localhost:8080/checkTicket', {
			image: image,
			aktenzeichen: aktenzeichen
		});
		checkProgress = 65;
		if (res.data) {
			result = res.data;
		}
		setTimeout(() => {
			checkProgress = 100;
		}, 100);
		setTimeout(() => {
			step = 3;
		}, 400);
	};

	const pay = async () => {
		paying = true;
		const res = await axios.post('http://localhost:8080/pay', {
			aktenzeichen: aktenzeichen,
			stripePriceId: result.stripePriceId
		});
		const url = res.data;
		window.location.href = url;
	};

	const checkTicket = async () => {
		const res = axios.get(`http://localhost:8080/checkAz/${aktenzeichen}`);
		res
			.catch((err) => {
				console.log(err);
			})
			.then((res) => {
				if (res?.status === 200) {
					step = 1;
				}
			});
	};
</script>

<div class="flex items-center justify-center h-screen bg-base-200">
	<div class="artboard-demo artboard w-fit p-8 mx-4">
		{#if step == 3}
			<div
				class={`title mb-8 font-bold text-3xl rounded-lg cursor-default ${
					result.success ? 'text-success' : 'text-error'
				}`}
			>
				{result?.success ? 'Storno erfolgreich' : 'Storno abgelehnt'}
			</div>
			{#if result?.success}
				<div class="infoText mb-10 text-center">
					Sie erhalten in kürze eine Bestätigung per Mail.
				</div>
			{:else}
				<div class="infoText mb-4 text-center">Grund: {result.denialReason}</div>
				<div class="infoText mb-4 text-center">
					Bezahlen Sie jetzt um weitere Mahnungen vermeiden
				</div>
				<button class={`btn btn-outline mb-10 w-52 ${paying && 'loading'}`} on:click={pay}
					>{paying ? '' : 'Jetzt bezahlen'}</button
				>
			{/if}
		{/if}
		{#if step == 2}
			<div class="title mb-8 font-bold text-3xl rounded-lg cursor-default">Prüfung läuft</div>

			<div
				class="radial-progress mb-8 text-accent"
				style={`--value:${checkProgress}; --size:7rem; --thickness: 8px;`}
			>
				{checkProgress}%
			</div>
		{/if}
		{#if step == 1}
			<div class="title mb-8 font-bold text-3xl rounded-lg cursor-default">Parkberechtigung</div>

			<div class="input-group justify-center overflow-hidden mb-8 mt-4">
				<span class={`btn btn-outline w-full max-w-sm ${image && 'btn-accent'}`}>
					<label
						for="file-upload"
						class="h-full w-full cursor-pointer flex items-center justify-center"
					>
						{image
							? `${filename
									.split('.')
									.slice(0, filename.split('.').length - 1)
									.join('.')
									.substring(0, 14)}...${filename.split('.')[filename.split('.').length - 1]}`
							: 'Auswählen'}
					</label>
				</span>
				<input
					class="input hidden"
					id="file-upload"
					type="file"
					on:change={uploadToClient}
					accept="image/*"
				/>
				<div />

				<label>
					<button class="btn" on:click={submit}>Weiter</button>
				</label>
			</div>
			<div class="infoText mb-8 text-center">
				Bitte achten Sie darauf Ihren Beleg <br /> möglichst gerade und glatt aufzunehmen.
			</div>
		{/if}
		{#if step == 0}
			<div class="title mb-8 font-bold text-3xl rounded-lg cursor-default">Aktenzeichen</div>

			<div class="input-group justify-center">
				<input
					type="text"
					placeholder="Aktenzeichen"
					class="input input-bordered w-full max-w-sm mb-6"
					bind:value={aktenzeichen}
				/>
				<button class="btn" on:click={checkTicket}>Weiter</button>
			</div>
			<div class="infoText mb-2 text-center">
				Ihr Aktenzeichen finden Sie auf allen Schreiben von uns.
			</div>
			<div class="hover:text-accent cursor-pointer mb-8">Nicht zur Hand?</div>
		{/if}
		<ul class="steps">
			<li class={`step ${step >= 0 && 'step-accent'}`}>
				<span class="hidden sm:block">Aktenzeichen</span>
			</li>
			<li class={`step ${step >= 1 && 'step-accent'}`}>
				<span class="hidden sm:block">Parkberechtigung</span>
			</li>
			<li class={`step ${step >= 2 && 'step-accent'}`}>
				<span class="hidden sm:block">Überprüfung</span>
			</li>
			<li class={`step ${step >= 3 && 'step-accent'}`}>
				<span class="hidden sm:block">Ergebnis</span>
			</li>
		</ul>
	</div>
</div>
