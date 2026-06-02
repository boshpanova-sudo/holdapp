const tg = window.Telegram.WebApp;
tg.expand();

let walletAddress = null;
let balance = 0;

/* LINKS */
const vipLinks = {
    1: "https://t.me/group_level_1",
    2: "https://t.me/group_level_2",
    3: "https://t.me/group_level_3"
};

/* STORAGE */
function getData() {
    return JSON.parse(localStorage.getItem("holdapp") || "{}");
}

function saveData(data) {
    localStorage.setItem("holdapp", JSON.stringify(data));
}

/* INIT USER FIX (ВАЖНО) */
function initUser() {
    if (!walletAddress) return;

    let data = getData();

    if (!data[walletAddress]) {
        data[walletAddress] = { days: 0, last: null, prizes: [] };
        saveData(data);
    }

    document.getElementById("days-count").innerText = data[walletAddress].days;
}

/* CHECK IN FIX */
function checkIn() {

    if (!walletAddress) {
        alert("Connect wallet first");
        return;
    }

    let data = getData();

    if (!data[walletAddress]) {
        data[walletAddress] = { days: 0, last: null, prizes: [] };
    }

    let user = data[walletAddress];

    let today = new Date().toDateString();

    if (user.last === today) {
        alert("Already checked today");
        return;
    }

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (user.last === yesterday.toDateString()) {
        user.days = Number(user.days || 0) + 1;
    } else {
        user.days = 1;
    }

    user.last = today;

    data[walletAddress] = user;
    saveData(data);

    // 🔥 UI FIX (главное исправление)
    document.getElementById("days-count").innerText = user.days;
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

/* VIP */
function enterVIP(level) {

    if (!walletAddress) return alert("Connect wallet first");

    const req = {
        1: 100,
        2: 500,
        3: 1000
    };

    if (balance < req[level]) {
        return alert("Not enough TON balance");
    }

    window.open(vipLinks[level], "_blank");
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

        initUser(); // 🔥 ВАЖНО: теперь streak всегда подгружается

    } else {
        walletAddress = null;
    }
});