// ==========================================
// AI Assistant Demo - Conversation Tree
// ==========================================

(function () {
    const messagesContainer = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    // Bot avatar SVG (small bot icon)
    const botAvatarSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-3V5a3 3 0 00-3-3z"/><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M9 16c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5"/></svg>`;

    // User avatar SVG
    const userAvatarSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    // ==========================================
    // Conversation Responses
    // ==========================================

    const responses = {
        greeting: {
            text: "Hey! Thanks for stopping by Glow Aesthetics. I'm here if you have any questions about treatments, pricing, booking, whatever you need. What's on your mind?",
            quickReplies: [
                { label: 'What do you offer?', action: 'services' },
                { label: 'How much does it cost?', action: 'pricing' },
                { label: 'I want to book', action: 'book' },
                { label: 'Where are you located?', action: 'hours' },
                { label: 'Tell me about you', action: 'about' }
            ]
        },
        services: {
            text: "So we do a little bit of everything here:\n\nBotox and Dysport for smoothing out lines (starts at $12/unit), dermal fillers for lips, cheeks, and jawline (starts at $600), chemical peels, microneedling, and free skincare consultations.\n\nHonestly the best way to figure out what's right for you is just to come in and chat with us. But I can give you more details on anything if you want!",
            quickReplies: [
                { label: 'Tell me about Botox', action: 'botox' },
                { label: 'Tell me about fillers', action: 'fillers' },
                { label: 'Let me book', action: 'book' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        pricing: {
            text: "Here's the ballpark:\n\nBotox/Dysport runs $12-14 per unit. Lip filler is $600-800. Cheeks and jawline are $800-1,200. Chemical peels are $150-300 and microneedling is $250-400.\n\nWe do package deals too if you want to combine treatments and save a bit. But honestly every face is different so a free consultation is the best way to get a real number.",
            quickReplies: [
                { label: 'What packages?', action: 'packages' },
                { label: 'Book a consultation', action: 'book' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        book: {
            text: "Love it, let's get you in! We've got openings this week actually. You can grab a time through our online booking, or if you're not totally sure what you want yet I can help you figure that out first.",
            quickReplies: [
                { label: 'Book online', action: 'bookOnline' },
                { label: 'Help me figure it out', action: 'helpChoose' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        hours: {
            text: "We're at 123 Main Street, Suite 200 in West Jordan, UT. Right off the main road, free parking out front.\n\nMonday through Friday we're here 9 to 6, Saturdays 10 to 4, and Sundays we're closed (gotta rest sometime).",
            quickReplies: [
                { label: 'Get directions', action: 'directions' },
                { label: 'Book a visit', action: 'book' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        about: {
            text: "Glow was started by Celeste, a licensed RN who's been doing aesthetics for over 8 years. She's all about natural results. No one should leave here looking like a different person, just a fresher version of themselves.\n\nEvery treatment starts with a real conversation about what you want. No pressure, no upselling.",
            quickReplies: [
                { label: 'What do you offer?', action: 'services' },
                { label: 'I want to book', action: 'book' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        helpChoose: {
            text: "Okay let's figure this out! What's bugging you the most right now? Like are we talking wrinkles and fine lines, wanting more volume somewhere, or is it more of a skin texture thing?",
            quickReplies: [
                { label: 'Wrinkles/fine lines', action: 'fineLines' },
                { label: 'I want more volume', action: 'addVolume' },
                { label: 'Skin texture', action: 'skinTexture' },
                { label: 'Honestly not sure', action: 'somethingElse' }
            ]
        },
        fineLines: {
            text: "Okay so Botox is gonna be your move here. It's the gold standard for lines on the forehead, between the brows, and around the eyes.\n\nIt takes like 15 minutes, you start seeing results in a few days, and it lasts about 3-4 months. Most people are shocked at how quick and easy it is. Want to come in and talk about it?",
            quickReplies: [
                { label: 'Yeah book me', action: 'book' },
                { label: 'How much is it?', action: 'pricing' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        addVolume: {
            text: "Fillers! Whether it's lips, cheeks, or jawline, that's where the magic happens. We use hyaluronic acid fillers which are totally safe and even reversible if you change your mind.\n\nThe best part? Results are instant. You walk in, you walk out looking like that. Lasts 6-18 months depending on the area.",
            quickReplies: [
                { label: 'Book me in', action: 'book' },
                { label: 'What does it cost?', action: 'pricing' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        skinTexture: {
            text: "For texture stuff I'd look at microneedling or a chemical peel. Microneedling is amazing for pores, scarring, and overall skin quality. Chemical peels are more for dullness, uneven tone, and surface-level stuff.\n\nSome people do both honestly. A free consultation would help us figure out what makes sense for your skin specifically.",
            quickReplies: [
                { label: 'Let me book', action: 'book' },
                { label: 'What does it cost?', action: 'pricing' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        somethingElse: {
            text: "Totally fine! That's literally what consultations are for. Come in, tell Celeste what's on your mind, and she'll figure out the best game plan. No commitment, no pressure. Consultations are free.",
            quickReplies: [
                { label: 'Book a consultation', action: 'book' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        botox: {
            text: "Botox and Dysport are by far our most popular thing. People come in for forehead lines, frown lines, crow's feet. Takes about 15 minutes, kicks in after a few days, and lasts 3-4 months.\n\nWe charge $12/unit and most people need somewhere between 20-40 units depending on what areas we're treating. So you're looking at roughly $240-560 for a typical session.",
            quickReplies: [
                { label: 'Book me in', action: 'book' },
                { label: 'What about fillers?', action: 'fillers' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        fillers: {
            text: "We do lips, cheeks, jawline, chin, under-eyes, the whole thing. Everything is hyaluronic acid-based so it's safe and can be dissolved if you ever want to.\n\nLips start at $600, cheeks and jawline start at $800. And the results are instant which is pretty fun. You leave looking different than when you walked in.",
            quickReplies: [
                { label: 'I want to book', action: 'book' },
                { label: 'What about Botox?', action: 'botox' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        packages: {
            text: "We've got a few combos that save you some money:\n\nThe Glow Up is Botox + a chemical peel, saves you 15%. The Full Refresh is filler + microneedling, saves 10%. And we have a monthly membership for $199/mo that gets you one treatment a month plus 20% off anything extra.\n\nThe membership is honestly a great deal if you're planning to keep up with things regularly.",
            quickReplies: [
                { label: 'Book me in', action: 'book' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        bookOnline: {
            text: "Perfect, just pick a date and time that works for you and you're all set!",
            quickReplies: [
                { label: 'Open booking page', action: 'externalBook' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        directions: {
            text: "123 Main Street, Suite 200, West Jordan UT. You can't miss it.",
            quickReplies: [
                { label: 'Open in maps', action: 'externalMaps' },
                { label: 'Book a visit', action: 'book' },
                { label: 'Go back', action: 'menu' }
            ]
        },
        menu: {
            text: "Of course! What else you wanna know?",
            quickReplies: [
                { label: 'What do you offer?', action: 'services' },
                { label: 'How much does it cost?', action: 'pricing' },
                { label: 'I want to book', action: 'book' },
                { label: 'Where are you located?', action: 'hours' },
                { label: 'Tell me about you', action: 'about' }
            ]
        },
        fallback: {
            text: "Hmm I'm not sure I got that. I can help with services, pricing, booking, or directions though! Try one of these:",
            quickReplies: [
                { label: 'What do you offer?', action: 'services' },
                { label: 'How much does it cost?', action: 'pricing' },
                { label: 'I want to book', action: 'book' },
                { label: 'Where are you?', action: 'hours' }
            ]
        }
    };

    // ==========================================
    // Keyword Matching
    // ==========================================

    const keywordMap = [
        { keywords: ['service', 'treatment', 'offer', 'what do you do', 'menu of'], action: 'services' },
        { keywords: ['price', 'pricing', 'cost', 'how much', 'rate', 'fee', 'expensive', 'cheap', 'afford'], action: 'pricing' },
        { keywords: ['book', 'appointment', 'schedule', 'reserve', 'sign up', 'available', 'opening'], action: 'book' },
        { keywords: ['hour', 'location', 'where', 'address', 'direction', 'open', 'close', 'when are you', 'find you'], action: 'hours' },
        { keywords: ['about', 'who are you', 'tell me about', 'history', 'story', 'founded', 'owner'], action: 'about' },
        { keywords: ['botox', 'dysport', 'wrinkle', 'forehead', 'frown', 'crow'], action: 'botox' },
        { keywords: ['filler', 'lip', 'cheek', 'jawline', 'volume', 'plump'], action: 'fillers' },
        { keywords: ['peel', 'chemical peel', 'resurface'], action: 'skinTexture' },
        { keywords: ['microneedling', 'micro', 'needle', 'collagen', 'scar', 'pore'], action: 'skinTexture' },
        { keywords: ['skin', 'texture', 'tone', 'dull', 'glow', 'complexion'], action: 'skinTexture' },
        { keywords: ['help', 'choose', 'recommend', 'suggestion', 'not sure', 'which', 'best for me', 'what should'], action: 'helpChoose' },
        { keywords: ['package', 'deal', 'bundle', 'combo', 'membership', 'discount', 'save'], action: 'packages' },
        { keywords: ['fine line', 'anti-aging', 'aging', 'old', 'smooth'], action: 'fineLines' },
        { keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'sup', 'yo'], action: 'greeting' }
    ];

    function matchKeyword(input) {
        const lower = input.toLowerCase().trim();
        for (const group of keywordMap) {
            for (const keyword of group.keywords) {
                if (lower.includes(keyword)) {
                    return group.action;
                }
            }
        }
        return 'fallback';
    }

    // ==========================================
    // Message Rendering
    // ==========================================

    function addBotMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'message bot';
        msg.innerHTML = `
            <div class="message-avatar">${botAvatarSVG}</div>
            <div class="message-bubble">${formatText(text)}</div>
        `;
        messagesContainer.appendChild(msg);
        scrollToBottom();
    }

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'message user';
        msg.innerHTML = `
            <div class="message-avatar">${userAvatarSVG}</div>
            <div class="message-bubble">${escapeHTML(text)}</div>
        `;
        messagesContainer.appendChild(msg);
        scrollToBottom();
    }

    function addQuickReplies(replies) {
        const wrapper = document.createElement('div');
        wrapper.className = 'quick-replies';
        replies.forEach(function (reply) {
            const btn = document.createElement('button');
            btn.className = 'quick-reply';
            btn.textContent = reply.label;
            btn.addEventListener('click', function () {
                handleQuickReply(reply, wrapper);
            });
            wrapper.appendChild(btn);
        });
        messagesContainer.appendChild(wrapper);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar">${botAvatarSVG}</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function formatText(text) {
        // Split on newlines, escape each line, then rejoin with <br>
        // Preserve bullet characters by replacing them after escaping
        return text.split('\n').map(function (line) {
            return escapeHTML(line);
        }).join('<br>');
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function scrollToBottom() {
        requestAnimationFrame(function () {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    }

    // ==========================================
    // Interaction Handlers
    // ==========================================

    function disableAllQuickReplies() {
        var allReplySets = messagesContainer.querySelectorAll('.quick-replies:not(.disabled)');
        allReplySets.forEach(function (set) {
            set.classList.add('disabled');
        });
    }

    function handleQuickReply(reply, wrapper) {
        // Disable all previous quick replies
        disableAllQuickReplies();

        // Show user's choice as a message
        addUserMessage(reply.label);

        // Handle external links
        if (reply.action === 'externalBook' || reply.action === 'externalMaps') {
            // In a real app these would go to actual URLs
            showTypingIndicator();
            var delay = 500 + Math.random() * 300;
            setTimeout(function () {
                removeTypingIndicator();
                if (reply.action === 'externalBook') {
                    addBotMessage("So this is just a demo so there's no real booking page here. But on a live version this would pop open whatever scheduling tool the business uses, like Calendly, Vagaro, Jane, etc. The client clicks, picks a time, done.");
                } else {
                    addBotMessage("This is a demo so there's no real map link, but on a live version this would open Google Maps right to the business. One tap, directions started.");
                }
                addQuickReplies([
                    { label: 'Back to Menu', action: 'menu' }
                ]);
            }, delay);
            return;
        }

        // Show typing, then respond
        showTypingIndicator();
        var delay = 500 + Math.random() * 300;
        setTimeout(function () {
            removeTypingIndicator();
            var response = responses[reply.action] || responses.fallback;
            addBotMessage(response.text);
            if (response.quickReplies) {
                addQuickReplies(response.quickReplies);
            }
        }, delay);
    }

    function handleUserInput() {
        var text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';

        // Disable previous quick replies
        disableAllQuickReplies();

        // Show user message
        addUserMessage(text);

        // Match keyword and respond
        var action = matchKeyword(text);

        showTypingIndicator();
        var delay = 600 + Math.random() * 400;
        setTimeout(function () {
            removeTypingIndicator();
            var response = responses[action] || responses.fallback;
            addBotMessage(response.text);
            if (response.quickReplies) {
                addQuickReplies(response.quickReplies);
            }
        }, delay);
    }

    // ==========================================
    // Event Listeners
    // ==========================================

    chatSend.addEventListener('click', handleUserInput);

    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUserInput();
        }
    });

    // Restart button
    var restartBtn = document.getElementById('chatRestart');
    restartBtn.addEventListener('click', function () {
        messagesContainer.innerHTML = '';
        chatInput.value = '';
        init();
    });

    // ==========================================
    // Initial Greeting
    // ==========================================

    function init() {
        showTypingIndicator();
        setTimeout(function () {
            removeTypingIndicator();
            addBotMessage(responses.greeting.text);
            addQuickReplies(responses.greeting.quickReplies);
            // Show hint that user can type freely
            var hint = document.createElement('div');
            hint.className = 'typing-hint';
            hint.textContent = 'You can also type your own question below';
            messagesContainer.appendChild(hint);
            scrollToBottom();
        }, 800);
    }

    init();
})();
