document.addEventListener('DOMContentLoaded', () => {
    // === Custom Cursor ===
    const cursorDot = document.createElement('div');
    const cursorRing = document.createElement('div');

    cursorDot.className = 'cursor-dot';
    cursorRing.className = 'cursor-ring';

    // Ensure cursor is always at the TOP
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    const lerp = (start, end, amount) => (1 - amount) * start + amount * end;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Activate custom cursor styling only after we confirm it's moving
        if (!document.body.classList.contains('custom-cursor-active')) {
            document.body.classList.add('custom-cursor-active');
        }
    });

    const animateCursor = () => {
        dotX = lerp(dotX, mouseX, 0.4);
        dotY = lerp(dotY, mouseY, 0.4);
        ringX = lerp(ringX, mouseX, 0.15);
        ringY = lerp(ringY, mouseY, 0.15);

        cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover effects for ALL interactive items
    const interactiveElements = document.querySelectorAll('a, button, .block-3, .glass-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });

    // === Connected Starfield Background ===
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let width, height, stars = [];
    const starCount = 120;
    const connectionDist = 150; // Max distance for lines

    const initStars = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2, // Tiny velocity
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 2 + 0.5,
                interactionForce: Math.random() * 0.08 + 0.05 // Increased force
            });
        }
    };

    const drawStars = () => {
        ctx.clearRect(0, 0, width, height);

        stars.forEach((star, i) => {
            const dx = mouseX - star.x;
            const dy = mouseY - star.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 250) {
                const angle = Math.atan2(dy, dx);
                const force = (250 - dist) / 250;
                star.x -= Math.cos(angle) * force * 5;
                star.y -= Math.sin(angle) * force * 5;
            }

            star.x += star.vx;
            star.y += star.vy;

            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
            if (star.y < 0) star.y = height;
            if (star.y > height) star.y = 0;

            for (let j = i + 1; j < stars.length; j++) {
                const other = stars[j];
                const dx2 = star.x - other.x;
                const dy2 = star.y - other.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (dist2 < connectionDist) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(249, 109, 0, ${0.2 * (1 - dist2 / connectionDist)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }

            ctx.fillStyle = '#f96d00';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(drawStars);
    };

    initStars();
    drawStars();
    window.addEventListener('resize', initStars);

    // === Background Grain Effect ===
    const grain = document.createElement('div');
    grain.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-image: url("https://grainy-gradients.vercel.app/noise.svg");
        opacity: 0.03; pointer-events: none; z-index: 1; mix-blend-mode: overlay;
    `;
    document.body.appendChild(grain);

    // === Ultra-Subtle Shake for Cards ===
    const cards = document.querySelectorAll('.block-3, .glass-card:not(#dynamic-hero-text)');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 300;
            const rotateY = (centerX - x) / 300;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // === Dynamic Hero Text Cycling ===
    const heroText = document.getElementById('dynamic-hero-text');
    if (heroText) {
        const prefix = heroText.querySelector('.hero-prefix');
        const subject = heroText.querySelector('.hero-subject');

        const phrases = [
            { pre: "Hey I'm", sub: "Shreyasvi Natraj" },
            { pre: "I like to", sub: "make projects" }
        ];
        let currentIdx = 0;

        const cycleText = () => {
            heroText.style.opacity = "0";
            setTimeout(() => {
                currentIdx = (currentIdx + 1) % phrases.length;
                if (prefix) prefix.innerText = phrases[currentIdx].pre;
                if (subject) subject.innerText = phrases[currentIdx].sub;
                heroText.style.opacity = "1";
            }, 500);
        };

        setInterval(cycleText, 4000);
    }
});
