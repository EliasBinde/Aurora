<script>
	import AuditLog from '$lib/auditLog.svelte';

	import Dashboard from '$lib/dashboard.svelte';
	import Locations from '$lib/locations.svelte';
	import Tickets from '$lib/tickets.svelte';

	import Violations from '$lib/violations.svelte';

	let tab = 'dashboard';
</script>

<div class="flex bg-neutral h-screen">
	<div class="min-w-max w-44 top-0 left-0 mt-4 ml-4 px-0 rounded-xl">
		<div class="flex flex-col">
			<div class="artboard artboard-demo p-3 uppercase font-bold text-xl rounded-lg cursor-default">
				Admin
			</div>
			<div class="divider my-3" />
			<div
				class={`btn mb-2 ${tab === 'dashboard' ? 'btn-primary' : ''}`}
				on:click={() => {
					tab = 'dashboard';
				}}
			>
				Dashboard
			</div>
			<div
				class={`btn my-2 ${tab === 'tickets' ? 'btn-primary' : ''}`}
				on:click={() => {
					tab = 'tickets';
				}}
			>
				Vorfälle
			</div>
			<div
				class={`btn my-2 ${tab === 'locations' ? 'btn-primary' : ''}`}
				on:click={() => {
					tab = 'locations';
				}}
			>
				Locations
			</div>
			<div
				class={`btn my-2 ${tab === 'violations' ? 'btn-primary' : ''}`}
				on:click={() => {
					tab = 'violations';
				}}
			>
				Tatbestände
			</div>
			<div
				class={`btn my-2 ${tab === 'logs' ? 'btn-primary' : ''}`}
				on:click={() => {
					tab = 'logs';
				}}
			>
				Audit Logs
			</div>
		</div>
	</div>
	{#if tab === 'logs'}
		<AuditLog />
	{/if}
	{#if tab === 'dashboard'}
		<Dashboard />
	{/if}
	{#if tab === 'tickets'}
		<Tickets />
	{/if}
	{#if tab === 'locations'}
		<Locations />
	{/if}
	{#if tab === 'violations'}
		<Violations />
	{/if}
</div>
