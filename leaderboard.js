document.addEventListener('DOMContentLoaded', function () {
  fetch('gamedb.json')
    .then(res => res.json())
    .then(json => {
      const games = json.data;
      const pilotWins = {};
      const commanderWins = {};

      games.forEach(game => {
        game.players.forEach(player => {
          // Count wins for pilots
          if (!(player.name in pilotWins)) pilotWins[player.name] = 0;
          if (player.result === "Win") pilotWins[player.name] += 1;

          // Count wins for commanders
          if (!(player.commander in commanderWins)) commanderWins[player.commander] = 0;
          if (player.result === "Win") commanderWins[player.commander] += 1;
        });
      });

   // Render pilot leaderboard with images, only pilots with wins
      const pilotDiv = document.getElementById('pilot-leaderboard');
      if (pilotDiv) {
        const pilots = Object.entries(pilotWins)
  .sort((a, b) => b[1] - a[1]); // Sort by wins descending

pilotDiv.innerHTML = pilots
  .map(([name, wins], idx) => {
    if (idx === 0) {
      // Show image for the leader only
      const imgSrc = `${name}.jpg`;
      return `<div class="score">
                <img src="${imgSrc}" alt="${name}" class="pilot-img">
                <br>
                ${name}:  ${wins}
              </div>`;
    } else {
      // No image for others
      return `<div class="score">${name}: ${wins}</div>`;
    }
  })
  .join('');


      // Render commander leaderboard with images
      const commanderDiv = document.getElementById('commander-leaderboard');
      if (commanderDiv) {
        const commanders = Object.entries(commanderWins)
        .filter(([_, wins]) => wins > 0) // Filter out commanders with no wins
        .sort((a, b) => b[1] - a[1]);
        commanderDiv.innerHTML = commanders
          .map(([commander, wins], idx) => `<div class="score" id="commander-${idx}">${commander}: ${wins}<br><span class="commander-img"></span></div>`)
          .join('');

        // Fetch and display images for each commander
        commanders.forEach(([commander, _], idx) => {
          fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(commander)}`)
            .then(res => res.json())
            .then(data => {
              if (data.data && data.data[0] && data.data[0].image_uris) {
                const imgUrl = data.data[0].image_uris.normal;
                const imgTag = `<img src="${imgUrl}" alt="${commander}" style="max-width:150px;display:block;margin:0 auto;">`;
                document.querySelector(`#commander-${idx} .commander-img`).innerHTML = imgTag;
              }
            })
            .catch(() => {});
        });
          }
        }
      })
      .catch(err => {
        console.error('Error loading or processing leaderboard:', err);
      });
  });