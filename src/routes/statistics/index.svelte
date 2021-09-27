<script context="module">
	import { getLeagueStatistics, getLeagueTransactions, waitForAll } from '$lib/utils/helper';
    export async function load() {
        const statisticsInfo = waitForAll(
			getLeagueStatistics(false),
			getLeagueTransactions(false),
		)
	
		return {
			props: {
				statisticsInfo
			}
		};
	}
</script>

<script>
	import LinearProgress from '@smui/linear-progress';
	import { Statistics } from '$lib/components';
    export let statisticsInfo;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }
</style>

<div id="main">
    {#await statisticsInfo}
        <!-- promise is pending -->
        <div class="loading">
            <p>Loading league records...</p>
            <LinearProgress indeterminate />
        </div>
    {:then [leagueStatistics, {totals, stale}]}
        <Statistics {leagueStatistics} {totals} {stale} />
    {:catch error}
        <!-- promise was rejected -->
        <p>Something went wrong: {error.message}</p>
    {/await}
</div>
