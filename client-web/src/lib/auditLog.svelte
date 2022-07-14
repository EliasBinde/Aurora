<script lang="ts">
	import axios from 'axios';
	import { stringify } from 'postcss';
	import { onMount } from 'svelte';
	let logs: any[] = [];

	let viewLogs: any[] = [];

	let viewMeta: any = '';
	let loadingMeta: any = null;

	function compareValues(key: any, order = 'asc') {
		return function innerSort(a: any, b: any) {
			if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				// property doesn't exist on either object
				return 0;
			}

			const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
			const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

			let comparison = 0;
			if (varA > varB) {
				comparison = 1;
			} else if (varA < varB) {
				comparison = -1;
			}
			return order === 'desc' ? comparison * -1 : comparison;
		};
	}
	onMount(async () => {
		let res = await axios.get('http://localhost:8080/logs');
		logs = res.data;
		viewLogs = logs.sort(compareValues('id', 'desc'));
	});

	const setLoadingMeta = async (val: any) => {
		loadingMeta = val;
		await new Promise((resolve) => setTimeout(resolve, 50));
	};

	const setViewMeta = async (val: any) => {
		const parsed = JSON.parse(val);
		const pretty = syntaxHighlight(JSON.stringify(parsed, undefined, 4));
		viewMeta = pretty;
	};
	const showMeta = async (meta: any, id: any) => {
		await setLoadingMeta(id);
		await setViewMeta(meta);
		await setLoadingMeta(null);
	};
	function syntaxHighlight(json: any) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		json = json.replace(/\r?\n|\r/g, "</pre><pre data-prefix='>'>");
		return (
			`<pre data-prefix=' >' >` +
			json.replace(
				/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
				function (match: any) {
					var cls = 'number';
					if (/^"/.test(match)) {
						if (/:$/.test(match)) {
							cls = 'key';
						} else {
							cls = 'string';
						}
					} else if (/true|false/.test(match)) {
						cls = 'boolean';
					} else if (/null/.test(match)) {
						cls = 'null';
					}
					return '<span class="' + cls + '">' + match + '</span>';
				}
			) +
			'</pre>'
		);
	}
</script>

{#if viewMeta}
	<div
		class="fixed z-20 h-screen w-screen backdrop-blur-2xl flex justify-center items-center"
		on:click={() => {
			viewMeta = null;
		}}
	>
		<div
			class="mockup-code max-w-[calc(100%-8em)]"
			on:click={(e) => {
				e.stopPropagation();
			}}
		>
			<div class="px-2  overflow-scroll max-h-[calc(100vh/2)] scrollbar-hidden">
				{@html viewMeta}
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
		Audit Logs
	</div>
	<div
		class="w-[calc(100%-2rem)] m-4 rounded-lg border border-accent max-h-full overflow-scroll scrollbar-hidden bg-base-200 "
	>
		<table class="table table-zebra w-full ">
			<thead>
				<th> ID </th>
				<th> Type </th>
				<th> Time </th>
				<th> Event </th>
				<th> Aktenzeichen </th>
				<th> Meta </th>
			</thead>
			<tbody>
				{#each viewLogs as log}
					<tr class={log.type == 'info' ? 'border-success' : 'text-error'}>
						<th>{log.id}</th>
						<td class={log.type == 'info' ? 'text-info uppercase' : 'text-error uppercase'}>
							{log.type}
						</td>
						<td> {new Date(log.time).toLocaleString('de-DE')} </td>
						<td> {log.event} </td>
						<td class="text-center"> {log.aktenzeichen ? log.aktenzeichen : 'Keine Zuordnung'} </td>
						<td>
							<button
								class={`btn btn-accent btn-outline w-40 ${loadingMeta == log.id ? 'loading' : ''}`}
								on:click={() => {
									showMeta(log.meta, log.id);
								}}>{loadingMeta == log.id ? '' : 'Meta Anzeigen'}</button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
