let champions = [];
let gamesCache = {};
let playerCache = {};
let players = [];
let playersWinrate = [];
let selectedChampionsWinrate = {
    teamA: [],
    teamB: []
};

const gameStages = {
    early_game_champions: [
        "Lee Sin", "Elise", "Pantheon", "Renekton", "Nidalee", "Draven", "Lucian", "Graves", "Darius", "Rek'Sai", "Xin Zhao",
        "Olaf", "Blitzcrank", "Thresh", "Jarvan IV", "Syndra", "Talon", "Leona", "Zed"
    ],
    mid_game_champions: [
        "Akali", "Ekko", "Kai'Sa", "Yasuo", "Katarina", "Sylas", "Fizz", "Qiyana", "Viktor", "Irelia", "Renekton", "Diana",
        "Zoe", "Corki", "Lucian", "Twisted Fate", "Kled", "Tristana", "Rumble", "Jhin", "Orianna", "Ahri", "Galio", "Rengar",
        "Xin Zhao", "LeBlanc", "Nocturne", "Volibear", "Syndra", "Kassadin", "Aatrox", "Cassiopeia", "Talon", "Yone",
        "Seraphine", "Hecarim", "Zed", "Thresh", "Nautilus", "Rakan", "Pyke", "Alistar", "Blitzcrank", "Nidalee", "Elise",
        "Rek'Sai", "Gragas", "Jarvan IV", "Kha'Zix", "Pantheon", "Graves", "Sett", "Taliyah", "Twitch", "Kalista", "Senna",
        "Aphelios", "Ezreal", "Miss Fortune", "Jinx", "Vayne", "Draven", "Samira", "Sivir", "Ziggs", "Veigar", "Vladimir",
        "Heimerdinger", "Swain", "Fiora", "Riven", "Kayle", "Camille", "Gwen", "Nasus", "Kennen", "Jayce", "Ryze", "Viktor",
        "Tryndamere", "Master Yi", "Shaco", "Warwick", "Udyr", "Ivern", "Kindred", "Lillia", "Darius", "Garen", "Mordekaiser",
        "Sion", "Singed", "Urgot", "Ornn", "Tahm Kench", "Cho'Gath", "Poppy", "Sejuani", "Nunu & Willump", "Rammus", "Amumu",
        "Zac", "Malphite", "Maokai", "Dr. Mundo", "Skarner", "Shyvana", "Volibear", "KSante"
    ],
    late_game_champions: [
        "Vayne", "Kassadin", "Jax", "Kayle", "Azir", "Twitch", "Kog'Maw", "Ryze", "Veigar", "Sivir", "Tristana", "Master Yi",
        "Gangplank", "Senna", "Yasuo", "Nasus", "Ornn", "Aatrox", "Cassiopeia", "Malzahar", "Viktor", "Vladimir", "Jinx",
        "Ezreal", "Aphelios", "Samira", "Kalista", "Draven", "Jhin", "Miss Fortune", "Ashe", "Ziggs", "Xayah", "Seraphine",
        "Syndra", "Swain", "Heimerdinger", "Zoe", "Lux", "Anivia", "Orianna", "Ahri", "Ekko", "Katarina", "Sylas", "Diana",
        "Qiyana", "Galio", "Vel'Koz", "Zilean", "LeBlanc", "Lissandra", "Twisted Fate", "Taliyah", "Neeko", "Morgana", "Brand",
        "Xerath", "Fiddlesticks", "Teemo", "Annie", "Rumble", "Zyra", "Karthus", "Aurelion Sol", "Lulu", "Nami", "Janna", "Karma",
        "Braum", "Yuumi", "Taric", "Thresh", "Rakan", "Leona", "Nautilus", "Blitzcrank", "Alistar", "Pyke", "Tahm Kench", "Bard",
        "Rell", "Maokai", "Shen", "Ivern", "Soraka", "Zac", "Rammus", "Skarner", "Amumu", "Nunu & Willump", "Sejuani", "Volibear",
        "Poppy", "Singed", "Cho'Gath", "Malphite", "Dr. Mundo", "Sion", "Mordekaiser", "Yorick", "Trundle", "Warwick", "Olaf", "Udyr",
        "Shyvana", "Rengar", "Lee Sin", "Nocturne", "Xin Zhao", "Jarvan IV", "Rek'Sai", "Graves", "Kindred", "Elise", "Kha'Zix",
        "Nidalee", "Twitch", "Lucian", "Sivir", "Kai'Sa", "Varus", "Caitlyn", "Kennen", "Graves", "Gnar", "Quinn", "Fiora", "Kled",
        "Pantheon", "Garen", "Shen", "Vladimir", "Wukong", "Akali", "Camille", "Gwen", "Irelia", "Jarvan IV", "Kayle", "Lillia",
        "Malphite", "Mordekaiser", "Sett", "Tahm Kench", "Urgot", "Wukong", "Yone", "Yuumi", "Zeri","KSante", 
    ]
};

