const tg = window.Telegram.WebApp;
tg.expand();

let walletAddress = null;
let balance = 0;

const BACKEND = "https://weo-production-c4cd0.up.railway.app";

/* ================= NAV ================= */
window.openTab = function (tab, el) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    const page = document.getElementById(tab);
    if (page) page.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(n => {
        n.classList.remove("active");
    });

    if (el) el.classList.add("active");

    if (tab === "rating") {
        loadLeaderboard();
    }
};

/* ================= CHECK IN ================= */
async function checkIn() {

    if (!walletAddress) {
        alert("Connect wallet first");
        return;
    }

    try {
        const res = await fetch(`${BACKEND}/api/checkin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                address: walletAddress,
                telegram_id: tg.initDataUnsafe?.user?.id || 0
            })
        });

        const data = await res.json();

        if (data.status === "ok") {
            alert("Check-in success 🚀");
        } else if (data.status === "already") {
            alert("Already checked today");
        } else {
            alert("Check-in error");
        }

    } catch (e) {
        console.error(e);
        alert("Error check-in");
    }
}

/* ================= VIP ================= */
const vipLinks = {
    1: "https://t.me/group_level_1",
    2: "https://t.me/group_level_2",
    3: "https://t.me/group_level_3"
};

function enterVIP(level) {

    if (!walletAddress) return alert("Connect wallet first");

    const req = {
        1: 100,
        2: 500,
        3: 1000
    };

    if (balance < req[level]) {
        return alert("Not enough TON");
    }

    window.open(vipLinks[level], "_blank");
}

/* ================= BALANCE ================= */
async function loadBalance(addr) {
    try {
        let res = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${addr}`);
        let json = await res.json();

        balance = (json.result || 0) / 1e9;

        document.getElementById("token-count").innerText = balance.toFixed(2);

    } catch {
        balance = 0;
    }
}

/* ================= TON CONNECT ================= */
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://boshpanova-sudo.github.io/holdapp/tonconnect-manifest.json",
    buttonRootId: "ton-connect-btn",
    restoreConnection: true
});

tonConnectUI.onStatusChange(async wallet => {

    if (wallet) {
        walletAddress = wallet.account.address;

        document.getElementById("wallet-mini").innerText =
            walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);

        await loadBalance(walletAddress);

        let data = JSON.parse(localStorage.getItem("holdapp") || "{}");

        if (!data[walletAddress]) {
            data[walletAddress] = { days: 0, last: null };
            localStorage.setItem("holdapp", JSON.stringify(data));
        }

        document.getElementById("days-count").innerText =
            data[walletAddress].days;

    } else {
        walletAddress = null;
    }
});

/* ================= LEADERBOARD ================= */
async function loadLeaderboard() {
    try {
        const res = await fetch(`${BACKEND}/api/leaderboard`);
        const data = await res.json();

        const container = document.getElementById("leaderboard-list");

        if (!data || data.length === 0) {
            container.innerHTML = "No data yet";
            return;
        }

        container.innerHTML = "";

        data.forEach((user, index) => {

            const div = document.createElement("div");
            div.className = "leader";

            let medal = "👤";
            if (index === 0) medal = "🥇";
            if (index === 1) medal = "🥈";
            if (index === 2) medal = "🥉";

            div.innerHTML = `
                <div>${medal} ${user.username || "User"}</div>
                <div class="gifts">🎁 ${user.gifts}</div>
            `;

            container.appendChild(div);
        });

    } catch (e) {
        console.error(e);
        document.getElementById("leaderboard-list").innerHTML =
            "Error loading leaderboard";
    }
}