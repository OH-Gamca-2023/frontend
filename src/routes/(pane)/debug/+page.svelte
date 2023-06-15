<script lang="ts">
	import { userState } from '$lib/state'
</script>

<div class="flex flex-col">
	<span class="text-xl font-bold">Debug</span>
	<span class="text-lg">State</span>
	<pre class="text-sm">
        {JSON.stringify($userState, null, 2)}
    </pre>
</div>