function getGameStageComposition(teamChampions) {
    const stageCounts = { early: 0, mid: 0, late: 0 };

    teamChampions.forEach(champion => {
        if (gameStages.early_game_champions.includes(champion)) {
            stageCounts.early++;
        } else if (gameStages.mid_game_champions.includes(champion)) {
            stageCounts.mid++;
        } else if (gameStages.late_game_champions.includes(champion)) {
            stageCounts.late++;
        }
    });

    const maxStage = Object.keys(stageCounts).reduce((a, b) => stageCounts[a] > stageCounts[b] ? a : b);
    const totalChampions = stageCounts.early + stageCounts.mid + stageCounts.late;

    return {
        predominantStage: maxStage,
        compositionPercentage: ((stageCounts[maxStage] / totalChampions) * 100).toFixed(2) + '%'
    };
}

function showSpinner() {
    const spinnerContainer = document.getElementById('spinner-container');
    spinnerContainer.style.display = 'block';
}

function hideSpinner() {
    const spinnerContainer = document.getElementById('spinner-container');
    spinnerContainer.style.display = 'none';
}

async function loadChampions(league) {
    showSpinner();
    try {
        const response = await fetch(`/champions?league=${encodeURIComponent(league)}`);
        console.log(response)
        if (!response.ok) {
            await scrapeData();
        }else{
            champions = await response.json();
            console.log(`Loaded ${champions.length} champions for league ${league}`);
            updateChampionSelects();
        }
    } catch (error) {
        console.error('Failed to load champions:', error);
    } finally {
        hideSpinner();
    }
}

function updateChampionSelects() {
    champions.sort((a, b) => a.name.localeCompare(b.name));

    const championSelectsTeamA = [
        document.getElementById('team-a-champ-1'),
        document.getElementById('team-a-champ-2'),
        document.getElementById('team-a-champ-3'),
        document.getElementById('team-a-champ-4'),
        document.getElementById('team-a-champ-5')
    ];

    const championSelectsTeamB = [
        document.getElementById('team-b-champ-1'),
        document.getElementById('team-b-champ-2'),
        document.getElementById('team-b-champ-3'),
        document.getElementById('team-b-champ-4'),
        document.getElementById('team-b-champ-5')
    ];

    championSelectsTeamA.forEach(select => {
        select.innerHTML = '<option value="">Select Champion</option>';
        champions.forEach(champ => {
            const option = document.createElement('option');
            option.value = champ.name;
            option.textContent = champ.name;
            select.appendChild(option);
        });
    });

    championSelectsTeamB.forEach(select => {
        select.innerHTML = '<option value="">Select Champion</option>';
        champions.forEach(champ => {
            const option = document.createElement('option');
            option.value = champ.name;
            option.textContent = champ.name;
            select.appendChild(option);
        });
    });
}

function getFormattedChampionName(champion) {
    const nameMappings = {
        'Leblanc': 'LeBlanc',
        'Renata': 'Renata Glasc',
        'MissFortune': 'Miss Fortune',
        'TwistedFate': 'Twisted Fate',
        'DrMundo': 'Dr. Mundo',
        'LeeSin': 'Lee Sin',
        'MonkeyKing': 'Wukong',
        'JarvanIV': 'Jarvan IV',
        'XinZhao': 'Xin Zhao',

        // Add more mappings as needed
    };
    const imageMappings = {
        'LeBlanc': 'LeBlanc',
        'Renata Glasc': 'Renata_Glasc',
        'Miss Fortune': 'Miss_Fortune',
        'Twisted Fate': 'Twisted_Fate',
        'Dr. Mundo': 'Dr._Mundo',
        'Lee Sin': 'Lee_Sin',
        'Jarvan IV': 'Jarvan_IV',
        'Xin Zhao': 'Xin_Zhao',
        // Add more mappings as needed
    };
    return {
        displayName: nameMappings[champion] || champion,
        imageName: imageMappings[nameMappings[champion] || champion] || champion,
    };
}

