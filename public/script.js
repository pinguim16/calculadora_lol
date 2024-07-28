let champions = [];
let gamesCache = {};
let playerCache = {};
let players = [];
let playersWinrate = [];

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
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        champions = await response.json();
        console.log(`Loaded ${champions.length} champions for league ${league}`);
        updateChampionSelects();
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
        "AurelionSol" : "Aurelion Sol",
        "XinZhao" : "Xin Zhao"
        // Add more mappings as needed
    };
    const imageMappings = {
        'LeBlanc': 'LeBlanc',
        'Renata Glasc': 'Renata_Glasc',
        'Miss Fortune': 'Miss_Fortune',
        'Twisted Fate': 'Twisted_Fate',
        'Dr. Mundo': 'Dr._Mundo',
        'Lee Sin': 'Lee_Sin',
        'Wukong': 'Wukong',
        "Aurelion Sol" : "Aurelion_Sol",
        "Xin Zhao" : "Xin_Zhao"
        // Add more mappings as needed
    };
    return {
        displayName: nameMappings[champion] || champion,
        imageName: imageMappings[nameMappings[champion] || champion] || champion,
    };
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
        const champData = champions.find(c => c.name === getFormattedChampionName(champ).displayName);
        if (champData) {
            const winrate = champData.winrate >= 0 ? champData.winrate : 'N/A';
            if (champData.winrate >= 0) {
                totalWinrateTeamA += champData.winrate;
                countValidWinratesTeamA++;
            }
            const result = document.createElement('div');
            result.className = 'champion-container';
            const imgName = getFormattedChampionName(champ).imageName;
            result.innerHTML = `
                <img src="/images/${imgName}.png" alt="${champData.name}" class="game-results">
                <div class="champion-info">${champData.name} - Winrate: ${winrate}%</div>`;
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
        const champData = champions.find(c => c.name === getFormattedChampionName(champ).displayName);
        if (champData) {
            const winrate = champData.winrate >= 0 ? champData.winrate : 'N/A';
            if (champData.winrate >= 0) {
                totalWinrateTeamB += champData.winrate;
                countValidWinratesTeamB++;
            }
            const result = document.createElement('div');
            result.className = 'champion-container';
            const imgName = getFormattedChampionName(champ).imageName;
            result.innerHTML = `
                <img src="/images/${imgName}.png" alt="${champData.name}" class="game-results">
                <div class="champion-info">${champData.name} - Winrate: ${winrate}%</div>`;
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

function getChampionWinrate(playerName, championId) {
    let playerWinrate = playersWinrate.find(player => player.name.toLowerCase().trim() === playerName.toLowerCase().trim());
    if (playerWinrate) {
        console.log(playerWinrate.champions.find(champ => champ.champion.toLowerCase().trim() === championId.toLowerCase().trim()));
        const championData = playerWinrate.champions.find(champ => {
            let champArray = champ.champion.replace(/\s+/g, '').toLowerCase();
            let champIdAux = championId.replace(/\s+/g, '').toLowerCase();
            if (champArray === champIdAux) {
                return true;
            }
        });
        if (championData) {
            return championData.winRate;
        }
    }
    return '-1';
}

function copyChampionsToSelect(gameId, gameIndex) {
    const gameDetails = gamesCache[gameId].details.data.event.match.games[gameIndex];
    const blueTeamChamps = gameDetails.gameMetadata.blueTeamMetadata.participantMetadata.map(player => player.championId);
    const redTeamChamps = gameDetails.gameMetadata.redTeamMetadata.participantMetadata.map(player => player.championId);

    console.log(`Copying champions for Game ${gameIndex + 1}`);
    console.log('Blue Team Champions:', blueTeamChamps);
    console.log('Red Team Champions:', redTeamChamps);

    blueTeamChamps.forEach((champion, index) => {
        const select = document.getElementById(`team-a-champ-${index + 1}`);
        select.value = getFormattedChampionName(champion).displayName;
    });

    redTeamChamps.forEach((champion, index) => {
        const select = document.getElementById(`team-b-champ-${index + 1}`);
        select.value = getFormattedChampionName(champion).displayName;
    });
}

function displayGames(games) {
    const gamesDiv = document.getElementById('games');
    gamesDiv.innerHTML = '<h2>Games of the Day</h2>';
    games.forEach(async (game, gameIndex) => {
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
                <div>
                    ${game.details?.data?.event?.match?.games?.map((gameDetail, index) => {
                        if (index < 5 && gameDetail.number && gameDetail.state) { // Limitar a 5 jogos e verificar se number e state não são undefined
                            return `
                                <div class="game-details-container">
                                    <p>Game ${gameDetail.number}: ${gameDetail.state}</p>
                                    <div class="game-metadata">
                                        <div class="team-container">
                                            <span class="team-info">Blue Team:</span>
                                            ${gameDetail.gameMetadata?.blueTeamMetadata?.participantMetadata.map(player => {
                                                const formattedName = getFormattedChampionName(player.championId);
                                                const playerName = player.summonerName;
                                                const winrate = getChampionWinrate(playerName, player.championId);
                                                return `
                                                    <div class="champion-container">
                                                        <img src="/images/${formattedName.imageName}.png" alt="${player.championId}" class="game-results">
                                                        <div class="champion-info">
                                                            <span>${playerName}</span>
                                                            <span>Winrate: ${winrate}%</span>
                                                        </div>
                                                    </div>`;
                                            }).join('') || 'N/A'}
                                        </div>
                                        <div class="team-container">
                                            <span class="team-info">Red Team:</span>
                                            ${gameDetail.gameMetadata?.redTeamMetadata?.participantMetadata.map(player => {
                                                const formattedName = getFormattedChampionName(player.championId);
                                                const playerName = player.summonerName;
                                                const winrate = getChampionWinrate(playerName, player.championId);
                                                return `
                                                    <div class="champion-container">
                                                        <img src="/images/${formattedName.imageName}.png" alt="${player.championId}" class="game-results">
                                                        <div class="champion-info">
                                                            <span>${playerName}</span>
                                                            <span>Winrate: ${winrate}%</span>
                                                        </div>
                                                    </div>`;
                                            }).join('') || 'N/A'}
                                        </div>
                                    </div>
                                    <button class="btn btn-warning d-inline-block" onclick="copyChampionsToSelect('${game.id}', ${index})">Copy Champions for Game ${gameDetail.number}</button>
                                </div>
                            `;
                        }
                        return ''; // Retorna uma string vazia se gameDetail.number ou gameDetail.state forem indefinidos
                    }).join('') || 'No game details available'}
                </div>
            </div>
        `;
        gamesDiv.appendChild(gameDiv);
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
        alert('All players have been loaded!');
    } catch (error) {
        console.error('Failed to load players:', error);
    }
}

// Carregar jogadores ao carregar a página, mas sem exibir
window.onload = async () => {
    const leagueSelect = document.getElementById('league-select');
    leagueSelect.onchange = async () => {
        const league = leagueSelect.value;
        await loadChampions(league);
    };
    await loadChampions(leagueSelect.value);
    await loadPlayers();
};
