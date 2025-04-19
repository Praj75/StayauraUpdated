document.addEventListener('DOMContentLoaded', function() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    const quickReplies = document.getElementById('quickReplies');
    const typingIndicator = document.getElementById('typingIndicator');
    const notificationBadge = document.getElementById('notificationBadge');

    // Toggle chat window
    chatbotButton.addEventListener('click', () => {
        chatWindow.classList.add('active');
        notificationBadge.style.display = 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Handle quick replies
    const quickReplyButtons = quickReplies.querySelectorAll('.quick-reply-btn');
    quickReplyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const message = button.textContent;
            addMessage(message, 'user');
            handleQuickReply(message);
        });
    });

    // Handle message input
    function handleMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            messageInput.value = '';
            simulateBotResponse(message);
        }
    }

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMessage();
        }
    });

    sendButton.addEventListener('click', handleMessage);

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Simulate bot response
    function simulateBotResponse(userMessage) {
        typingIndicator.style.display = 'block';
        
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            let response = '';
            
            if (userMessage.toLowerCase().includes('book') || userMessage.toLowerCase().includes('stay')) {
                response = 'To book a stay, please visit our listings page and select your preferred accommodation. You can filter by location, price, and amenities.';
            } else if (userMessage.toLowerCase().includes('check') || userMessage.toLowerCase().includes('booking')) {
                response = 'To check your booking, please log in to your account and visit the "My Bookings" section. You can view, modify, or cancel your reservations there.';
            } else if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('support')) {
                response = 'Our support team is available 24/7. You can contact us through the "Contact Us" page or email us at support@trivinia.com.';
            } else {
                response = 'I apologize, but I\'m not sure how to help with that. Please try one of our quick reply options or contact our support team for assistance.';
            }
            
            addMessage(response, 'bot');
        }, 1000);
    }

    // Handle quick reply responses
    function handleQuickReply(quickReply) {
        simulateBotResponse(quickReply);
    }

    // Show notification badge after 5 seconds
    setTimeout(() => {
        notificationBadge.style.display = 'flex';
    }, 5000);
}); 