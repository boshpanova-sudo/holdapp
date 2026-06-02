const tg = window.Telegram.WebApp;
tg.expand();

let walletAddress = null;
let balance = 0;

/* NAV FIX (ВАЖНО) */
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
};

/* CHECK IN */
function checkIn() {

    if (!walletAddress) {
        alert("Connect wallet first");
        return;
    }

    let data = JSON.parse(localStorage.getItem("holdapp") || "{}");

    if (!data[walletAddress]) {
        data[walletAddress] = { days: 0, last: null };
    }

    let user = data[walletAddress];

    let today = new Date().toDateString();

    // ❌ уже отмечался сегодня
    if (user.last === today) {
        alert("Already checked today");
        return;
    }

    // вчерашняя проверка
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (user.last === yesterday.toDateString()) {
        user.days = (user.days || 0) + 1;
    } else {
        user.days = 1;
    }

    user.last = today;

    data[walletAddress] = user;
    localStorage.setItem("holdapp", JSON.stringify(data));

    // 🔥 ВАЖНО: моментальный UI update
    const el = document.getElementById("days-count");
    if (el) el.innerText = user.days;
}

/* VIP SYSTEM */
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

/* BALANCE */
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

/* TON CONNECT */
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://boshpanova-sudo.github.io/holdapp/tonconnect-manifest.json",
    buttonRootId: "ton-connect-btn",
    restoreConnection: true
});

tonConnectUI.onStatusChange(async wallet => {

    if (wallet) {
        walletAddress = wallet.account.address;

        document.getElementById("wallet-mini").innerText =
            walletAddress.slice(0,6) + "..." + walletAddress.slice(-4);

        await loadBalance(walletAddress);

        // 🔥 ДОБАВЬ ЭТО
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