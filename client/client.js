let socket = null;
let uId = null;
let input = null;

document.addEventListener("DOMContentLoaded", async function () {
    const ip = await getIp();
    input = document.getElementById('message-input');
    generateUUID();
    wsConnection(ip, uId);
    wsListenMessage();
    addMessageEvents(ip, uId);
    requestNotification();
});

async function getIp() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        const ip = data.ip;
        return ip;
    } catch (error) {
        console.error(error);
    }
}

function addMessageEvents(ip = '', uId = '') {
    document.getElementById('send-button').addEventListener('click', function () {
        const message = input.value;
        wsSend(message, ip, uId);
    });
    document.getElementById('message-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const message = input.value;
            wsSend(message, ip, uId);
        }
    });
}

function displayMessage(message = '', ip = '', wsuId = '') {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');

    input.value = '';
    messageElement.className = ip && (uId === wsuId) ? 'my-message' : 'other-message';
    messageElement.textContent = message;
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function wsConnection(ip, uid) {
    socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener("open", (event) => {
        socket.send(JSON.stringify({ ip, message: `New User Join: ${ip} - ${uid}` }));
    });
}

function wsSend(message = '', ip = '', uId = '') {
    socket.send(JSON.stringify({ ip, message, uId }));
}

function wsListenMessage() {
    socket.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
        const { message, ip, uId } = JSON.parse(event.data);
        displayMessage(message, ip, uId);
        showNotification(message)
    });
}

function requestNotification() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
            } else {
                console.log("Notification permission denied.");
            }
        });
    }
}

function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("New Message", {
            body: message,
        });
    } else if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification("New Message", {
                    body: message,
                });
            } else {
                console.log("Notification permission denied.");
            }
        });
    } else {
        console.log("Notification permission denied.");
    }
}

function generateUUID() {
    uId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}