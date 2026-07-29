// fights.jsonを読み込む
fetch('fights.json')
  .then(response => response.json())
  .then(data => {
    data.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    let currentSport = 'all';
    let searchKeyword = '';
    let favorites = JSON.parse(localStorage.getItem('fight_favorites')) || [];
    let predictions = JSON.parse(localStorage.getItem('fight_predictions')) || {};
    // 開いている大会イベント名を記憶するセット
    let openEvents = new Set();

    function renderFights() {
      const container = document.getElementById('fight-list');
      container.innerHTML = '';

      const filteredData = data.filter(fight => {
        if (currentSport === 'favorites') {
          return favorites.includes(fight.event);
        }

        const matchSport = (currentSport === 'all' || fight.sport === currentSport);
        const keyword = searchKeyword.toLowerCase();
        const matchEvent = fight.event.toLowerCase().includes(keyword);
        const matchVenue = fight.venue.toLowerCase().includes(keyword);
        const matchSportName = fight.sport.toLowerCase().includes(keyword);
        const matchStream = fight.stream.toLowerCase().includes(keyword);
        
        const matchFighter = fight.fights.some(f => 
          f.fighter1.toLowerCase().includes(keyword) || f.fighter2.toLowerCase().includes(keyword)
        );

        const matchSearch = matchEvent || matchVenue || matchSportName || matchStream || matchFighter;
        return matchSport && matchSearch;
      });

      if (filteredData.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: #9ca3af;">該当する試合はありません。</p>';
        return;
      }

      filteredData.forEach(fight => {
        const card = document.createElement('div');
        card.className = 'fight-card';

        const isFav = favorites.includes(fight.event);
        const isOpen = openEvents.has(fight.event); // この大会が開いていたか

        let fightsHtml = '';
        fight.fights.forEach((f, index) => {
          const fightKey = `${fight.event}_${index}`;
          const userPred = predictions[fightKey] || f.prediction || '';
          const actualWinner = f.winner || '';

          const btn1Style = userPred === f.fighter1 ? 'background: #3b82f6; color: white; border-color: #3b82f6;' : 'background: #1f2937; color: #d1d5db; border-color: #374151;';
          const btn2Style = userPred === f.fighter2 ? 'background: #3b82f6; color: white; border-color: #3b82f6;' : 'background: #1f2937; color: #d1d5db; border-color: #374151;';

          let resultBadge = '';
          if (actualWinner) {
            if (userPred === actualWinner) {
              resultBadge = '<span style="color: #10b981; font-size: 12px; margin-left: 8px;">🎯 的中!</span>';
            } else if (userPred) {
              resultBadge = '<span style="color: #ef4444; font-size: 12px; margin-left: 8px;">❌ 外れ</span>';
            } else {
              resultBadge = '<span style="color: #9ca3af; font-size: 12px; margin-left: 8px;">未予想</span>';
            }
          }

          fightsHtml += `
            <div class="fighters-item" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 6px; background: #1f2937; border-radius: 4px;">
              <div style="font-size: 14px; flex: 1;">
                <button class="pred-btn" data-fight-key="${fightKey}" data-fighter="${f.fighter1}" style="padding: 4px 8px; border-radius: 4px; border: 1px solid; cursor: pointer; margin-right: 4px; ${btn1Style}">${f.fighter1}</button>
                vs
                <button class="pred-btn" data-fight-key="${fightKey}" data-fighter="${f.fighter2}" style="padding: 4px 8px; border-radius: 4px; border: 1px solid; cursor: pointer; margin-left: 4px; ${btn2Style}">${f.fighter2}</button>
                ${resultBadge}
              </div>
            </div>
          `;
        });

        card.innerHTML = `
          <div class="card-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="sport-tag">${fight.sport}</div>
            <button class="fav-btn ${isFav ? 'active' : ''}" data-event="${fight.event}" style="background: none; border: none; cursor: pointer; font-size: 18px; color: ${isFav ? '#f59e0b' : '#9ca3af'};">
              ${isFav ? '⭐' : '☆'}
            </button>
          </div>
          <div class="date">${fight.date}</div>
          
          <div class="event-name clickable-event" title="クリックして対戦カードを開閉">${fight.event} ${isOpen ? '▴' : '▾'}</div>
          
          <div class="fights-container" style="display: ${isOpen ? 'block' : 'none'}; margin: 10px 0; padding: 10px; background: #111827; border-radius: 6px;">
            ${fightsHtml}
          </div>

          <div class="venue">会場: ${fight.venue}</div>
          <div class="stream">配信: ${fight.stream}</div>
          
          <div class="button-group" style="margin-top: 12px;">
            <a href="${fight.officialUrl}" target="_blank" class="official-btn">公式サイトへ</a>
          </div>
        `;

        const eventNameEl = card.querySelector('.clickable-event');
        const fightsContainer = card.querySelector('.fights-container');
        
        eventNameEl.addEventListener('click', () => {
          if (fightsContainer.style.display === 'none') {
            fightsContainer.style.display = 'block';
            eventNameEl.textContent = `${fight.event} ▴`;
            openEvents.add(fight.event); // 開いた状態を記録
          } else {
            fightsContainer.style.display = 'none';
            eventNameEl.textContent = `${fight.event} ▾`;
            openEvents.delete(fight.event); // 閉じた状態を記録
          }
        });

        const favBtn = card.querySelector('.fav-btn');
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (favorites.includes(fight.event)) {
            favorites = favorites.filter(eventName => eventName !== fight.event);
          } else {
            favorites.push(fight.event);
          }
          localStorage.setItem('fight_favorites', JSON.stringify(favorites));
          renderFights();
        });

        const predBtns = card.querySelectorAll('.pred-btn');
        predBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const fightKey = e.target.getAttribute('data-fight-key');
            const chosenFighter = e.target.getAttribute('data-fighter');

            if (predictions[fightKey] === chosenFighter) {
              delete predictions[fightKey];
            } else {
              predictions[fightKey] = chosenFighter;
            }

            localStorage.setItem('fight_predictions', JSON.stringify(predictions));
            renderFights();
            updateStats();
          });
        });

        container.appendChild(card);
      });
    }

    function updateStats() {
      let totalPredicted = 0;
      let totalCorrect = 0;

      data.forEach(fight => {
        fight.fights.forEach((f, index) => {
          const fightKey = `${fight.event}_${index}`;
          const userPred = predictions[fightKey];
          const actualWinner = f.winner;

          if (userPred) {
            totalPredicted++;
            if (actualWinner && userPred === actualWinner) {
              totalCorrect++;
            }
          }
        });
      });

      let statsEl = document.getElementById('stats-display');
      if (!statsEl) {
        statsEl = document.createElement('div');
        statsEl.id = 'stats-display';
        statsEl.style.cssText = 'text-align: center; margin: 15px 0; padding: 10px; background: #1f2937; border-radius: 8px; color: #f3f4f6; font-weight: bold;';
        const searchContainer = document.getElementById('search-container');
        searchContainer.parentNode.insertBefore(statsEl, searchContainer.nextSibling);
      }

      const rate = totalPredicted > 0 ? ((totalCorrect / totalPredicted) * 100).toFixed(1) : 0.0;
      statsEl.innerHTML = `📊 予想的中率: ${rate}% （的中: ${totalCorrect}勝 / 予想数: ${totalPredicted}試合）`;
    }

    renderFights();
    updateStats();

    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        currentSport = e.target.getAttribute('data-sport');
        renderFights();
      });
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      searchKeyword = e.target.value.trim();
      renderFights();
    });

  })
  .catch(error => {
    console.error('データの読み込みに失敗しました:', error);
  });