function getChampionWinrate(playerName, championId) {
    let playerWinrate = playersWinrate.find(player => player.name.toLowerCase().trim() === playerName.toLowerCase().trim());
    if (playerWinrate) {
        const championData = playerWinrate.champions.find(champ => champ.champion.toLowerCase().trim() === championId.toLowerCase().trim());
        if (championData) {
            let win = championData.winRate;
            let nb = championData.nbGames;
            games = {
                winRate : win,
                nbGames : nb
            }
            return games;
        }
    }
    return '-1';
}

function copyChampionsToSelect(gameId, gameIndex) {
    const gameDetails = gamesCache[gameId].details.data.event.match.games[gameIndex];
    const blueTeamChamps = gameDetails.gameMetadata.blueTeamMetadata.participantMetadata.map(player => player.championId);
    const redTeamChamps = gameDetails.gameMetadata.redTeamMetadata.participantMetadata.map(player => player.championId);

    selectedChampionsWinrate.teamA = [];
    selectedChampionsWinrate.teamB = [];

    console.log(`Copying champions for Game ${gameIndex + 1}`);
    console.log('Blue Team Champions:', blueTeamChamps);
    console.log('Red Team Champions:', redTeamChamps);

    blueTeamChamps.forEach((champion, index) => {
        const select = document.getElementById(`team-a-champ-${index + 1}`);
        select.value = getFormattedChampionName(champion).displayName;
        const winrate = getChampionWinrate(gameDetails.gameMetadata.blueTeamMetadata.participantMetadata[index].summonerName, champion);
        selectedChampionsWinrate.teamA.push(winrate);
    });

    redTeamChamps.forEach((champion, index) => {
        const select = document.getElementById(`team-b-champ-${index + 1}`);
        select.value = getFormattedChampionName(champion).displayName;
        const winrate = getChampionWinrate(gameDetails.gameMetadata.redTeamMetadata.participantMetadata[index].summonerName, champion);
        selectedChampionsWinrate.teamB.push(winrate);
    });

    console.log('Selected Champions Winrate:', selectedChampionsWinrate);
}

function copyChampionsToSelectInverse(gameId, gameIndex) {
    const gameDetails = gamesCache[gameId].details.data.event.match.games[gameIndex];
    const blueTeamChamps = gameDetails.gameMetadata.blueTeamMetadata.participantMetadata.map(player => player.championId);
    const redTeamChamps = gameDetails.gameMetadata.redTeamMetadata.participantMetadata.map(player => player.championId);

    selectedChampionsWinrate.teamA = [];
    selectedChampionsWinrate.teamB = [];

    console.log(`Copying champions inversely for Game ${gameIndex + 1}`);
    console.log('Blue Team Champions:', blueTeamChamps);
    console.log('Red Team Champions:', redTeamChamps);

    blueTeamChamps.forEach((champion, index) => {
        const select = document.getElementById(`team-b-champ-${index + 1}`);
        select.value = getFormattedChampionName(champion).displayName;
        const winrate = getChampionWinrate(gameDetails.gameMetadata.blueTeamMetadata.participantMetadata[index].summonerName, champion);
        selectedChampionsWinrate.teamB.push(winrate);
    });

    redTeamChamps.forEach((champion, index) => {
        const select = document.getElementById(`team-a-champ-${index + 1}`);
        select.value = getFormattedChampionName(champion).displayName;
        const winrate = getChampionWinrate(gameDetails.gameMetadata.redTeamMetadata.participantMetadata[index].summonerName, champion);
        selectedChampionsWinrate.teamA.push(winrate);
    });

    console.log('Selected Champions Winrate:', selectedChampionsWinrate);
}

function copyTeamNames(gameId) {
    const game = gamesCache[gameId];
    const teamAName = game.teams[0].name;
    const teamBName = game.teams[1].name;

    console.log(`Copying team names for Game ${gameId}`);
    console.log('Team A Name:', teamAName);
    console.log('Team B Name:', teamBName);

    document.getElementById('team-a-name').value = teamAName;
    document.getElementById('team-b-name').value = teamBName;
}

