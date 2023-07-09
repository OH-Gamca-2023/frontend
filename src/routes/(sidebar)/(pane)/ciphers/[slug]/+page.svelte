<script lang="ts">
	import { slide } from 'svelte/transition'
	import type { Cipher } from '$lib/types/ciphers'
	import Icon from '$lib/components/Icon.svelte'
	import { ciphers, loadCipherSubmissions } from '$lib/api/models/ciphers'
	import type { PageData } from './$types'
	import { userState } from '$lib/state'
	import timeAgo from '$lib/utils/timeago'
	import { toast } from '$lib/utils/toasts'
	import { submitCipherSolution, type ErrorResponse } from '$lib/api'
	import { subSeconds } from '$lib/data/timer'
	import CipherTask from '$lib/components/ciphers/CipherTask.svelte'

	export let data: PageData

	$: id = data.cipherId
	$: cipher = ($ciphers[id] ?? null) as Cipher | null

	$: userClass = $userState.loggedIn ? $userState.user!.clazz : undefined
	$: solving =
		$userState.loggedIn && $userState.user
			? $userState.user.clazz.grade.cipher_competing
				? 'class'
				: $userState.user.individual_cipher_solving
				? 'individual'
				: 'none'
			: 'none'
	$: statusData = cipher && $userState.loggedIn && solving !== 'none' ? cipher.data : undefined

	$: solved = cipher?.submissions.some((s) => s.correct)
	$: nextSubmitTime =
		!cipher || cipher.submissions.length === 0
			? 0
			: cipher.submissions[0].time.getTime() +
			  1000 * cipher.submission_delay * (solving == 'individual' ? 2 : 1)
	$: canSubmit =
		!solved &&
		(!cipher ? false : cipher.submissions.length === 0 || nextSubmitTime < $subSeconds.getTime())

	let submitting = false
	let answer = ''
	async function submitAnswer() {
		if (!cipher) {
			toast({ type: 'error', title: 'Nepodarilo sa nájsť šifru', duration: 5000 })
			return
		}
		if (submitting) return
		if (!answer) {
			toast({ type: 'error', title: 'Nemôžeš odoslať prázdnu odpoveď', duration: 5000 })
			return
		}
		if (!canSubmit) {
			toast({ type: 'error', title: 'Ešte nemôžeš odoslať ďalšiu odpoveď', duration: 5000 })
			return
		}
		submitting = true
		const resp = await submitCipherSolution(cipher.id, answer)
		if (!resp.error) {
			await loadCipherSubmissions(cipher)
			answer = ''
			toast({ type: 'success', title: 'Odpoveď bola odoslaná', duration: 5000 })
			submitting = false
		} else {
			switch ((resp as ErrorResponse).status) {
				case 429:
					toast({ type: 'error', title: 'Ešte nemôžeš odoslať ďalšiu odpoveď', duration: 5000 })
					break
				case 400:
				default:
					toast({ type: 'error', title: 'Nastala chyba pri odosielaní odpovede', duration: 5000 })
					break
			}
			submitting = false
		}
	}

	let hintOpen = false
</script>

