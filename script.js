async function loadFights() {

    const response = await fetch("fights.json");
    const fights = await response.json();

    const list = document.getElementById("fight-list");
    list.innerHTML = "";

    fights.forEach(fight => {

        const card = document.createElement("div");
        card.className = "card";

        let sportClass = "";

        if (fight.sport === "RIZIN") sportClass = "rizin";
        if (fight.sport === "BOXING") sportClass = "boxing";
        if (fight.sport === "ONE") sportClass = "one";

        card.innerHTML = `
            <div class="sport ${sportClass}">
                ${fight.sport}
            </div>

            <div class="date">
                ${fight.date}
            </div>

            <div class="venue">
                📍 ${fight.venue}
            </div>

            <div class="stream">
                📺 ${fight.stream}
            </div>

            <div class="event">
                ${fight.event}
            </div>

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

}

loadFights();