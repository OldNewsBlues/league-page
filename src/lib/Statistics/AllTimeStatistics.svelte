<script>
    import {round} from '$lib/utils/helper'
  	import StatisticsAndRankings from './StatisticsAndRankings.svelte';
    
    export let leagueRosterStatistics, leagueWeekStatistics, currentManagers, mostSeasonLongPoints, transactionTotals; //Jesse
    
    let winPercentages = [];
    let lineupIQs = [];
    const fptsHistories = [];
    const tradesData = [];
    const waiversData = [];
    
    let showTies = false;
    
    for(const rosterID in transactionTotals.allTime) {
        tradesData.push({
            rosterID,
            manager: currentManagers[rosterID],
            trades: transactionTotals.allTime[rosterID].trade,
        })
        waiversData.push({
            rosterID,
            manager: currentManagers[rosterID],
            waivers: transactionTotals.allTime[rosterID].waiver,
        })
    }
    
    
    for(const key in leagueRosterStatistics) {
        const leagueRosterStatistic = leagueRosterStatistics[key];
        winPercentages.push({
            rosterID: key,
            manager: currentManagers[key],
            percentage: round((leagueRosterStatistic.wins + leagueRosterStatistic.ties / 2) / (leagueRosterStatistic.wins + leagueRosterStatistic.ties + leagueRosterStatistic.losses) * 100),
            wins: leagueRosterStatistic.wins,
            ties: leagueRosterStatistic.ties,
            losses: leagueRosterStatistic.losses,
        })
        
        let lineupIQ = {
            rosterID: key,
            manager: currentManagers[key],
            fpts: round(leagueRosterStatistic.fptsFor),
        }
        
        if(leagueRosterStatistic.potentialPoints) {
            lineupIQ.iq = round(leagueRosterStatistic.fptsFor / leagueRosterStatistic.potentialPoints * 100);
            lineupIQ.potentialPoints = round(leagueRosterStatistic.potentialPoints);
        }
        
        lineupIQs.push(lineupIQ)
    
        fptsHistories.push({
            rosterID: key,
            manager: currentManagers[key],
            fptsFor: round(leagueRosterStatistic.fptsFor),
            fptsAgainst: round(leagueRosterStatistic.fptsAgainst),
        })
    
        if(leagueRosterStatistic.ties > 0) showTies = true;
    }
    
    winPercentages.sort((a, b) => b.percentage - a.percentage);
    lineupIQs.sort((a, b) => b.iq - a.iq);
    fptsHistories.sort((a, b) => b.fptsFor - a.fptsFor);
    tradesData.sort((a, b) => b.trades - a.trades);
    waiversData.sort((a, b) => b.waivers - a.waivers);
</script>

<StatisticsAndRankings
    {currentManagers}
    weekStatistics={leagueWeekStatistics}
    seasonLongStatistics={mostSeasonLongPoints}
    {showTies}
    {winPercentages}
    {fptsHistories}
    {lineupIQs}
    {tradesData}
    {waiversData}
    prefix="All-Time"
    allTime={true}
/>
