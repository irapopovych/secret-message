document.getElementById('generate').addEventListener('click', async function () {
    const message = document.getElementById('message').value;
    if (!message.trim()) {
        alert("Please, write a message!");
        return;
    }

    const key = crypto.getRandomValues(new Uint8Array(32));

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const { encryptedMessage } = await encryptMessage(message, key, iv);

    const response = await fetch('http://localhost:8000/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: encryptedMessage })
    });

    const result = await response.json();

    if (response.ok) {
        const encodedKey = arrayBufferToBase64(key);
        const encodedIV = arrayBufferToBase64(iv);
        const secretLink = window.location.origin + `/?id=${result.id}&key=${encodedKey}&iv=${encodedIV}`;

        document.getElementById('link-container').style.display = 'block';
        document.getElementById('secret-link').value = secretLink;
    } else {
        alert("Error!");
    }
});

async function encryptMessage(message, key, iv) {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        "raw", key, { name: "AES-GCM" }, false, ["encrypt"]
    );

    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        cryptoKey,
        encodedMessage
    );

    return { 
        encryptedMessage: arrayBufferToBase64(iv) + ":" + arrayBufferToBase64(encryptedData)
    };
}


async function decryptMessage(encryptedMessage, key, iv) {
    const decoder = new TextDecoder();
    const decodedKey = base64ToArrayBuffer(key);
    const decodedIV = base64ToArrayBuffer(iv);
    const encryptedData = base64ToArrayBuffer(encryptedMessage);

    const cryptoKey = await crypto.subtle.importKey(
        "raw", decodedKey, { name: "AES-GCM" }, false, ["decrypt"]
    );

    try {
        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: decodedIV },
            cryptoKey,
            encryptedData
        );
        return decoder.decode(decryptedData);
    } catch (e) {
        console.error("Decryption error:", e);
        return "Error!";
    }
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
        base64 += "=";
    }

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}


document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const messageId = urlParams.get("id");
    const key = urlParams.get("key");
    const iv = urlParams.get("iv");

    if (messageId && key && iv) {
        document.querySelector(".container").innerHTML = `<h2>Loading secret message...</h2>`;

        try {
            const response = await fetch(`http://localhost:8000/read?id=${messageId}`);
            const data = await response.json();

            if (data.message) {
                const decryptedMessage = await decryptMessage(data.message, key, iv);

                document.querySelector(".container").innerHTML = `
                    <h2>Secret Message:</h2>
                    <p>${decryptedMessage}</p>
                `;
            } else {
                document.querySelector(".container").innerHTML = `<h2>Message not found!</h2>`;
            }
        } catch (error) {
            console.error("Error fetching message:", error);
            document.querySelector(".container").innerHTML = `<h2>Error loading message!</h2>`;
        }
    }
});