function checkWinrates() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const teamAName = document.getElementById('team-a-name').value;
    const teamBName = document.getElementById('team-b-name').value;

    const selectedChampsTeamA = [
        document.getElementById('team-a-champ-1').value,
        document.getElementById('team-a-champ-2').value,
        document.getElementById('team-a-champ-3').value,
        document.getElementById('team-a-champ-4').value,
        document.getElementById('team-a-champ-5').value
    ].filter(champ => champ !== '');

    const selectedChampsTeamB = [
        document.getElementById('team-b-champ-1').value,
        document.getElementById('team-b-champ-2').value,
        document.getElementById('team-b-champ-3').value,
        document.getElementById('team-b-champ-4').value,
        document.getElementById('team-b-champ-5').value
    ].filter(champ => champ !== '');

    const teamAData = getTeamData(selectedChampsTeamA, 'teamA', teamAName);
    const teamBData = getTeamData(selectedChampsTeamB, 'teamB', teamBName);

    displayResultsTable(resultsDiv, teamAData, teamBData);

    const teamACombinedWinrate = calculateCombinedWinrate(teamAData, 'team-a');
    const teamBCombinedWinrate = calculateCombinedWinrate(teamBData, 'team-b');

    displayTeamWinrates(teamAData, teamACombinedWinrate, 'team-a');
    displayTeamWinrates(teamBData, teamBCombinedWinrate, 'team-b');

    const teamAComposition = getGameStageComposition(selectedChampsTeamA);
    const teamBComposition = getGameStageComposition(selectedChampsTeamB);

    displayTeamComposition(resultsDiv, teamAName, teamAComposition, 'team-a');
    displayTeamComposition(resultsDiv, teamBName, teamBComposition, 'team-b');

    displayBetterTeam(resultsDiv, teamAName, teamACombinedWinrate, teamBName, teamBCombinedWinrate);
}

function displayTeamComposition(resultsDiv, teamName, composition, teamPrefix) {
    const section = document.querySelector(`.${teamPrefix}-section`);

    const compositionResult = document.createElement('div');
    compositionResult.innerHTML = `
        <div style="margin-top: 20px"><strong>${teamName} Predominant Stage: ${composition.predominantStage}</strong></div>
        <div><strong>${teamName} Composition Percentage: ${composition.compositionPercentage}</strong></div>
    `;

    section.appendChild(compositionResult);
}

function getTeamData(selectedChamps, teamType, teamName) {
    let totalWinrate = 0;
    let countValidWinrates = 0;
    const teamData = [];

    selectedChamps.forEach((champ, index) => {
        const champData = champions.find(c => c.name === getFormattedChampionName(champ).displayName);
        if (champData) {
            const winrate = champData.winrate >= 0 ? champData.winrate : 0;
            if (champData.winrate >= 0) {
                totalWinrate += champData.winrate;
                countValidWinrates++;
            }
            const playerWinrate = selectedChampionsWinrate[teamType][index] || 0;
            teamData.push({
                name: champData.name,
                imgName: getFormattedChampionName(champ).imageName,
                winrate: champData.winrate,
                wins: champData.wins,
                losses: champData.losses,
                playerWinrate: playerWinrate
            });
        } else {
            console.error(`Champion data not found for ${champ}`);
        }
    });

    const averageWinrate = countValidWinrates > 0 && !isNaN(totalWinrate) ? totalWinrate / countValidWinrates : 0;
    return { teamName, averageWinrate, teamData };
}

function displayResultsTable(resultsDiv, teamAData, teamBData) {
    const teamASection = createTeamSection(teamAData, 'team-a');
    const teamBSection = createTeamSection(teamBData, 'team-b');

    resultsDiv.appendChild(teamASection);
    resultsDiv.appendChild(teamBSection);
}

function createTeamSection(teamData, teamPrefix) {
    const section = document.createElement('div');
    section.className = `${teamPrefix}-section team-section team-details`;
    section.innerHTML = `<h3>${teamData.teamName} Champions Winrates</h3>`;

    const table = createResultsTable(teamData);
    section.appendChild(table);

    return section;
}

