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

        let fightsHtml = '';
        fight.fights.forEach(f => {
          fightsHtml += `<div class="fighters-item">⚔️ ${f.fighter1} vs ${f.fighter2}</div>`;
        });

        card.innerHTML = `
          <div class="card-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="sport-tag">${fight.sport}</div>
            <button class="fav-btn ${isFav ? 'active' : ''}" data-event="${fight.event}" style="background: none; border: none; cursor: pointer; font-size: 18px; color: ${isFav ? '#f59e0b' : '#9ca3af'};">
              ${isFav ? '⭐' : '☆'}
            </button>
          </div>
          <div class="date">${fight.date}</div>
          
          <div class="event-name clickable-event" title="クリックして対戦カードを開閉">${fight.event} ▾</div>
          
          <div class="fights-container" style="display: none; margin: 10px 0; padding: 10px; background: #111827; border-radius: 6px;">
            ${fightsHtml}
          </div>

          <div class="venue">会場: ${fight.venue}</div>
          <div class="stream">配信: ${fight.stream}</div>
          
          <div class="button-group" style="margin-top: 12px;">
            <a href="${fight.officialUrl}" target="_blank" class="official-btn">公式サイトへ</a>
          </div>
        `;

        // 大会名をクリックしたときに対戦カードを開閉する処理
        const eventNameEl = card.querySelector('.clickable-event');
        const fightsContainer = card.querySelector('.fights-container');
        eventNameEl.addEventListener('click', () => {
          if (fightsContainer.style.display === 'none') {
            fightsContainer.style.display = 'block';
            eventNameEl.textContent = `${fight.event} ▴`;
          } else {
            fightsContainer.style.display = 'none';
            eventNameEl.textContent = `${fight.event} ▾`;
          }
        });

        // お気に入りボタンのクリックイベント
        const favBtn = card.querySelector('.fav-btn');
        favBtn.addEventListener('click', () => {
          if (favorites.includes(fight.event)) {
            favorites = favorites.filter(eventName => eventName !== fight.event);
          } else {
            favorites.push(fight.event);
          }
          localStorage.setItem('fight_favorites', JSON.stringify(favorites));
          renderFights();
        });

        container.appendChild(card);
      });
    }

    renderFights();

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
