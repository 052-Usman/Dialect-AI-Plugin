console.log("External Js included");

// Create the placeholder container
const placeholderContainer = document.createElement('div');
placeholderContainer.id = 'dialect-ai-placeholder-container';

// Create a new container element
const newContainer = document.createElement('div');
console.log("Placeholder container created");

// URL or path to the external HTML file
const externalHTMLURL = 'http://127.0.0.1:5000/'; // Replace with your URL or file path
let containerContent = '';

// Use fetch to load the external HTML content
fetch(externalHTMLURL)
    .then(response => response.text())
    .then(html => {
        // Insert the HTML content into the container
        containerContent = html;
        console.log("Content fetched");
        console.log("Setting inner HTML", containerContent);
        newContainer.innerHTML = containerContent;

        // Append the new container to the placeholder container
        placeholderContainer.appendChild(newContainer);

        // Append the placeholder container to the body
        document.body.appendChild(placeholderContainer);

        // Chatbot JS
        console.log("API Key: ", dialect_ai.key);
        initializeChatbot();
    })
    .catch(error => {
        console.error('Error loading external HTML content:', error);
    });

function initializeChatbot() {
    console.log("API Key in function: ", dialect_ai.key);

    // Variables
    const chatbot = document.getElementById('dialect-ai-custom-chatbot');
    const userInput = document.getElementById('dialect-ai-user-input');
    const sendButton = document.getElementById('dialect-ai-send-button');
    const toggleButton = document.getElementById('dialect-ai-chatbot-toggle-button');
    let isRequestInProgress = false;

    // Initial state
    chatbot.style.display = 'none';

    // Toggle chatbox
    toggleButton.addEventListener('click', () => {
        console.log('Toggle Chat button clicked'); // Log that the button was clicked
        chatbot.classList.toggle('dialect-ai-chatbot-closed');
        chatbot.style.display = chatbot.classList.contains('dialect-ai-chatbot-closed') ? 'none' : 'block';
        console.log('Chatbox state:', chatbot.classList.contains('dialect-ai-chatbot-closed') ? 'closed' : 'open'); // Log the chatbox state
    });

    // Toggle chatbot
    document.getElementById('dialect-ai-close-menu').addEventListener('click', () => {
        chatbot.classList.toggle('dialect-ai-chatbot-closed');
        chatbot.style.display = chatbot.classList.contains('dialect-ai-chatbot-closed') ? 'none' : 'block';
    });

    // Send user message to the bot
    sendButton.addEventListener('click', () => {
        sendMessage();
    });

    // Handle Enter key press in the input field
    userInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
            sendMessage();
        }
    });

    // Send user message to the bot
    function sendMessage() {
        if (isRequestInProgress) {
            return;
        }

        const userQuery = userInput.value;
        if (userQuery.trim() !== '') {
            isRequestInProgress = true;

            // Create a new tab for user message
            addUserMessage(userQuery);
            // Save the user query
            saveChatMessage(userQuery, 1);

            // Create a new tab for "Typing..." message
            addTypingMessage('Typing...');

            userInput.value = '';

            fetch('https://x4vkfxmqjgr98e-5000.proxy.runpod.net/DutchChatbotWithAuth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_query: userQuery, api_key: dialect_ai.key }),
            })
                .then(response => response.json())
                .then(response => {
                    // Remove the "Typing..." message
                    removeTypingMessage();

                    // Create a new tab for bot response
                    addBotResponse(response.response);
                    // Save the bot response
                    saveChatMessage(response.response, 0);
                })
                .catch(() => {
                    // Remove the "Typing..." message
                    removeTypingMessage();

                    // Display error message in the bot's tab
                    addBotResponse('Error: Unable to connect to the bot.');
                })
                .finally(() => {
                    isRequestInProgress = false;
                });
        }
    }

    // Function to scroll to the bottom of the chat messages
    function scrollToBottom() {
        const messageContainer = document.getElementById('dialect-ai-chatbox');
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // Hide chatbot-content initially
    document.querySelector('.dialect-ai-chatbot-content').style.display = 'none';

    document.getElementById('dialect-ai-start-chat').addEventListener('click', () => {
        const email = document.getElementById('dialect-ai-user-email').value;
        if (isValidEmail(email)) {
            console.log("Valid email address");
            document.querySelector('.dialect-ai-initial-content').style.display = 'none';
            document.querySelector('.dialect-ai-chatbot-content').style.display = 'block';
        } else {
            console.log("Invalid email address");
            document.getElementById('dialect-ai-invalid-email').style.display = 'block';
        }
    });

    // Function to fetch and display chat conversation
    function fetchChatConversation() {
        console.log("Fetching conversation history");
        // Implement conversation fetching logic here
    }

    // Function to display the chat conversation
    function displayChatConversation(conversation) {
        // Iterate through the conversation and add messages to the chat
        conversation.forEach(function (message) {
            if (message.sender === 1) {
                // Add user message to chat
                addUserMessage(message.message);
            } else if (message.sender === 0) {
                // Add bot response to chat
                addBotResponse(message.message);
            }
        });
    }

    // Function to add user message to the chat
    function addUserMessage(message) {
        // Create a new tab for user message
        const messageTab = document.createElement('div');
        messageTab.classList.add('dialect-ai-right-back');
        const userMessageSpan = document.createElement('span');
        userMessageSpan.classList.add('dialect-ai-user-message-back');
        userMessageSpan.textContent = message;
        messageTab.appendChild(userMessageSpan);
        document.querySelector('.dialect-ai-message-tabs').appendChild(messageTab);
        scrollToBottom();
    }

    // Function to add bot response to the chat
    function addBotResponse(message) {
        // Create a new tab for bot response
        const botMessageTab = document.createElement('div');
        botMessageTab.classList.add('dialect-ai-left-back');
        const botMessageSpan = document.createElement('span');
        botMessageSpan.classList.add('dialect-ai-system-message-back');
        botMessageSpan.textContent = message;
        botMessageTab.appendChild(botMessageSpan);
        document.querySelector('.dialect-ai-message-tabs').appendChild(botMessageTab);
        scrollToBottom();
    }

    function addTypingMessage(message) {
        // Create a new tab for "Typing..." message
        const loader = document.createElement('div');
        loader.id = 'dialect-ai-typing';
        loader.classList.add('dialect-ai-typing-indicator');
        loader.innerHTML = '<span></span><span></span><span></span>';
        document.querySelector('.dialect-ai-message-tabs').appendChild(loader);
        scrollToBottom();
    }

    // Function to remove the "Typing..." message
    function removeTypingMessage() {
        const typingIndicator = document.getElementById('dialect-ai-typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Function to send a chat message to the server for saving
    function saveChatMessage(message, sender) {
        const api_url = 'https://admin.dialect-ai.com/api/saveagentchat';
        const api_key = dialect_ai.key;

        fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sender: sender,
                api_key: api_key,
            }),
        })
            .then(response => response.json())
            .then(response => {
                // Handle success if needed
                console.log('Save: ', response);
            })
            .catch(() => {
                // Handle error if needed
            });
    }
}

function isValidEmail(email) {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
