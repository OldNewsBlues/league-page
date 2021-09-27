<script>
    import {round} from '$lib/utils/helper'
  	import StatisticsAndRankings from './StatisticsAndRankings.svelte';
    export let leagueRosterStatistics, seasonWeekStatistics, currentManagers, currentYear, lastYear, transactionTotals;
    const yearsObj = {};
    const years = [];
    let loopYear = currentYear;
    while(loopYear >= lastYear) {
        yearsObj[loopYear] = {
            seasonLongRecords: [],
            winPercentages: [],
            lineupIQs: [],
            fptsHistories: [],
            tradesData: [],
            waiversData: [],
            showTies: false,
            year: loopYear
        }
        loopYear--;
    }
    for(const seasonWeekStatistic of seasonWeekStatistics) {
        yearsObj[seasonWeekStatistic.year].weekStatistics = seasonWeekStatistic.seasonPointsRecords;
        for(const weekStatistic of yearsObj[seasonWeekStatistic.year].weekStatistics) {
            weekStatistic.fpts = round(weekStatistic.fpts);
        }
    }
    
    for(const season in transactionTotals.seasons) {
        if(!yearsObj[season]) continue;
        for(const rosterID in transactionTotals.seasons[season]) {
            yearsObj[season].tradesData.push({
                rosterID,
                manager: transactionTotals.seasons[season][rosterID].manager,
                trades: transactionTotals.seasons[season][rosterID].trade,
            })
            yearsObj[season].waiversData.push({
                rosterID,
                manager: transactionTotals.seasons[season][rosterID].manager,
                waivers: transactionTotals.seasons[season][rosterID].waiver,
            })
        }
    }
    for(const rosterID in leagueRosterStatistics) {
        const leagueRosterStatistic = leagueRosterStatistics[rosterID];
        for(const season of leagueRosterStatistic.years) {
            // check for ties
            if(season.ties > 0) {
                yearsObj[season.year].showTies = true;
            }
			const fpts = round(season.fpts);
            // add season-long scoring record
            yearsObj[season.year].seasonLongStatistics.push({
                manager: season.manager,
				rosterID,
				fpts,
				year: null,
			})
            // add win percentage rankings
            yearsObj[season.year].winPercentages.push({
                rosterID,
                manager: season.manager,
                percentage: round((season.wins + season.ties / 2) / (season.wins + season.ties + season.losses) * 100),
                wins: season.wins,
                ties: season.ties,
                losses: season.losses,
            })
            // add lineup IQ rankings
            let lineupIQ = {
                rosterID,
                manager: season.manager,
                fpts: round(season.fpts),
            }
            if(season.potentialPoints) {
                lineupIQ.iq = round(season.fpts / season.potentialPoints * 100);
                lineupIQ.potentialPoints = round(season.potentialPoints);
            }
            yearsObj[season.year].lineupIQs.push(lineupIQ)
            // add fantasy points histories
            yearsObj[season.year].fptsHistories.push({
                rosterID,
                manager: season.manager,
                fptsFor: round(season.fpts),
                fptsAgainst: round(season.fptsAgainst),
            })
        }
    }
    for(const key in yearsObj) {
        // sort records
        yearsObj[key].seasonLongStatistics = yearsObj[key].seasonLongStatistics.sort((a, b) => b.fpts - a.fpts).slice(0, 10);
        
        // sort rankings
        yearsObj[key].winPercentages.sort((a, b) => b.percentage - a.percentage);
        yearsObj[key].lineupIQs.sort((a, b) => b.iq - a.iq);
        yearsObj[key].fptsHistories.sort((a, b) => b.fptsFor - a.fptsFor);
        yearsObj[key].tradesData.sort((a, b) => b.trades - a.trades);
        yearsObj[key].waiversData.sort((a, b) => b.waivers - a.waivers);
        // add to array
        years.push(yearsObj[key]);
    }
    years.sort((a, b) => b.year - a.year);
</script>

{#each years as {waiversData, tradesData, weekStatistics, seasonLongStatistics, showTies, winPercentages, fptsHistories, lineupIQs, year}, ix}
    <StatisticsAndRankings
        {waiversData}
        {tradesData}
        {weekStatistics}
        {seasonLongStatistics}
        {showTies}
        {winPercentages}
        {fptsHistories}
        {lineupIQs}
        prefix={year}
        {currentManagers}
        last={ix == years.length - 1}
    />
{/each}
