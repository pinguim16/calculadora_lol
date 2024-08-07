

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
    copyTeamNames(gameId);
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
    copyTeamNames(gameId);
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

    let teamDataA = findTeamInArray(teamAName, teamCache);
    let teamDataB = findTeamInArray(teamBName, teamCache);

    console.log(teamDataA);
    console.log(teamDataB);

    document.getElementById('team-a-winrate').value = teamDataA.winRate.replace("%","");;
    document.getElementById('team-a-recent-winrate').value = teamDataA.averageMatchWinRate.replace("%","");

    document.getElementById('team-b-winrate').value = teamDataB.winRate.replace("%","");;
    document.getElementById('team-b-recent-winrate').value = teamDataB.averageMatchWinRate.replace("%","");;
}

// Função para obter o nome oficial do time
function getOfficialTeamName(teamName) {
    return teamNameMapping[teamName] || teamName;
}

function findTeamInArray(teamName, teamArray) {
    const officialTeamName = getOfficialTeamName(teamName);
    return teamArray.find(team => team.name === teamName || team.name === officialTeamName);
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

    const teamAData = getTeamData(selectedChampsTeamA, 'teamA', teamAName, championsTeamA);
    const teamBData = getTeamData(selectedChampsTeamB, 'teamB', teamBName, championsTeamB);

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
    captureAndSendToWebhook();
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

function getTeamData(selectedChamps, teamType, teamName, champions) {
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
       <div><strong>${teamData.teamName} Average Champion/Player Winrate: ${ (teamData.teamData.reduce((sum, champ) => {
        const winRate = parseFloat(champ.playerWinrate.winRate);
        return sum + (isNaN(winRate) ? 0 : winRate);
    }, 0) / teamData.teamData.length).toFixed(2)}%</strong></div>`;

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

    const inProgressGames = games.filter(game => game.state === 'inProgress').sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const unstartedGames = games.filter(game => game.state === 'unstarted').sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const completedGames = games.filter(game => game.state === 'completed').sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

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
                <button class="btn btn-primary" onclick="reloadGameData('${game.id}')">Reload Game Data</button>
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
    console.log('Team A :', championsTeamA);
    console.log('Team B :', championsTeamB);
    console.log('Team Cache :', teamCache);
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





