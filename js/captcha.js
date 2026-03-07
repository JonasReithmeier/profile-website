document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-captcha');
    const statusText = document.getElementById('captcha-status');
    const progressFill = document.getElementById('progress-fill');

    // Konfiguration
    const CHALLENGE_TEXT = "JonasFriendlyCaptcha"; 
    const DIFFICULTY = 5; // Anzahl der führenden Nullen (4 ist gut für 1-3 Sek Rechenzeit)

    startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        statusText.innerText = "Solving friendly captcha...";
        
        const startTime = performance.now();
        const solution = await solvePoW(CHALLENGE_TEXT, DIFFICULTY);
        const duration = ((performance.now() - startTime) / 1000).toFixed(2);

        statusText.innerText = `Verified in ${duration}s!`;
        progressFill.style.width = "100%";
        unlockAllLinks();
    });

    // Der eigentliche Proof-of-Work Algorithmus
    async function solvePoW(challenge, difficulty) {
        let nonce = 0;
        const targetPrefix = "0".repeat(difficulty);

        while (true) {
            const data = challenge + nonce;
            
            // SHA-256 Hash berechnen
            const msgUint8 = new TextEncoder().encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Prüfen, ob der Hash mit genügend Nullen beginnt
            if (hashHex.startsWith(targetPrefix)) {
                console.log("Gefundener Hash:", hashHex);
                return nonce;
            }

            nonce++;

            // Alle 1000 Versuche kurz pausieren, damit der Browser nicht einfriert (UX!)
            if (nonce % 1000 === 0) {
                progressFill.style.width = `${(nonce / 50000) * 100}%`; // Geschätzter Fortschritt
                await new Promise(r => setTimeout(r, 0)); 
            }
        }
    }

    function unlockAllLinks() {
        const links = document.querySelectorAll('.protected-link');
        links.forEach(link => {
            const decoded = atob(link.getAttribute('data-encoded'));
            const type = link.getAttribute('data-type');
            
            if (type === 'email') {
                link.href = `mailto:${decoded}`;
                link.querySelector('.label').innerText = decoded;
            } else {
                link.href = decoded;
            }
            link.classList.add('unlocked');
        });
    }
});