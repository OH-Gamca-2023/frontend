<script lang="ts">
	import { userState } from '$lib/state'
</script>

<h1 class="text-2xl font-bold">Discord webhook</h1>

<div class="mt-5 flex flex-col items-center justify-center">
	<h3 class="text-lg font-bold">First some information</h3>
	<div class="mt-2">
		We provide official support for Discord webhooks so that you don't<br />have to mess with the
		API directly, so please, don't use the API directly.
	</div>
	<div class="mt-5 font-bold">
		This is the list of events that will trigger a message to be sent to the webhook:
	</div>
	<ul class="mt-2 list-disc list-inside">
		<li>When a new post is created, a message will be sent to the webhook.</li>
		<li>
			When a post is updated, the old message will be deleted and a new message will be sent to the
			webhook.
		</li>
		<li>
			When a post is deleted, the old message will be replaced with a message saying that the post
			was deleted.
		</li>
	</ul>
</div>

<div class="mt-5 flex flex-col items-center justify-center">
	<h3 class="text-lg font-bold">Setting up the webhook</h3>
	<div class="mt-2">
		To set up the webhook, you need to create a webhook in your Discord server.<br />You can find
		more information about how to create a webhook in the
		<a
			href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
			target="_blank"
			class="underline text-blue-500">Discord documentation</a
		>.
	</div>
	<div class="mt-2">Once you have created the webhook, you need to register it here</div>
	<div class="mt-5 flex flex-col items-center justify-center">
		<h3 class="text-lg font-bold">Registering the webhook</h3>
		{#if $userState.loggedIn}
			<div class="mt-2">To register the webhook, you need to provide the webhook URL.</div>
			<div class="mt-2">
				<input
					type="text"
					class="w-full px-3 py-1 font-bold pl-2 rounded bg-gray-200 dark:bg-slate-800"
					placeholder="Webhook URL"
				/>
			</div>
			<div class="mt-2">
				<button class="bg-blue-500 text-gray-100 px-3 py-1 rounded-lg">Register webhook</button>
			</div>
		{:else}
			<div class="mt-2 text-red-500">To register the webhook, you need to be logged in.</div>
		{/if}
	</div>
</div>

<div class="mt-5 flex flex-col items-center justify-center">
	<h3 class="text-lg font-bold">Unregistering the webhook</h3>
	{#if $userState.loggedIn}
		<div class="mt-2">To unregister the webhook, you need to provide the webhook URL.</div>
		<div class="mt-2">
			<input
				type="text"
				class="w-full px-3 py-1 font-bold pl-2 rounded bg-gray-200 dark:bg-slate-800"
				placeholder="Webhook URL"
			/>
		</div>
		<div class="mt-2">
			<button class="bg-blue-500 text-gray-100 px-3 py-1 rounded-lg">Unregister webhook</button>
		</div>
	{:else}
		<div class="mt-2 text-red-500">To unregister the webhook, you need to be logged in.</div>
	{/if}
	<div class="mt-2">
		<i class="text-gray-500"
			>In case you don't remember the webhook URL, contact us.<br />
			If the webhook gets deleted, it will be automatically unregistered.</i
		>
	</div>
</div>
