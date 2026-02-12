let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

// Backend API URL
const Api_url = "http://localhost:5000/chat";

// User object
let user = {
    message: null,
    file: {
        mime_type: null,
        data: null,
    }
};

// Generate AI Response

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    try {
        const res = await fetch(Api_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: user.message })
        });

        const data = await res.json();

        if (data.reply) {
            text.innerHTML = data.reply;
        } else {
            text.innerHTML = "AI did not respond";
        }

    } catch (error) {
        console.error(error);
        text.innerHTML = "Error fetching AI response";
    } finally {
        // Reset input and image
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.file = {};
    }
}

// Create Chat Box

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// Handle Chat Response

function handlechatResponse(userMessage) {
    if (!userMessage.trim()) return;

    user.message = userMessage;

    // User chat HTML
    let html = `
        <img src="user.png" alt="" id="userImage" width="8%">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>
    `;
    prompt.value = "";

    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    // AI chat HTML (typing)
    setTimeout(() => {
        let html = `
            <img src="ai.png" alt="" id="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="./loading.gif" alt="" class="load" width="50px">
            </div>
        `;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 300);
}

// Event Listeners

// Enter key
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handlechatResponse(prompt.value);
    }
});

// Submit button
submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

// Image input
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string,
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

// Image button click
imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});
