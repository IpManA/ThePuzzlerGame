document.addEventListener('DOMContentLoaded', () => {
    const secretSentence = document.getElementById('secret-sentence');
    const revealLetters = document.getElementById('reveal-letters');
    const revealSeconds = document.getElementById('reveal-seconds');
    const startButton = document.getElementById('start-puzzle');
    const puzzleOutput = document.getElementById('puzzle-output');
    const charCount = document.getElementById('char-count');
    const revealAnswerButton = document.getElementById('reveal-answer');
    let intervalId;
    let revealCounts = [];

    startButton.addEventListener('click', startPuzzle);
    secretSentence.addEventListener('input', updateCharCount);
    revealAnswerButton.addEventListener('click', revealAnswer);

    function updateCharCount() {
        const count = secretSentence.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }

    function startPuzzle() {
        clearInterval(intervalId);
        const sentence = secretSentence.value;
        const letters = parseInt(revealLetters.value);
        const seconds = parseInt(revealSeconds.value);
        const isPermanent = document.querySelector('input[name="reveal-type"]:checked').value === 'permanently';

        if (!sentence) {
            alert('Please enter a secret sentence.');
            return;
        }

        puzzleOutput.innerHTML = sentence.split('').map(char => `<span class="hidden">${char}</span>`).join('');
        revealAnswerButton.style.display = 'inline-block';

        // Initialize reveal counts
        revealCounts = new Array(sentence.length).fill(0);

        // Reveal initial set of letters immediately
        revealLettersSet(isPermanent);

        intervalId = setInterval(() => revealLettersSet(isPermanent), seconds * 1000);
    }

    function revealLettersSet(isPermanent) {
        const letters = parseInt(revealLetters.value);
        const hiddenChars = [...puzzleOutput.querySelectorAll('.hidden')];

        if (hiddenChars.length === 0) {
            clearInterval(intervalId);
            return;
        }

        if (!isPermanent) {
            puzzleOutput.querySelectorAll('span').forEach((span, index) => {
                span.classList.add('hidden');
                revealCounts[index] = 0;
            });
        }

        for (let i = 0; i < letters; i++) {
            if (hiddenChars.length === 0) break;
            const charToReveal = weightedRandomSelection(hiddenChars);
            charToReveal.classList.remove('hidden');
            const index = Array.from(puzzleOutput.children).indexOf(charToReveal);
            revealCounts[index]++;
            hiddenChars.splice(hiddenChars.indexOf(charToReveal), 1);
        }
    }

    function weightedRandomSelection(hiddenChars) {
        const weights = hiddenChars.map(char => {
            const index = Array.from(puzzleOutput.children).indexOf(char);
            return Math.pow(2, -revealCounts[index]);
        });
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return hiddenChars[i];
            }
        }
        return hiddenChars[hiddenChars.length - 1];
    }

    function revealAnswer() {
        clearInterval(intervalId);
        puzzleOutput.querySelectorAll('span').forEach(span => span.classList.remove('hidden'));
        revealAnswerButton.style.display = 'none';
    }
});