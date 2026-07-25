const fights = [
  {
    sport: "RIZIN",
    date: "2026/7/26",
    event: "RIZIN LANDMARK",
    fighter1: "朝倉未来",
    fighter2: "平本蓮",
    url: "https://jp.rizinff.com/"
  },
  {
    sport: "BOXING",
    date: "2026/8/3",
    event: "世界タイトルマッチ",
    fighter1: "井上尚弥",
    fighter2: "対戦相手未定",
    url: "https://boxingnews.jp/"
  },
  {
    sport: "ONE",
    date: "2026/8/16",
    event: "ONE Championship",
    fighter1: "武尊",
    fighter2: "スーパーレック",
    url: "https://www.onefc.com/"
  }
];

const list = document.getElementById("fight-list");

fights.forEach(fight => {

  const card = document.createElement("div");
  card.className = "card";

  let sportClass = "";

  if (fight.sport === "RIZIN") sportClass = "rizin";
  if (fight.sport === "BOXING") sportClass = "boxing";
  if (fight.sport === "ONE") sportClass = "one";

  card.innerHTML = `
    <div class="sport ${sportClass}">${fight.sport}</div>

    <div class="date">${fight.date}</div>

    <div class="event">${fight.event}</div>

    <div class="fighters">
        <div>${fight.fighter1}</div>
        <div class="vs">VS</div>
        <div>${fight.fighter2}</div>
    </div>
  `;

  card.onclick = () => {
    window.open(fight.url, "_blank");
  };

  list.appendChild(card);

});