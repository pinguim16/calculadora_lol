let champions = [];
let gamesCache = {};
let playerCache = {};
let players = [];

async function loadChampions(league) {
    try {
        const response = await fetch(`/champions?league=${encodeURIComponent(league)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        champions = await response.json();
        console.log(`Loaded ${champions.length} champions for league ${league}`);
        updateChampionSelects();
    } catch (error) {
        console.error('Failed to load champions:', error);
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

function checkWinrates() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const weightChampionWinrate = 0.4;
    const weightTeamWinrate = 0.3;
    const weightRecentWinrate = 0.3;
    const detractorPercentage = 0.1;

    const selectedChampsTeamA = [
        document.getElementById('team-a-champ-1').value,
        document.getElementById('team-a-champ-2').value,
        document.getElementById('team-a-champ-3').value,
        document.getElementById('team-a-champ-4').value,
        document.getElementById('team-a-champ-5').value
    ].filter(champ => champ !== '');

    let totalWinrateTeamA = 0;
    let countValidWinratesTeamA = 0;
    let teamADetails = document.createElement('div');
    teamADetails.innerHTML = '<h3>Team A Champions Winrates</h3>';

    selectedChampsTeamA.forEach(champ => {
        const champData = champions.find(c => c.name === (
            champ === 'Leblanc' ? 'LeBlanc' :
            champ === 'Renata' ? 'Renata Glasc' :
            champ === 'MissFortune' ? 'Miss Fortune' :
            champ === 'TwistedFate' ? 'Twisted Fate' :
            champ === 'DrMundo' ? 'Dr. Mundo' :
            champ === 'LeeSin' ? 'Lee Sin' :
            champ === 'MonkeyKing' ? 'Wukong' :
            champ
        ));
        if (champData) {
            const winrate = champData.winrate >= 0 ? champData.winrate : 'N/A';
            if (champData.winrate >= 0) {
                totalWinrateTeamA += champData.winrate;
                countValidWinratesTeamA++;
            }
            const result = document.createElement('div');
            result.className = 'champion-result';
            const imgName = champData.name === 'Leblanc' ? 'LeBlanc' :
                champData.name === 'Renata Glasc' ? 'Renata_Glasc' :
                champData.name === 'Miss Fortune' ? 'Miss_Fortune' :
                champData.name === 'Twisted Fate' ? 'Twisted_Fate' :
                champData.name === 'Dr. Mundo' ? 'Dr._Mundo' :
                champData.name === 'Lee Sin' ? 'Lee_Sin' :
                champData.name === 'Wukong' ? 'Wukong' :
                champData.name;
            result.innerHTML = `
                <img src="/images/${imgName}.png" alt="${champData.name}" class="game-results">
                ${champData.name} - Winrate: ${winrate}%`;
            teamADetails.appendChild(result);
        } else {
            console.error(`Champion data not found for ${champ}`);
        }
    });

    let averageWinrateTeamA = 0;
    if (countValidWinratesTeamA > 0) {
        averageWinrateTeamA = totalWinrateTeamA / countValidWinratesTeamA;
    }

    let teamACombinedAndAverageResult = document.createElement('div');
    teamACombinedAndAverageResult.innerHTML = `<div><strong>Team A Combined Winrate: ${averageWinrateTeamA.toFixed(2)}%</strong></div>`;
    teamACombinedAndAverageResult.innerHTML += `<div><strong>Team A Average Champion Winrate: ${averageWinrateTeamA.toFixed(2)}%</strong></div>`;

    const selectedChampsTeamB = [
        document.getElementById('team-b-champ-1').value,
        document.getElementById('team-b-champ-2').value,
        document.getElementById('team-b-champ-3').value,
        document.getElementById('team-b-champ-4').value,
        document.getElementById('team-b-champ-5').value
    ].filter(champ => champ !== '');

    let totalWinrateTeamB = 0;
    let countValidWinratesTeamB = 0;
    let teamBDetails = document.createElement('div');
    teamBDetails.innerHTML = '<h3>Team B Champions Winrates</h3>';

    selectedChampsTeamB.forEach(champ => {
        const champData = champions.find(c => c.name === (
            champ === 'Leblanc' ? 'LeBlanc' :
            champ === 'Renata' ? 'Renata Glasc' :
            champ === 'MissFortune' ? 'Miss Fortune' :
            champ === 'TwistedFate' ? 'Twisted Fate' :
            champ === 'DrMundo' ? 'Dr. Mundo' :
            champ === 'LeeSin' ? 'Lee Sin' :
            champ === 'MonkeyKing' ? 'Wukong' :
            champ
        ));
        if (champData) {
            const winrate = champData.winrate >= 0 ? champData.winrate : 'N/A';
            if (champData.winrate >= 0) {
                totalWinrateTeamB += champData.winrate;
                countValidWinratesTeamB++;
            }
            const result = document.createElement('div');
            result.className = 'champion-result';
            const imgName = champData.name === 'Leblanc' ? 'LeBlanc' :
                champData.name === 'Renata Glasc' ? 'Renata_Glasc' :
                champData.name === 'Miss Fortune' ? 'Miss_Fortune' :
                champData.name === 'Twisted Fate' ? 'Twisted_Fate' :
                champData.name === 'Dr. Mundo' ? 'Dr._Mundo' :
                champData.name === 'Lee Sin' ? 'Lee_Sin' :
                champData.name === 'Wukong' ? 'Wukong' :
                champData.name;
            result.innerHTML = `
                <img src="/images/${imgName}.png" alt="${champData.name}" class="game-results">
                ${champData.name} - Winrate: ${winrate}%`;
            teamBDetails.appendChild(result);
        } else {
            console.error(`Champion data not found for ${champ}`);
        }
    });

    let averageWinrateTeamB = 0;
    if (countValidWinratesTeamB > 0) {
        averageWinrateTeamB = totalWinrateTeamB / countValidWinratesTeamB;
    }

    let teamBCombinedAndAverageResult = document.createElement('div');
    teamBCombinedAndAverageResult.innerHTML = `<div><strong>Team B Combined Winrate: ${averageWinrateTeamB.toFixed(2)}%</strong></div>`;
    teamBCombinedAndAverageResult.innerHTML += `<div><strong>Team B Average Champion Winrate: ${averageWinrateTeamB.toFixed(2)}%</strong></div>`;

    const teamAWinrate = parseFloat(document.getElementById('team-a-winrate').value) || 0;
    const teamARecentWinrate = parseFloat(document.getElementById('team-a-recent-winrate').value) || 0;
    const teamBWinrate = parseFloat(document.getElementById('team-b-winrate').value) || 0;
    const teamBRecentWinrate = parseFloat(document.getElementById('team-b-recent-winrate').value) || 0;

    const teamAName = document.getElementById('team-a-name').value;
    const teamBName = document.getElementById('team-b-name').value;

    const teamACombinedWinrate = (weightChampionWinrate * averageWinrateTeamA) + (weightTeamWinrate * teamAWinrate) + (weightRecentWinrate * teamARecentWinrate);
    const teamBCombinedWinrate = (weightChampionWinrate * averageWinrateTeamB) + (weightTeamWinrate * teamBWinrate) + (weightRecentWinrate * teamBRecentWinrate);

    const teamAConsecutiveLosses = document.getElementById('team-a-derretidos').checked ? detractorPercentage : 0;
    const teamBConsecutiveLosses = document.getElementById('team-b-derretidos').checked ? detractorPercentage : 0;

    const finalTeamACombinedWinrate = teamACombinedWinrate * (1 - teamAConsecutiveLosses);
    const finalTeamBCombinedWinrate = teamBCombinedWinrate * (1 - teamBConsecutiveLosses);

    teamACombinedAndAverageResult.innerHTML = `<div><strong>Team A Combined Winrate: ${finalTeamACombinedWinrate.toFixed(2)}%</strong></div>`;
    teamACombinedAndAverageResult.innerHTML += `<div><strong>Team A Average Champion Winrate: ${averageWinrateTeamA.toFixed(2)}%</strong></div>`;
    
    teamBCombinedAndAverageResult.innerHTML = `<div><strong>Team B Combined Winrate: ${finalTeamBCombinedWinrate.toFixed(2)}%</strong></div>`;
    teamBCombinedAndAverageResult.innerHTML += `<div><strong>Team B Average Champion Winrate: ${averageWinrateTeamB.toFixed(2)}%</strong></div>`;

    let betterTeamResult = document.createElement('div');
    betterTeamResult.innerHTML = '<h3>Better Team</h3>';

    if (finalTeamACombinedWinrate > finalTeamBCombinedWinrate) {
        betterTeamResult.innerHTML += `<strong>${teamAName} with a combined winrate of <span class="highlight">${finalTeamACombinedWinrate.toFixed(2)}%</span></strong>`;
    } else if (finalTeamBCombinedWinrate > finalTeamACombinedWinrate) {
        betterTeamResult.innerHTML += `<strong>${teamBName} with a combined winrate of <span class="highlight">${finalTeamBCombinedWinrate.toFixed(2)}%</span></strong>`;
    } else {
        betterTeamResult.innerHTML += `<strong>Both teams are equally good with a combined winrate of <span class="highlight">${finalTeamACombinedWinrate.toFixed(2)}%</span></strong>`;
    }

    let sectionTeamA = document.createElement('section');
    sectionTeamA.appendChild(teamADetails);
    sectionTeamA.appendChild(teamACombinedAndAverageResult);

    let sectionTeamB = document.createElement('section');
    sectionTeamB.appendChild(teamBDetails);
    sectionTeamB.appendChild(teamBCombinedAndAverageResult);

    let sectionBetterTeam = document.createElement('section');
    sectionBetterTeam.appendChild(betterTeamResult);

    resultsDiv.appendChild(sectionTeamA);
    resultsDiv.appendChild(sectionTeamB);
    resultsDiv.appendChild(sectionBetterTeam);
}

async function scrapeData() {
    const league = document.getElementById('league-select').value;
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
    }
}

async function loadGamesOfDay() {
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
                                champion: player.championId
                            };
                        }),
                        redTeam: gameDetail.gameMetadata.redTeamMetadata.participantMetadata.map(player => {
                            const originalName = player.summonerName;
                            const nameWithoutPrefix = originalName.replace(new RegExp(`^${redTeam.code}\\s*`), '').trim();
                            return {
                                name: nameWithoutPrefix,
                                team: redTeam.name,
                                champion: player.championId
                            };
                        })
                    };
                    cache.push(players);
                }
                return cache;
            }, []);
        });
        displayGames(games);
    } catch (error) {
        console.error('Failed to load games:', error);
    }
}

function displayGames(games) {
    const gamesDiv = document.getElementById('games');
    gamesDiv.innerHTML = '<h2>Games of the Day</h2>';
    games.forEach(async game => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game';
        const gameDetails = await loadGameDetails(game.id);
        gameDiv.innerHTML = `
            <h3>${game.league}</h3>
            <p class="game-details">Time: ${new Date(game.startTime).toLocaleString()} | State: ${game.state} | Block: ${game.blockName} | Match Format: Best of ${game.strategyCount}</p>
            <div class="teams-container">
                ${game.teams.map(team => {
                    return `
                        <div>
                            <img class="game-logo" src="${team.image}" alt="${team.name}" style="width: 50px;" onerror="this.onerror=null;this.src='default_image_url.png';">
                            ${team.name} (${team.code}) - Wins: ${team.record.wins}, Losses: ${team.record.losses}
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="show-details-button" onclick="toggleDetails('${game.id}')">Show Details</button>
            <div id="details-${game.id}" class="event-details">
                <h4>Event Details</h4>
                <p>Event ID: ${game.id}</p>
                <p>Event State: ${game.details?.data?.event?.state || 'N/A'}</p>
                <p>Event Start Time: ${new Date(game.details?.data?.event?.startTime || game.startTime).toLocaleString()}</p>
                <div>
                    <h4>Game Results</h4>
                    ${game.details?.data?.event?.match?.games?.map(gameDetail => {
                        return `
                            <div>
                                Game ${gameDetail.number}: ${gameDetail.state}
                                <br>Blue Team: ${gameDetail.gameMetadata?.blueTeamMetadata?.participantMetadata.map(player => {
                                    const champ = champions.find(c => c.name === (
                                        player.championId === 'Leblanc' ? 'LeBlanc' :
                                        player.championId === 'Renata' ? 'Renata Glasc' :
                                        player.championId === 'MissFortune' ? 'Miss Fortune' :
                                        player.championId === 'TwistedFate' ? 'Twisted Fate' :
                                        player.championId === 'DrMundo' ? 'Dr. Mundo' :
                                        player.championId === 'LeeSin' ? 'Lee Sin' :
                                        player.championId === 'MonkeyKing' ? 'Wukong' :
                                        player.championId
                                    ));
                                    const imgName = champ ? (
                                        champ.name === 'Leblanc' ? 'LeBlanc' :
                                        champ.name === 'Renata Glasc' ? 'Renata_Glasc' :
                                        champ.name === 'Miss Fortune' ? 'Miss_Fortune' :
                                        champ.name === 'Twisted Fate' ? 'Twisted_Fate' :
                                        champ.name === 'Dr. Mundo' ? 'Dr._Mundo' :
                                        champ.name === 'Lee Sin' ? 'Lee_Sin' :
                                        champ.name === 'Wukong' ? 'Wukong' :
                                        champ.name
                                    ) : '';
                                    let playerName = player.summonerName;
                                    if (game.teams) {
                                        playerName = playerName.replace(new RegExp(`^${game.teams[0].code}\\s*`), '').trim();
                                    }
                                    return `${playerName} (${player.championId}) <img src="/images/${imgName}.png" alt="${player.championId}" class="game-results" style="width: 20px; height: 20px;">`;
                                }).join(', ') || 'N/A'}
                                <br>Red Team: ${gameDetail.gameMetadata?.redTeamMetadata?.participantMetadata.map(player => {
                                    const champ = champions.find(c => c.name === (
                                        player.championId === 'Leblanc' ? 'LeBlanc' :
                                        player.championId === 'Renata' ? 'Renata Glasc' :
                                        player.championId === 'MissFortune' ? 'Miss Fortune' :
                                        player.championId === 'TwistedFate' ? 'Twisted Fate' :
                                        player.championId === 'DrMundo' ? 'Dr. Mundo' :
                                        player.championId === 'LeeSin' ? 'Lee Sin' :
                                        player.championId === 'MonkeyKing' ? 'Wukong' :
                                        player.championId
                                    ));
                                    const imgName = champ ? (
                                        champ.name === 'Leblanc' ? 'LeBlanc' :
                                        champ.name === 'Renata Glasc' ? 'Renata_Glasc' :
                                        champ.name === 'Miss Fortune' ? 'Miss_Fortune' :
                                        champ.name === 'Twisted Fate' ? 'Twisted_Fate' :
                                        champ.name === 'Dr. Mundo' ? 'Dr._Mundo' :
                                        champ.name === 'Lee Sin' ? 'Lee_Sin' :
                                        champ.name === 'Wukong' ? 'Wukong' :
                                        champ.name
                                    ) : '';
                                    let playerName = player.summonerName;
                                    if (game.teams) {
                                        playerName = playerName.replace(new RegExp(`^${game.teams[1].code}\\s*`), '').trim();
                                    }
                                    return `${playerName} (${player.championId}) <img src="/images/${imgName}.png" alt="${player.championId}" class="game-results" style="width: 20px; height: 20px;">`;
                                }).join(', ') || 'N/A'}
                            </div>
                        `;
                    }).join('') || 'No game details available'}
                </div>
            </div>
        `;
        gamesDiv.appendChild(gameDiv);
    });
}

function saveGame(gameId) {
    const game = gamesCache[gameId];
    if (game) {
        console.log('Saving game:', game);
        const teamNames = game.teams.map(team => team.name);
        const playerNames = game.details.data.event.match.games.map(gameDetail => {
            if (gameDetail.gameMetadata && gameDetail.gameMetadata.blueTeamMetadata && gameDetail.gameMetadata.redTeamMetadata) {
                return gameDetail.gameMetadata.blueTeamMetadata.participantMetadata.map(player => {
                    const originalName = player.summonerName;
                    const nameWithoutPrefix = originalName.replace(new RegExp(`^(${game.teams[0].code}\\s*)`), '').trim();
                    console.log(`Original Name: ${originalName}, Name without Prefix: ${nameWithoutPrefix}`);
                    return nameWithoutPrefix;
                }).concat(
                    gameDetail.gameMetadata.redTeamMetadata.participantMetadata.map(player => {
                        const originalName = player.summonerName;
                        const nameWithoutPrefix = originalName.replace(new RegExp(`^(${game.teams[1].code}\\s*)`), '').trim();
                        console.log(`Original Name: ${originalName}, Name without Prefix: ${nameWithoutPrefix}`);
                        return nameWithoutPrefix;
                    })
                );
            }
            return [];
        }).flat();
        console.log('Team Names:', teamNames);
        console.log('Player Names without team prefix:', playerNames);
    }
}

function printCache() {
    console.log('Games Cache:', gamesCache);
    console.log('Player Cache:', playerCache);
    console.log('Player :',players);
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

async function loadPlayerWinrates(player, champion) {
    try {
        const response = await fetch(`/playerWinrates?player=${encodeURIComponent(player)}&champion=${encodeURIComponent(champion)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const winrateData = await response.json();
        return winrateData;
    } catch (error) {
        console.error('Failed to load player winrates:', error);
        return { playerName: player, championName: champion, championWinrate: 'N/A' };
    }
}

async function loadPlayers() {
    try {
        const response = await fetch('/scrapePlayers');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        players = await response.json();
        console.log(`Loaded ${players.length} players`);
        displayPlayers();
    } catch (error) {
        console.error('Failed to load players:', error);
    }
}

function displayPlayers() {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '<h2>Players List</h2>';
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.innerHTML = `
            <p>${player.name}: <a href="${player.profileLink}" target="_blank">${player.profileLink}</a></p>
        `;
        playersDiv.appendChild(playerDiv);
    });
}

window.onload = async () => {
    const leagueSelect = document.getElementById('league-select');
    leagueSelect.onchange = async () => {
        const league = leagueSelect.value;
        await loadChampions(league);
    };
    await loadChampions(leagueSelect.value);
    await loadPlayers();
};