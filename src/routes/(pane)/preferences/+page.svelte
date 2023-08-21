<script lang="ts">
	import { userState } from '$lib/state/state'
	import { isOverridden, settingsArray, settingsObject } from '$lib/data/settings'

	$: displayedSettings = $settingsArray.filter(
		(setting) =>
			setting.userEditable || ($userState.loggedIn && $userState.user?.permissions.superuser),
	)
</script>

<div class="flex flex-col">
	<h1 class="text-2xl font-bold">Nastavenia</h1>

	<div class="flex flex-col pt-3">
		{#each displayedSettings as setting}
			<label
				class="flex flex-row basis-full p-2 lg:basis-1/2 hover:bg-black hover:bg-opacity-10 rounded-lg justify-between"
				for={setting.key}
			>
				<div class="flex flex-col flex-grow mr-10">
					<h2 class="text-xl font-bold">{setting.name}</h2>
					{#if setting.description}
						<p>{setting.description}</p>
					{/if}
					{#if !setting.userEditable}
						<p class="text-sm text-red-600 dark:text-red-400 pt-2">
							Toto nastavenie nie je meniteľné používateľmi.
						</p>
					{:else if isOverridden(setting.key)}
						<p class="text-sm text-amber-600 dark:text-amber-400 pt-2">
							Toto nastavenie je aktuálne prepísané serverom.
						</p>
					{/if}
				</div>
				<div class="flex flex-col justify-center">
					{#if setting.type == 'boolean'}
						<div class="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								class="sr-only peer"
								bind:checked={$settingsObject[setting.key]}
								id={setting.key}
								disabled={isOverridden(setting.key)}
							/>
							<div
								class="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300
                                    dark:peer-focus:ring-blue-800 dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['']
                                    after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                    dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
							/>
						</div>
					{:else if setting.type == 'number'}
						<input
							type="number"
							class="form-input rounded-md shadow-sm block mt-1 w-full"
							id={setting.key}
							disabled={isOverridden(setting.key)}
						/>
					{:else if setting.type == 'string'}
						<input
							type="text"
							class="form-input rounded-md shadow-sm block mt-1 w-full"
							id={setting.key}
							disabled={isOverridden(setting.key)}
						/>
					{:else}
						<i class="text-red-500">Failed to render setting</i>
					{/if}
				</div>
			</label>
		{/each}
	</div>
</div>
