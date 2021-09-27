<script>
    import AllTimeStatistics from './AllTimeStatistics.svelte';
    import PerSeasonStatistics from './PerSeasonStatistics.svelte';
    export let leagueStatistics, totals, stale;
    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        totals = newTransactions.totals;
    }
    if(stale) {
        refreshTransactions();
    }
    const {leagueRosterStatistics, leagueWeekStatistics, currentManagers, mostSeasonLongPoints, seasonWeekStatistics, currentYear, lastYear} = leagueStatistics;
</script>

<style>
    .rankingsWrapper {
        margin: 0 auto;
        width: 100%;
        max-width: 1200px;
    }
    .empty {
        margin: 10em 0 4em;
        text-align: center;
    }
</style>

<div class="rankingsWrapper">
    {#if leagueWeekStatistics.length}
        <AllTimeRecords transactionTotals={totals} {leagueRosterStatistics} {leagueWeekStatistics} {currentManagers} {mostSeasonLongPoints} />
    {:else}
        <p class="empty">No records <i>yet</i>...</p>
    {/if}
    <PerSeasonStatistics transactionTotals={totals} {leagueRosterStatistics} {seasonWeekStatistics} {currentManagers} {currentYear} {lastYear} />
</div>
