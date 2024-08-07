async function scrapeTeams() {
    showSpinner();
    try {
        const response = await fetch('/scrapeTeams');
        if (response.ok) {
            teamCache = await response.json();
            showToast('Teams scraped and loaded!', 'success');
            //displayTeams(teams);
        } else {
            console.error('Failed to scrape teams');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideSpinner();
    }
}

function displayTeams(teams) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'results-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Team Name</th>
            <th>Season</th>
            <th>Region</th>
            <th>Games</th>
            <th>Win Rate</th>
            <th>K/D</th>
            <th>GPM</th>
            <th>GDM</th>
            <th>Game Duration</th>
            <th>Kills / Game</th>
            <th>Deaths / Game</th>
            <th>Towers Killed</th>
            <th>Towers Lost</th>
            <th>First Blood Rate</th>
            <th>First Tower Rate</th>
            <th>Dragons Killed / Game</th>
            <th>Dragon Rate</th>
            <th>Voidgrubs Killed / Game</th>
            <th>Herald Killed / Game</th>
            <th>Herald Rate</th>
            <th>Dragons at 15</th>
            <th>Tower Differential at 15</th>
            <th>Gold Differential at 15</th>
            <th>Tower Plates Destroyed / Game</th>
            <th>Baron Nashor Killed / Game</th>
            <th>Baron Nashor Rate</th>
            <th>Creeps / Minute</th>
            <th>Damage to Champions / Minute</th>
            <th>Wards / Minute</th>
            <th>Vision Wards / Minute</th>
            <th>Wards Cleared / Minute</th>
            <th>Average Match Win Rate</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    teams.forEach(team => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team.name}</td>
            <td>${team.season}</td>
            <td>${team.region}</td>
            <td>${team.games}</td>
            <td>${team.winRate}</td>
            <td>${team.kd}</td>
            <td>${team.gpm}</td>
            <td>${team.gdm}</td>
            <td>${team.gameDuration}</td>
            <td>${team.killsPerGame}</td>
            <td>${team.deathsPerGame}</td>
            <td>${team.towersKilled}</td>
            <td>${team.towersLost}</td>
            <td>${team.firstBloodRate}</td>
            <td>${team.firstTowerRate}</td>
            <td>${team.dragonsKilledPerGame}</td>
            <td>${team.dragonRate}</td>
            <td>${team.voidgrubsKilledPerGame}</td>
            <td>${team.heraldKilledPerGame}</td>
            <td>${team.heraldRate}</td>
            <td>${team.dragonsAt15}</td>
            <td>${team.towerDifferentialAt15}</td>
            <td>${team.goldDifferentialAt15}</td>
            <td>${team.towerPlatesDestroyedPerGame}</td>
            <td>${team.baronNashorKilledPerGame}</td>
            <td>${team.baronNashorRate}</td>
            <td>${team.creepsPerMinute}</td>
            <td>${team.damageToChampionsPerMinute}</td>
            <td>${team.wardsPerMinute}</td>
            <td>${team.visionWardsPerMinute}</td>
            <td>${team.wardsClearedPerMinute}</td>
            <td>${team.averageMatchWinRate}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    resultsDiv.appendChild(table);
}