<div class="flex flex-col space-y-2 w-full">
	{#await ciphers.load()}
		<div class="flex flex-row justify-center items-center space-x-2">
			<Icon icon="mdi:loading" class="w-10 h-10 animate-spin" />
			<span class="text-xl font-bold">Načítavam šifry...</span>
		</div>
	{:then _}
		{#if $userState.loggedIn && $userState.user}
			{#if !$userState.user.clazz.grade.cipher_competing}
				<div
					class="flex flex-row justify-center items-center space-x-2 border-b border-gray-300 pb-4 mb-4 dark:border-gray-500 w-full"
				>
					<Icon icon="mdi:emoticon-sad-outline" class="w-10 h-10 mr-2" />
					<div class="flex flex-col">
						<span class="text-xl font-bold">Tvoja trieda sa nezúčastuje tejto šifrovačky.</span>
						{#if solving === 'individual'}
							<span class="text-sm">Stále však môžeš riešiť šifry individuálne.</span>
						{/if}
					</div>
				</div>
			{/if}
		{:else}
			<div
				class="flex flex-row justify-center items-center space-x-2 border-b border-gray-300 pb-4 mb-4 dark:border-gray-500 w-full"
			>
				<Icon icon="mdi:emoticon-sad-outline" class="w-10 h-10 mr-2" />
				<span class="text-xl font-bold">Musíš byť prihlásený na to, aby si mohol riešiť šifry.</span
				>
			</div>
		{/if}
		{#if !cipher || !cipher.started}
			<div class="flex flex-row justify-center items-center space-x-2 pb-4">
				<Icon icon="mdi:stop-remove-outline" class="w-10 h-10 mr-2" />
				<span class="text-xl font-bold">Nepodarilo sa nájsť šifru.</span>
			</div>
		{:else}
			<div class="flex flex-col space-y-5 md:flex-row flex-wrap">
				<div class="flex flex-col space-y-5 basis-1/2 2xl:basis-1/5 order-1 p-3">
					<div class="flex flex-col space-y-2">
						<span class="text-xl font-bold text-gray-500 dark:text-gray-400"
							>Šifra číslo #{cipher.id}</span
						>
						<span class="text-3xl font-bold">{cipher.name}</span>
					</div>
					<div class="flex flex-col space-y">
						<span class="text-md font-bold"
							>Zadanie bolo zverejnené {timeAgo.format(cipher.start)}</span
						>
						<span class="text-md font-bold text-gray-500 dark:text-gray-400"
							>{String(cipher.start.getDate()).padStart(2, '0')}. {String(
								cipher.start.getMonth() + 1,
							).padStart(2, '0')}.
							{cipher.start.getFullYear()} o {String(cipher.start.getHours()).padStart(
								2,
								'0',
							)}:{String(cipher.start.getMinutes()).padStart(2, '0')}</span
						>
					</div>
					<div class="flex flex-col space-y">
						{#if cipher.hint_publish_time}
							{#if cipher.hint_visible}
								<span class="text-md font-bold"
									>Nápoveda bola zverejnená {timeAgo.format(cipher.hint_publish_time)}</span
								>
							{:else}
								<span class="text-md font-bold"
									>Nápoveda bude zverejnená {timeAgo.format(cipher.hint_publish_time)}</span
								>
							{/if}
							<span class="text-md font-bold text-gray-500 dark:text-gray-400"
								>{String(cipher.hint_publish_time.getDate()).padStart(2, '0')}. {String(
									cipher.hint_publish_time.getMonth() + 1,
								).padStart(2, '0')}.
								{cipher.hint_publish_time.getFullYear()} o {String(
									cipher.hint_publish_time.getHours(),
								).padStart(2, '0')}:{String(cipher.hint_publish_time.getMinutes()).padStart(
									2,
									'0',
								)}</span
							>
						{:else}
							<span class="text-md font-bold">Pre túto šifru nie je k dispozícii nápoveda</span>
							<span class="text-md font-bold text-gray-500 dark:text-gray-400">-</span>
						{/if}
					</div>
					<div class="flex flex-col space-y">
						{#if cipher.has_ended}
							<span class="text-md font-bold"
								>Odovzdávanie riešení skončilo {timeAgo.format(cipher.end)}</span
							>
						{:else}
							<span class="text-md font-bold"
								>Odovzdávanie riešení končí {timeAgo.format(cipher.end)}</span
							>
						{/if}
						<span class="text-md font-bold text-gray-500 dark:text-gray-400"
							>{String(cipher.end.getDate()).padStart(2, '0')}. {String(
								cipher.end.getMonth() + 1,
							).padStart(2, '0')}.
							{cipher.end.getFullYear()} o {String(cipher.end.getHours()).padStart(2, '0')}:{String(
								cipher.end.getMinutes(),
							).padStart(2, '0')}</span
						>
					</div>
					{#if cipher.hint_publish_time && cipher.hint_visible}
						<div
							class="flex flex-col border-t border-gray-300 pt-4 mt-4 dark:border-gray-500 justify-center items-center"
						>
							<button
								class="flex flex-row w-full justify-between items-center space-x-2 cursor-pointer"
								on:click={() => (hintOpen = !hintOpen)}
							>
								<Icon
									icon="mdi:chevron-right"
									class="w-10 h-10 mr-2 transform transition-transform duration-300 {hintOpen
										? 'rotate-90'
										: ''}"
								/>

								<div class="flex flex-col flex-1 text-right space-y">
									<span class="text-xl font-bold">Nápoveda</span>
									<span class="text-md">Klikni pre rozbalenie nápovedy</span>
								</div>
							</button>
							{#if hintOpen}
								<div
									class="flex flex-col mt-4 bg-gray-900 bg-opacity-25 p-4 rounded-lg"
									transition:slide={{ duration: 300 }}
								>
									{#if cipher.hint}
										<span class="text-lg font-bold">{cipher.hint}</span>
									{:else}
										<span class="text-md text-red-500 dark:text-red-400"
											>Nápoveda nie je k dispozícii. Pravdepodobne nastala chyba.</span
										>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
				<div
					class="flex flex-col p-5 flex-1 order-4 2xl:order-2 border-t basis-full 2xl:basis-2/5 border-gray-300 pt-4 mt-4 dark:border-gray-500 md:border-t-0 md:pt-3 md:mt-0"
				>
					<span class="text-xl font-bold pb-5">Zadanie</span>
					<CipherTask {cipher} />
				</div>
				<div
					class="flex flex-col space-y-5 basis-1/2 2xl:basis-1/5 text-right order-3
						   p-3 border-t border-gray-300 pt-4 mt-4 dark:border-gray-500 md:border-t-0 md:pt-3 md:mt-0"
				>
					{#if $userState.loggedIn && userClass}
						<div class="flex flex-col">
							<span class="text-md text-gray-700 dark:text-gray-200">
								{#if solving == 'individual'}
									Riešiš individuálne:
								{:else if solving == 'class'}
									Riešiš za triedu:
								{:else}
									Individuálne riešenie:
								{/if}
							</span>
							<span class="text-xl font-bold">
								{#if solving == 'individual'}
									{$userState.user?.username}
								{:else if solving == 'class'}
									{userClass.name}
								{:else}
									Nemáš povolené
								{/if}
							</span>
						</div>
						<div class="flex flex-col border-b border-gray-300 pb-4 mb-4 dark:border-gray-500">
							<span class="text-lg text-gray-700 dark:text-gray-200">Stav:</span>

							{#if statusData?.solved && !statusData?.after_hint}
								<span class="text-green-500 dark:text-green-400 text-xl font-bold">Vyriešené</span>
							{:else if statusData?.solved && statusData?.after_hint}
								<span class="text-xl font-bold text-yellow-500 dark:text-yellow-400"
									>Vyriešené po nápovede</span
								>
							{:else}
								<span class="text-red-500 dark:text-red-500 text-xl font-bold">Nevyriešené</span>
							{/if}
						</div>
						<div class="flex flex-col justify-between text-center h-full flex-1">
							{#if solving != 'none'}
								<div class="flex flex-col">
									<span class="text-xl 2xl:text-2xl font-bold">Odoslané riešenia</span>
									<div
										class="flex flex-col rounded-md border border-gray-300 dark:border-gray-500 mt-5"
									>
										<div
											class="flex flex-row justify-between items-center p-2 bg-gray-100 dark:bg-gray-700
											border-b border-gray-300 dark:border-gray-500 rounded-t-md"
										>
											<span class="text-sm 2xl:text-md font-bold basis-2/5 text-left">Riešenie</span
											>
											<span class="text-sm 2xl:text-md font-bold">Nápoveda</span>
											<span class="text-sm 2xl:text-md font-bold basis-2/5 text-right"
												>Dátum a čas</span
											>
										</div>
										{#each cipher.submissions as submission, i}
											<div
												class="flex flex-row justify-between items-center bg-opacity-40 hover:bg-opacity-60 p-2
												border-b border-gray-300 dark:border-gray-500"
												class:bg-green-500={submission.correct}
												class:bg-red-500={!submission.correct}
												class:rounded-b-md={i === cipher.submissions.length - 1}
											>
												<span class="text-sm 2xl:text-md font-bold basis-2/5 text-left"
													>{submission.answer}</span
												>
												<span class="text-sm 2xl:text-md font-bold">
													{#if submission.after_hint}
														<Icon icon="mdi:lightbulb-on" class="w-6 h-6 text-orange-400" />
													{:else}
														<Icon icon="mdi:lightbulb-outline" class="w-6 h-6 text-gray-500" />
													{/if}
												</span>
												<span class="text-sm 2xl:text-md font-bold basis-2/5 text-right">
													<span class="pr-1"
														>{String(submission.time.getDate()).padStart(2, '0')}. {String(
															submission.time.getMonth() + 1,
														).padStart(2, '0')}.</span
													>
													<span
														>{String(submission.time.getHours()).padStart(2, '0')}:{String(
															submission.time.getMinutes(),
														).padStart(2, '0')}</span
													>
												</span>
											</div>
										{:else}
											<div
												class="flex flex-row justify-between items-center bg-opacity-40 p-2
												border-b border-gray-300 dark:border-gray-500"
											>
												<i class="text-lg">Ešte ste neodoslali žiadne riešenie</i>
											</div>
										{/each}
									</div>
								</div>
								<div class="flex flex-col">
									<span class="text-2xl font-bold mt-5">Odoslať riešenie</span>
									<form>
										<label for="answer" class="text-md font-bold text-red-500 dark:text-red-400">
											{#if !canSubmit && solved}
												Nemôžete odoslať ďalšie riešenie,<br />keďže ste už šifru vyriešili.
											{:else if !canSubmit && nextSubmitTime}
												{#key $subSeconds}
													Ďalšie riešenie môžete odoslať {String(
														timeAgo.format(nextSubmitTime),
													).replace('teraz', 'o menej ako minútu')}.
												{/key}
											{:else if !cipher.started}
												Nemôžete odoslať riešenie, keďže šifra ešte nezačala.
											{:else if cipher.has_ended}
												Nemôžete odoslať riešenie, keďže šifra už skončila.
											{:else if !canSubmit}
												Nastala interná chyba, kvôli ktorej nemôžete odoslať riešenie. Skúste prosím
												obnoviť stránku.<br />
												<i class="text-sm text-gray-500 dark:text-gray-400"
													>Ak sa chyba nevyrieši, kontaktujte administrátora.</i
												>
											{/if}
										</label>
										<div class="flex flex-col md:flex-row w-full pt-2">
											<input
												type="text"
												id="answer"
												name="answer"
												class="flex-1 rounded-t-md md:rounded-l-md md:rounded-tr-none border border-gray-300 dark:border-gray-500 p-2
												focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
												text-gray-700"
												size="10"
												placeholder="Zadajte riešenie"
												autocomplete="off"
												autocorrect="off"
												autocapitalize="off"
												spellcheck="false"
												bind:value={answer}
												disabled={!cipher.started || cipher.has_ended}
											/>
											<button
												type="submit"
												class="flex-none rounded-b-md md:rounded-r-md md:rounded-bl-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500
												px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed
												transition-all duration-200 ease-in-out disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
												on:click|preventDefault={submitAnswer}
												disabled={!canSubmit ||
													submitting ||
													!answer ||
													!cipher.started ||
													cipher.has_ended}
											>
												Odoslať
											</button>
										</div>
									</form>
								</div>
							{/if}
						</div>
					{:else if $userState.loggedIn}
						<span class="text-red-500 dark:text-red-400">Nastala chyba pri spracovaní údajov.</span>
					{:else}
						<span class="text-gray-500 dark:text-gray-400"
							>Pre odovzdanie riešenia<br />sa musíte prihlásiť.</span
						>
						<a
							href="/auth/login"
							class="block p-2 mt-2 text-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-900
									rounded-md shadow-md">Prihlásiť sa</a
						>
					{/if}
				</div>
			</div>
		{/if}
	{/await}
</div>
