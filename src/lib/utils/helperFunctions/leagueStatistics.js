import { getLeagueData } from './leagueData';
import { leagueID } from '$lib/utils/leagueInfo';
import { getNflState } from './nflState';
import { getLeagueStatistics } from "./leagueStatistics"
import { getLeagueUsers } from "./leagueUsers"
import { waitForAll } from './multiPromise';
import { get } from 'svelte/store';
import {statisticsStore} from '$lib/stores';

export const getLeagueStatistics = async () => {
	if(get(statisticsStore).seasonWeekStatistics) {
		return get(statisticsStore);
	}
	const nflState = await getNflState().catch((err) => { console.error(err); });
	let week = 0;
	if(nflState.season_type == 'regular') {
		week = nflState.week - 1;  // ORIGINAL CODE HAD nflState.week - 1
	} else if(nflState.season_type == 'post') {
		week = 18;
	}

	let curSeason = leagueID;
	
	let currentManagers;

	let currentYear;
	let lastYear;

	let leagueRosterStatistics = {}; // every full season stat point (for each year and all years combined)
	let seasonWeekStatistics = []; // highest weekly points within a single season
	let leagueWeekStatistics = []; // highest weekly points within a single season
	let mostSeasonLongPoints = []; // 10 highest full season points

	while(curSeason && curSeason != 0) {
		const [rosterRes, users, leagueData] = await waitForAll(
			getLeagueRosters(curSeason),
			getLeagueUsers(curSeason),
			getLeagueData(curSeason),
		).catch((err) => { console.error(err); });
	
		let year = parseInt(leagueData.season);

		// on first run, week is provided above from nflState,
		// after that get the final week of regular season from leagueData
		if(leagueData.status == 'complete' || week > leagueData.settings.playoff_week_start - 1) {
 			week = leagueData.settings.playoff_week_start - 1
		} 

		lastYear = year;
	
		const rosters = rosterRes.rosters;
	
		const originalManagers = {};
	
		for(const roster of rosters) {
			const rosterID = roster.roster_id;
			const user = users[roster.owner_id];

			if(user) {
				originalManagers[rosterID] = {
					avatar: `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
					name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
				}
			} else {
				originalManagers[rosterID] = {
					avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
					name: 'Unknown Manager',
				}
			}

			if(roster.settings.wins == 0 && roster.settings.ties == 0 && roster.settings.losses == 0) continue;

			if(!leagueRosterStatistics[rosterID]) {
				leagueRosterStatistics[rosterID] = {
					wins: 0,
					losses: 0,
					ties: 0,
					fptsFor: 0,
					fptsAgainst: 0,
					potentialPoints: 0,
					years: []
				}
			}

			const fpts = roster.settings.fpts + (roster.settings.fpts_decimal / 100);
			const fptsAgainst = roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100);
			const potentialPoints = roster.settings.ppts + (roster.settings.ppts_decimal / 100);

			// add records to league roster record record
			leagueRosterStatistics[rosterID].wins += roster.settings.wins;
			leagueRosterStatistics[rosterID].losses += roster.settings.losses;
			leagueRosterStatistics[rosterID].ties += roster.settings.ties;
			leagueRosterStatistics[rosterID].fptsFor += fpts;
			leagueRosterStatistics[rosterID].fptsAgainst += fptsAgainst;
			leagueRosterStatistics[rosterID].potentialPoints += potentialPoints;

			// add singleSeason info [`${year}fptsFor`]
			const singleYearInfo = {
				wins: roster.settings.wins,
				losses: roster.settings.losses,
				ties: roster.settings.ties,
				fpts,
				fptsAgainst,
				potentialPoints,
				manager: originalManagers[rosterID],
				year
			}

			leagueRosterStatistics[rosterID].years.push(singleYearInfo);

			mostSeasonLongPoints.push({
				rosterID,
				fpts,
				year,
				manager: originalManagers[rosterID]
			})
		}
		
		if(!currentManagers) {
			currentManagers = originalManagers;
		}

		// loop through each week of the season
		const matchupsPromises = [];
		while(week > 0) {
			matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${curSeason}/matchups/${week}`, {compress: true}))
			week--;
		}
	
		const matchupsRes = await waitForAll(...matchupsPromises).catch((err) => { console.error(err); });

		// convert the json matchup responses
		const matchupsJsonPromises = [];
		for(const matchupRes of matchupsRes) {
			const data = matchupRes.json();
			matchupsJsonPromises.push(data)
			if (!matchupRes.ok) {
				throw new Error(data);
			}
		}
		const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => { console.error(err); });

		// now that we've used the current season ID for everything we need, set it to the previous season
		curSeason = leagueData.previous_league_id;

		const seasonPointsStatistic = [];
		// process all the matchups
		for(let matchupWeek = 0; matchupWeek < matchupsData.length; matchupWeek++) { // OC started with 0
			for(const matchup of matchupsData[matchupWeek]) {
				const entry = {
					manager: originalManagers[matchup.roster_id],
					fpts: matchup.points,
					week: matchupWeek + 1, // OC HAD + 1 with week originally set to nflState - 1 at top
					year,
					rosterID: matchup.roster_id
				}
				seasonPointsStatistic.push(entry);
				leagueWeekStatistics.push(entry);
			}
		}
		const interSeasonEntry = {
			year,
			seasonPointsStatistics: seasonPointsStatistic.sort((a, b) => b.fpts - a.fpts).slice(0, 10)
		}

		if(interSeasonEntry.seasonPointsStatistics.length > 0) {
			if(!currentYear) {
				currentYear = year;
			}
			seasonPointsStatistics.push(interSeasonEntry)
		};
	}

	leagueWeekStatistics = leagueWeekStatistics.sort((a, b) => b.fpts - a.fpts).slice(0, 10);
	mostSeasonLongPoints = mostSeasonLongPoints.sort((a, b) => b.fpts - a.fpts).slice(0, 10);

	const statisticsData = {
		mostSeasonLongPoints,
		leagueWeekStatistics,
		seasonWeekStatistics,
		leagueRosterStatistics,
		currentManagers,
		currentYear,
		lastYear
	};

	statisticsStore.update(() => statisticsData);

	return statisticsData; //Jesse
}