function createResultsTable(teamData) {
    const table = document.createElement('table');
    table.className = 'results-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Champion</th>
            <th>Winrate League</th>
            <th>Wins League</th>
            <th>Losses League</th>
            <th>Player Winrate</th>
            <th>Games Played</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    teamData.teamData.forEach(champ => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="/images/${champ.imgName}.png" alt="${champ.name}" class="champion-icon">
                ${champ.name}
            </td>
            <td>${champ.winrate}%</td>
            <td>${champ.wins != undefined || null ? champ.wins : -1 }</td>
            <td>${champ.losses != undefined || null ? champ.losses : -1 }</td>
            <td>${champ.playerWinrate.winRate !== undefined ? champ.playerWinrate.winRate : 0}%</td>
            <td>${champ.playerWinrate.nbGames !== undefined ? champ.playerWinrate.nbGames : 0}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function calculateCombinedWinrate(teamData, teamPrefix) {
    const weightChampionWinrate = 0.4;
    const weightTeamWinrate = 0.1;
    const weightChampionPlayerWinrate = 0.3;
    const weightRecentWinrate = 0.2;

    const detractorPercentage = 0.1;

    const teamWinrate = parseFloat(document.getElementById(`${teamPrefix}-winrate`).value) || 0;
    const teamRecentWinrate = parseFloat(document.getElementById(`${teamPrefix}-recent-winrate`).value) || 0;

    const averageWinrate = teamData.teamData.reduce((sum, champ) => {
        const winRate = parseFloat(champ.playerWinrate.winRate);
        return sum + (isNaN(winRate) ? 0 : winRate);
    }, 0) / teamData.teamData.length;

    console.log("averageWinrate",averageWinrate)
    
    const teamCombinedWinrate = (weightChampionWinrate * teamData.averageWinrate) + 
                                (weightTeamWinrate * teamWinrate) + 
                                (weightRecentWinrate * teamRecentWinrate) + 
                                (weightChampionPlayerWinrate * averageWinrate);


    const teamConsecutiveLosses = document.getElementById(`${teamPrefix}-derretidos`).checked ? detractorPercentage : 0;

    return teamCombinedWinrate * (1 - teamConsecutiveLosses);
}

function displayTeamWinrates(teamData, teamCombinedWinrate, teamPrefix) {
    const section = document.querySelector(`.${teamPrefix}-section`);

    const combinedAndAverageResult = document.createElement('div');
    combinedAndAverageResult.innerHTML = `
        <div style="margin-top: 20px"><strong>${teamData.teamName} Combined Winrate: ${teamCombinedWinrate.toFixed(2)}%</strong></div>
        <div><strong>${teamData.teamName} Average Champion Winrate: ${teamData.averageWinrate.toFixed(2)}%</strong></div>
       <div><strong>${teamData.teamName} Average Champion/Player Winrate: ${(teamData.teamData.reduce((sum, champ) => {
           const winRate = parseFloat(champ.playerWinrate.winRate);
           return sum + (isNaN(winRate) ? 0 : winRate);
       }, 0) / teamData.teamData.reduce((count, champ) => {
           const winRate = parseFloat(champ.playerWinrate.winRate);
           return count + (isNaN(winRate) ? 0 : 1);
       }, 0) || 1).toFixed(2)}%</strong></div>
    `;

    section.appendChild(combinedAndAverageResult);
}

function displayBetterTeam(resultsDiv, teamAName, teamACombinedWinrate, teamBName, teamBCombinedWinrate) {
    let betterTeamResult = document.createElement('div');
    betterTeamResult.className = 'team-details';
    betterTeamResult.innerHTML = '<h3>Better Team</h3>';

    if (teamACombinedWinrate > teamBCombinedWinrate) {
        betterTeamResult.innerHTML += `<strong>${teamAName} with a combined winrate of <span class="highlight">${teamACombinedWinrate.toFixed(2)}%</span></strong>`;
    } else if (teamBCombinedWinrate > teamACombinedWinrate) {
        betterTeamResult.innerHTML += `<strong>${teamBName} with a combined winrate of <span class="highlight">${teamBCombinedWinrate.toFixed(2)}%</span></strong>`;
    } else {
        betterTeamResult.innerHTML += `<strong>Both teams are equally good with a combined winrate of <span class="highlight">${teamACombinedWinrate.toFixed(2)}%</span></strong>`;
    }

    resultsDiv.appendChild(betterTeamResult);
}


async function scrapeData() {
    const league = document.getElementById('league-select').value;
    showSpinner();
    try {
        const response = await fetch(`/scrape?league=${encodeURIComponent(league)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const champions = await response.json();
        console.log(`Scraped ${champions.length} champions for league ${league}`);
        alert('Data scraped and loaded!');
        loadChampions(league); // Load champions from the newly scraped data
    } catch (error) {
        console.error('Failed to scrape data:', error);
    } finally {
        hideSpinner();
    }
}

async function loadGamesOfDay() {
    showSpinner();
    try {
        const response = await fetch('/games');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const games = await response.json();
        console.log('Games of the day:', games);
        games.forEach(game => {
            gamesCache[game.id] = game;
            playerCache[game.id] = game.details.data.event.match.games.reduce((cache, gameDetail) => {
                if (gameDetail.gameMetadata && gameDetail.gameMetadata.blueTeamMetadata && gameDetail.gameMetadata.redTeamMetadata) {
                    let blueTeam = game.teams[0];
                    let redTeam = game.teams[1];

                    // Validate and correct team codes if necessary
                    const firstBluePlayer = gameDetail.gameMetadata.blueTeamMetadata.participantMetadata[0].summonerName;
                    const firstRedPlayer = gameDetail.gameMetadata.redTeamMetadata.participantMetadata[0].summonerName;
                    if (!firstBluePlayer.startsWith(blueTeam.code) && firstRedPlayer.startsWith(blueTeam.code)) {
                        [blueTeam, redTeam] = [redTeam, blueTeam];
                        [game.teams[0], game.teams[1]] = [game.teams[1], game.teams[0]];
                    }

                    const players = {
                        blueTeam: gameDetail.gameMetadata.blueTeamMetadata.participantMetadata.map(player => {
                            const originalName = player.summonerName;
                            const nameWithoutPrefix = originalName.replace(new RegExp(`^${blueTeam.code}\\s*`), '').trim();
                            return {
                                name: nameWithoutPrefix,
                                team: blueTeam.name,
                                champion: player.championId,
                            };
                        }),
                        redTeam: gameDetail.gameMetadata.redTeamMetadata.participantMetadata.map(player => {
                            const originalName = player.summonerName;
                            const nameWithoutPrefix = originalName.replace(new RegExp(`^${redTeam.code}\\s*`), '').trim();
                            return {
                                name: nameWithoutPrefix,
                                team: redTeam.name,
                                champion: player.championId,
                            };
                        })
                    };
                    // Update game details with modified player names
                    gameDetail.gameMetadata.blueTeamMetadata.participantMetadata.forEach(player => {
                        player.summonerName = player.summonerName.replace(new RegExp(`^${blueTeam.code}\\s*`), '').trim();
                    });
                    gameDetail.gameMetadata.redTeamMetadata.participantMetadata.forEach(player => {
                        player.summonerName = player.summonerName.replace(new RegExp(`^${redTeam.code}\\s*`), '').trim();
                    });
                    cache.push(players);
                }
                return cache;
            }, []);
        });
        console.log(games);
        displayGames(games);
    } catch (error) {
        console.error('Failed to load games:', error);
    } finally {
        hideSpinner();
    }
}

function displayGames(games) {
    const gamesDiv = document.getElementById('games');
    gamesDiv.innerHTML = '<h2>Games of the Day</h2>';

    const inProgressGames = games.filter(game => game.state === 'inProgress');
    const unstartedGames = games.filter(game => game.state === 'unstarted');
    const completedGames = games.filter(game => game.state === 'completed');

    const createGameElement = (game) => {
        const gameDiv = document.createElement('div');
        gameDiv.className = `game ${game.state.replace(' ', '-')}`;

        gameDiv.innerHTML = `
            <h3>${game.league}</h3>
            <p class="game-details">Time: ${new Date(game.startTime).toLocaleString()} | State: ${game.state} | Block: ${game.blockName} | Match Format: Best of ${game.strategyCount}</p>
            <div class="teams-container">
                ${game.teams.map(team => {
                    return `
                        <div>
                            <img class="game-logo" src="${team.image}" alt="${team.name}" onerror="this.onerror=null;this.src='default_image_url.png';">
                            ${team.name} (${team.code}) - Wins: ${team.record.wins}, Losses: ${team.record.losses}
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="btn-group" role="group">
                <button class="btn btn-info" onclick="toggleDetails('${game.id}')">Show Details</button>
                <button class="btn btn-secondary ml-2" onclick="copyTeamNames('${game.id}')">Copy Team Names</button>
            </div>
            <div id="details-${game.id}" class="event-details">
                <div>
                    ${game.details?.data?.event?.match?.games?.map((gameDetail, index) => {
                        if (index < 5 && gameDetail.number && gameDetail.state) {
                            return `
                                <div class="game-details-container">
                                    <p>Game ${gameDetail.number}: ${gameDetail.state}</p>
                                    <div class="game-metadata">
                                        <div class="team-container">
                                            <span class="team-info">Blue Team:</span>
                                            ${gameDetail.gameMetadata?.blueTeamMetadata?.participantMetadata.map(player => {
                                                const formattedName = getFormattedChampionName(player.championId);
                                                const playerName = player.summonerName;
                                                const champion = getChampionWinrate(playerName, player.championId);
                                                return `
                                                    <div class="champion-container">
                                                        <img src="/images/${formattedName.imageName}.png" alt="${player.championId}" class="game-results">
                                                        <div class="champion-info">
                                                            <span>${playerName}</span>
                                                            <span>Winrate: ${champion.winRate !== undefined ? champion.winRate : 0 }%</span>
                                                            <span>Games: ${champion.nbGames !== undefined ? champion.nbGames : 0 } </span>
                                                        </div>
                                                    </div>`;
                                            }).join('') || 'N/A'}
                                        </div>
                                        <div class="team-container">
                                            <span class="team-info">Red Team:</span>
                                            ${gameDetail.gameMetadata?.redTeamMetadata?.participantMetadata.map(player => {
                                                const formattedName = getFormattedChampionName(player.championId);
                                                const playerName = player.summonerName;
                                                const champion = getChampionWinrate(playerName, player.championId);
                                                return `
                                                    <div class="champion-container">
                                                        <img src="/images/${formattedName.imageName}.png" alt="${player.championId}" class="game-results">
                                                        <div class="champion-info">
                                                            <span>${playerName}</span>
                                                            <span>Winrate: ${champion.winRate !== undefined ? champion.winRate : 0 }%</span>
                                                            <span>Games: ${champion.nbGames !== undefined ? champion.nbGames : 0 } </span>
                                                        </div>
                                                    </div>`;
                                            }).join('') || 'N/A'}
                                        </div>
                                    </div>
                                    <div class="btn-group" role="group">
                                        <button class="btn btn-warning" onclick="copyChampionsToSelect('${game.id}', ${index})">Copy Champions for Game ${gameDetail.number}</button>
                                        <button class="btn btn-danger ml-2" onclick="copyChampionsToSelectInverse('${game.id}', ${index})">Copy Champions Inversely</button>
                                    </div>
                                </div>
                            `;
                        }
                        return '';
                    }).join('') || 'No game details available'}
                </div>
            </div>
        `;
        return gameDiv;
    };

    const sections = [
        { title: 'In Progress', games: inProgressGames, className: 'inProgress' },
        { title: 'Unstarted', games: unstartedGames, className: 'unstarted' },
        { title: 'Completed', games: completedGames, className: 'completed' },
    ];

    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = `section ${section.className}`;
        sectionDiv.innerHTML = `<h3>${section.title}</h3>`;
        section.games.forEach(game => {
            sectionDiv.appendChild(createGameElement(game));
        });
        gamesDiv.appendChild(sectionDiv);
    });
}



function printCache() {
    console.log('Games Cache:', gamesCache);
    console.log('Player Cache:', playerCache);
    console.log('Player :', players);
    console.log('PlayerWinrate :', playersWinrate);
}

async function loadGameDetails(gameId) {
    try {
        const response = await fetch(`/eventDetails?id=${encodeURIComponent(gameId)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.match.games;
    } catch (error) {
        console.error(`Failed to load game details for game ID: ${gameId}`, error);
        return null;
    }
}

function toggleDetails(gameId) {
    const detailsDiv = document.getElementById(`details-${gameId}`);
    detailsDiv.classList.toggle('active');
}

// Função para carregar os jogadores e armazená-los em cache
async function loadPlayers() {
    try {
        const response = await fetch('/scrapePlayers');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        playersWinrate = await response.json();
        console.log(`Loaded ${playersWinrate.length} players`);
        console.log('All players have been loaded!');
    } catch (error) {
        console.error('Failed to load players:', error);
    }
}

function toggleTeamFields(team) {
    const disableFieldsCheckbox = document.getElementById(`${team}-disable-fields`);
    const isDisabled = disableFieldsCheckbox.checked;

    const teamNameInput = document.getElementById(`${team}-name`);
    const teamWinrateInput = document.getElementById(`${team}-winrate`);
    const teamRecentWinrateInput = document.getElementById(`${team}-recent-winrate`);

    teamNameInput.disabled = isDisabled;
    teamWinrateInput.disabled = isDisabled;
    teamRecentWinrateInput.disabled = isDisabled;
}

function swapTeams() {
    // Trocar valores dos comboboxes de campeões
    for (let i = 1; i <= 5; i++) {
        const teamAChamp = document.getElementById(`team-a-champ-${i}`);
        const teamBChamp = document.getElementById(`team-b-champ-${i}`);

        const tempValue = teamAChamp.value;
        teamAChamp.value = teamBChamp.value;
        teamBChamp.value = tempValue;
    }

    // Trocar valores das outras informações das equipes
    // const teamAName = document.getElementById('team-a-name');
    // const teamAWinrate = document.getElementById('team-a-winrate');
    // const teamARecentWinrate = document.getElementById('team-a-recent-winrate');
    // const teamADerretidos = document.getElementById('team-a-derretidos');

    // const teamBName = document.getElementById('team-b-name');
    // const teamBWinrate = document.getElementById('team-b-winrate');
    // const teamBRecentWinrate = document.getElementById('team-b-recent-winrate');
    // const teamBDerretidos = document.getElementById('team-b-derretidos');

    // [teamAName.value, teamBName.value] = [teamBName.value, teamAName.value];
    // [teamAWinrate.value, teamBWinrate.value] = [teamBWinrate.value, teamAWinrate.value];
    // [teamARecentWinrate.value, teamBRecentWinrate.value] = [teamBRecentWinrate.value, teamARecentWinrate.value];
    // [teamADerretidos.checked, teamBDerretidos.checked] = [teamBDerretidos.checked, teamADerretidos.checked];

    // Trocar valores nas variáveis selectedChampionsWinrate
    [selectedChampionsWinrate.teamA, selectedChampionsWinrate.teamB] = [selectedChampionsWinrate.teamB, selectedChampionsWinrate.teamA];

    console.log(selectedChampionsWinrate);
    console.log('Teams swapped');
}

async function captureAndSendToWebhook() {
    // Selecione a área que deseja capturar
    const elementToCapture = document.getElementById('results');

    // Capture a área usando html2canvas
    const canvas = await html2canvas(elementToCapture);

    // Converta o canvas para um blob
    canvas.toBlob(async function(blob) {
        // Crie um FormData para enviar a imagem
        const formData = new FormData();
        formData.append('file', blob, 'screenshot.png');

        // URL do webhook (substitua com o URL do seu webhook)
        const webhookUrl = 'https://discord.com/api/webhooks/1267741529267769355/Of_Lj_ZEaNxInzIioxyeWmYNdI8i9QGe3t1m3KGoWCMk6_uZ4ESIi1vMOgTyjtV0972H';

        // Envie a imagem para o webhook
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                console.log('Screenshot sent to webhook successfully.');
            } else {
                console.error('Failed to send screenshot to webhook.');
            }
        } catch (error) {
            console.error('Error sending screenshot to webhook:', error);
        }
    });
}


// Adicione a chamada dessa função em window.onload para garantir que os campos estejam no estado correto quando a página carregar
window.onload = async () => {
    const leagueSelect = document.getElementById('league-select');
    leagueSelect.onchange = async () => {
        const league = leagueSelect.value;
        await loadChampions(league);
    };
    await loadChampions(leagueSelect.value);
    await loadPlayers();

    // Inicializar os campos desativados se os checkboxes estiverem marcados
    toggleTeamFields('team-a');
    toggleTeamFields('team-b');
};
