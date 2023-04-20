<script lang="ts">
	import { getApiHost } from '$lib/api/data'
</script>

<h1 class="text-2xl font-bold">Developer options</h1>

<div class="italic text-gray-500 mt-5">
	<p>All documentation for APIs and other developer options is written in english.</p>
	<p>It is assumed that anyone using any of these options is familiar with the english language.</p>
</div>

<div class="mt-5 flex flex-col items-center justify-center">
	<h2 class="text-xl font-bold">API</h2>
	<div class="mt-5 flex flex-col items-center justify-center">
		<h3 class="text-lg font-bold">API usage</h3>
		<ul class="mt-2 list-disc list-inside">
			<li>Direct API endpoint usage is not recommended and not officialy supported.</li>
			<li>If you really need to use the API directly, feel free to do so.</li>
			<li>
				However, you should be aware that if you do, you will be responsible for any issues that
				arise.
			</li>
			<li>There will be no support for any issues that arise from using the API directly.</li>
			<li>
				We reserve the right to ban any accounts or IP addresses that are found to be abusing the
				API.
			</li>
		</ul>
	</div>
	<div class="mt-5 flex flex-col items-center justify-center">
		<h3 class="text-lg font-bold">API endpoints</h3>
		<ul class="mt-2 list-disc list-inside">
			<li>
				As there is no official support for using the API directly, we do not provide a list of API
				endpoints.
			</li>
			<li>
				However, you can find a list of used API endpoints in the source code of the website
				frontend.
			</li>
		</ul>
	</div>
</div>

<div class="mt-7 flex flex-col items-center justify-center">
	<h2 class="text-xl font-bold">News feed</h2>
	<div class="mt-5 flex flex-col items-center justify-center">
		<h3 class="text-lg font-bold">RSS feed</h3>
		<ul class="mt-2 list-disc list-inside">
			<li>
				The RSS feed for the posts can be found at <a
					href="{getApiHost()}/rss"
					target="_blank"
					class="underline text-blue-500">{getApiHost()}/rss</a
				>.
			</li>
			<li>
				More details about the RSS feed can be found in the <a
					href="/dev/rss"
					class="underline text-blue-500">RSS feed documentation</a
				>.
			</li>
		</ul>
	</div>
	<div class="mt-5 flex flex-col items-center justify-center">
		<h3 class="text-lg font-bold">Discord webhook</h3>
		<ul class="mt-2 list-disc list-inside">
			<li>
				We have support for Discord webhooks. See the <a
					href="/dev/discord"
					class="underline text-blue-500">Discord webhook documentation</a
				> for more details.
			</li>
			<li>When a new post is created, a message will be sent to the webhook.</li>
			<li>
				When a post is updated, the old message will be deleted and a new message will be sent to
				the webhook.
			</li>
			<li>When a post is deleted, the old message will be deleted.</li>
		</ul>
	</div>
</div>
