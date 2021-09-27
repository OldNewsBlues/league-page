<script>
    import { getLeagueStatistics, getLeagueTransactions } from '$lib/utils/helper'; //j

    import AllTimeStatistics from './AllTimeStatistics.svelte';
    import PerSeasonStatistics from './PerSeasonStatistics.svelte';

    export let leagueStatistics, totals, stale;

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        totals = newTransactions.totals;
    }

    let {leagueRosterStatistics, leagueWeekStatistics, allTimeClosestMatchups, allTimeBiggestBlowouts, currentManagers, mostSeasonLongPoints, seasonWeekStatistics, currentYear, lastYear} = leagueStatistics;

    const refreshStatistics = async () => {
        const newStatistics = await getLeagueStatistics(true);

        // update values with new data
        leagueStatistics = newStatistics;
        leagueRosterStatistics = newStatistics.leagueRosterStatistics;
        leagueWeekStatistics = newStatistics.leagueWeekStatistics;
        allTimeClosestMatchups = newStatistics.allTimeClosestMatchups;
        allTimeBiggestBlowouts = newStatistics.allTimeBiggestBlowouts;
        currentManagers = newStatistics.currentManagers;
        mostSeasonLongPoints = newStatistics.mostSeasonLongPoints;
        seasonWeekStatistics = newStatistics.seasonWeekRecords;
        currentYear = newStatistics.currentYear;
        lastYear = newStatistics.lastYear;
    }

    if(stale) {
        refreshTransactions();
    }

    if(leagueStatistics.stale) {
        refreshStatistics();
    }

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
        <AllTimeStatistics transactionTotals={totals} {allTimeClosestMatchups} {allTimeBiggestBlowouts} {leagueRosterStatistics} {leagueWeekStatistics} {currentManagers} {mostSeasonLongPoints} />
    {:else}
        <p class="empty">No records <i>yet</i>...</p>
    {/if}
    <PerSeasonStatistics transactionTotals={totals} {leagueRosterStatistics} {seasonWeekStatistics} {currentManagers} {currentYear} {lastYear} />
</div>
