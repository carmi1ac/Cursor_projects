// TREAT BANK LOGIC
const treatCountEl = document.getElementById('treatCount');
const treatBtn = document.getElementById('giveTreatBtn');

function getTreats() {
    return parseInt(localStorage.getItem('peanutTreats') || '0', 10);
}
function setTreats(val) {
    localStorage.setItem('peanutTreats', val);
}
function updateTreat() {
    const treats = getTreats();
    treatCountEl.textContent = treats;
}
if (treatBtn && treatCountEl) {
    updateTreat();
    treatBtn.addEventListener('click', () => {
        const newVal = getTreats() + 1;
        setTreats(newVal);
        updateTreat();
    });
}

// PEANUT IMAGE HOVER FX (confetti, pop, wiggle, from previous answer)
document.querySelectorAll('.about-dog-pic').forEach(pic => {
    pic.addEventListener('mouseenter', function() {
        // Pop and wiggle
        this.classList.add('pop-and-wiggle');
        // Confetti
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-spray');
        this.parentElement.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1200);
    });
    pic.addEventListener('mouseleave', function() {
        this.classList.remove('pop-and-wiggle');
        const confetti = this.parentElement.querySelector('.confetti-spray');
        if (confetti) confetti.remove();
    });
});

// --- Add wiggle animation and confetti styling dynamically ---
const style = document.createElement('style');
style.innerHTML = `
@keyframes popWiggle {
    0% { transform: scale(1.05) rotate(-4deg); }
    15% { transform: scale(1.2) rotate(7deg); }
    40% { transform: scale(1.1) rotate(-7deg); }
    60% { transform: scale(1.22) rotate(-3deg); }
    85% { transform: scale(1.13) rotate(6deg); }
    100% { transform: scale(1.18) rotate(-8deg); }
}
.pop-and-wiggle {
    animation: popWiggle 0.7s cubic-bezier(.45,1.5,.1,1) forwards;
}
.confetti-spray {
    pointer-events: none;
    position: absolute;
    left: 50%;
    top: 25%;
    width: 0; height: 0;
    z-index: 99;
}
.confetti-spray::before,
.confetti-spray::after {
    content: '';
    display: block;
    position: absolute;
    border-radius: 3px;
    width: 9px;
    height: 16px;
    background: repeating-linear-gradient(152deg, #ffd700 0 2px, #ff90c2 2px 7px, #a259ff 7px 12px, #79ffcb 12px 16px);
    left: -13px;
    top: -23px;
    box-shadow: 23px 9px #ff90c2, -8px 13px #a259ff, 17px 15px #ffd700, 5px 23px #79ffcb, -14px 23px #a259ff, 27px 23px #ffd700;
    opacity: 0.89;
    transform: rotate(-18deg);
    animation: confettiFling 1.18s cubic-bezier(.64,.09,.43,.97);
}
.confetti-spray::after {
    left: 8px;
    top: -12px;
    background: repeating-linear-gradient(157deg, #79ffcb 0 4px, #ffd700 4px 9px, #ff90c2 9px 16px);
    box-shadow: -26px -7px #ffd700, 12px 12px #79ffcb, 19px 9px #ff90c2, -13px 20px #a259ff, 24px 25px #ff90c2;
    transform: rotate(14deg);
}
@keyframes confettiFling {
    0% { opacity: 0; transform: scale(0.7) rotate(-30deg); }
    18% { opacity: 0.95; transform: scale(1.05) rotate(8deg); }
    80% { opacity: 0.7; }
    100% { opacity: 0; transform: scale(0.7) rotate(48deg); }
}
`;
document.head.appendChild(style);
