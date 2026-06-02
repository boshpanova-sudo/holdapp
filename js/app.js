const tg = window.Telegram.WebApp;
tg.expand();

let walletAddress = null;

// TON CONNECT
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://boshpanova-sudo.github.io/holdapp/tonconnect-manifest.json",
    buttonRootId: "ton-connect-btn",
    restoreConnection: true
});

// STORAGE
function getData() {
    return JSON.parse(localStorage.getItem("holdapp") || "{}");
}

function saveData(data) {
    localStorage.setItem("holdapp", JSON.stringify(data));
}

// CHECK IN
function checkIn() {

    if (!walletAddress) return alert("Connect wallet first");

    let data = getData();

    if (!data[walletAddress]) {
        data[walletAddress] = { days: 0, last: null };
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
        user.days += 1;
    } else {
        user.days = 1;
    }

    user.last = today;

    data[walletAddress] = user;
    saveData(data);

    updateUI();
}

// LOAD BALANCE
async function loadBalance(addr) {
    try {
        let res = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${addr}`);
        let json = await res.json();

        let ton = (json.result || 0) / 1e9;

        document.getElementById("token-count").innerText = ton.toFixed(2);

    } catch {
        document.getElementById("token-count").innerText = "0";
    }
}

// UPDATE UI
function updateUI() {

    let data = getData();
    let user = data[walletAddress];

    document.getElementById("days-count").innerText =
        user ? user.days : 0;
}

// NAV
function openTab(tab, el) {

    document.querySelectorAll(".page")
        .forEach(p => p.classList.remove("active"));

    document.getElementById(tab).classList.add("active");

    document.querySelectorAll(".nav-item")
        .forEach(n => n.classList.remove("active"));

    el.classList.add("active");
}

// TON CONNECT
tonConnectUI.onStatusChange(async wallet => {

    if (wallet) {

        walletAddress = wallet.account.address;

        document.getElementById("wallet-mini").innerText =
            walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);

        document.getElementById("profile-address").innerText =
            walletAddress;

        updateUI();
        loadBalance(walletAddress);

    } else {

        walletAddress = null;

        document.getElementById("wallet-mini").innerText = "Not connected";
        document.getElementById("profile-address").innerText = "Not connected";

        document.getElementById("days-count").innerText = 0;
        document.getElementById("token-count").innerText = 0;
    }
});