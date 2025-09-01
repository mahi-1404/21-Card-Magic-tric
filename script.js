let cards = []; // Stores the currently displayed cards
let round = 1; // Tracks the current round (e.g., 1st, 2nd, 3rd)
let countdownSeconds = 10; // Number of seconds for countdown timer
let countdownInterval; // Holds reference to the interval timer

const suits = ['♠', '♥', '♦', '♣']; // All four card suits
const redSuits = ['♥', '♦']; // Red colored suits used for styling
const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']; // Card values from 2 to Ace

function shuffle(array) { // Function to shuffle an array using Fisher-Yates algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateDeck() { // Creates and returns a shuffled array of 21 random cards
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return shuffle(deck).slice(0, 21);
}

function createCardElement(card, small = false) { // Creates a DOM element representing a card for display
  const cardDiv = document.createElement('div');
  cardDiv.classList.add(small ? 'card1' : 'card');
  if (redSuits.includes(card.suit)) cardDiv.classList.add('red');

  const topLeft = document.createElement('div');
  topLeft.classList.add('top-left');
  topLeft.textContent = card.value + card.suit;
  cardDiv.appendChild(topLeft);

  const bottomRight = document.createElement('div');
  bottomRight.classList.add('bottom-right');
  bottomRight.textContent = card.value + card.suit;
  cardDiv.appendChild(bottomRight);

  const centerSymbol = document.createElement('div');
  centerSymbol.classList.add('center-symbol');
  centerSymbol.textContent = card.suit;
  cardDiv.appendChild(centerSymbol);

  return cardDiv;
}

function showCountdown() {
  const instructions = document.getElementById('instructions');
  instructions.textContent = `Memorize your card! Starting in ${countdownSeconds} seconds...`;

  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  container.style.flexWrap = 'wrap';
  container.style.justifyContent = 'center';
  container.style.gap = '12px';

  cards.forEach(card => {
    const cardEl = createCardElement(card, true);
    cardEl.style.position = 'static';
    container.appendChild(cardEl);
  });

  countdownInterval = setInterval(() => {
    countdownSeconds--;
    if (countdownSeconds <= 0) {
      clearInterval(countdownInterval);
      instructions.textContent = 'Watch the cards combine...';
      combineCardsToCenter();
    } else {
      instructions.textContent = `Memorize your card! Starting in ${countdownSeconds} seconds...`;
    }
  }, 1000);
}

function combineCardsToCenter() {
  const container = document.getElementById('cards-container');
  const allCards = Array.from(container.children);

  allCards.forEach((cardEl, i) => {
    setTimeout(() => {
      cardEl.classList.add('combine-to-center');
    }, i * 30);
  });

  setTimeout(() => {
    renderPiles(cards);
    document.getElementById('instructions').textContent = 'Click the pile that contains your card.';
  }, 1000 + allCards.length * 30);
}

function renderPiles(cardArray) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  container.style.flexWrap = 'nowrap';
  container.style.justifyContent = 'center';
  container.style.gap = '40px';

  const piles = [[], [], []];
  for (let i = 0; i < cardArray.length; i++) {
    piles[i % 3].push(cardArray[i]);
  }

  piles.forEach((pile, pileIndex) => {
    const pileDiv = document.createElement('div');
    pileDiv.className = 'pile';
    pileDiv.onclick = () => choosePile(pileIndex);

    pile.forEach((card, i) => {
      const cardDiv = createCardElement(card, false);
      cardDiv.style.top = `${i * 30}px`;
      pileDiv.appendChild(cardDiv);
    });

    container.appendChild(pileDiv);
  });
}

function choosePile(selectedIndex) {
  const piles = [[], [], []];
  for (let i = 0; i < cards.length; i++) {
    piles[i % 3].push(cards[i]);
  }

  const order = selectedIndex === 0 ? [1, 0, 2] :
                selectedIndex === 1 ? [0, 1, 2] :
                [0, 2, 1];

  cards = [...piles[order[0]], ...piles[order[1]], ...piles[order[2]]];

  if (round < 3) {
    round++;
    renderPiles(cards);
    document.getElementById('instructions').textContent = 'Click the pile that contains your card.';
  } else {
    revealCard();
  }
}

function revealCard() {
  document.getElementById('cards-container').style.display = 'none';
  document.getElementById('instructions').textContent = '';
  document.getElementById('result').innerHTML = `🎉 Your card is:`;

  const revealedCard = createCardElement(cards[10]);
  revealedCard.style.margin = '20px auto';
  revealedCard.classList.add('revealed');
  document.getElementById('result').appendChild(revealedCard);
  document.getElementById('restart').style.display = 'inline-block';

  fireworkBlast();
}

function startGame() {
  cards = generateDeck();
  round = 1;
  countdownSeconds = 10;
  document.getElementById('result').innerHTML = '';
  document.getElementById('restart').style.display = 'none';
  document.getElementById('cards-container').style.display = 'flex';
  showCountdown();
}

window.onload = () => {
  document.getElementById('restart').onclick = startGame;
  startGame();
};

function fireworkBlast() {
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const rockets = [];

  function createParticle(x, y) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 5 + 2;
    return {
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 100,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`
    };
  }

  function explode(x, y) {
    for (let i = 0; i < 40; i++) {
      particles.push(createParticle(x, y));
    }
  }

  function launchRocket() {
    const x = Math.random() * canvas.width;
    const rocket = {
      x,
      y: canvas.height,
      dx: 0,
      dy: -Math.random() * 3 - 4,
      peakY: Math.random() * (canvas.height / 2),
      exploded: false,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };
    rockets.push(rocket);
  }

  function updateSkyshots() {
    rockets.forEach((rocket, index) => {
      rocket.x += rocket.dx;
      rocket.y += rocket.dy;

      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = rocket.color;
      ctx.fill();

      if (!rocket.exploded && rocket.y <= rocket.peakY) {
        rocket.exploded = true;
        explode(rocket.x, rocket.y);
        rockets.splice(index, 1);
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.05;
      p.life--;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();

      if (p.life <= 0) particles.splice(i, 1);
    });

    updateSkyshots();

    if (particles.length > 0 || rockets.length > 0) {
      requestAnimationFrame(animate);
    }
  }

  explode(canvas.width / 2, canvas.height / 2);
  for (let i = 0; i < 5; i++) {
    setTimeout(launchRocket, i * 300);
  }

  animate();
}
function createCardElement(card, small = false) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add(small ? 'card1' : 'card');
  if (redSuits.includes(card.suit)) cardDiv.classList.add('red');

  const topLeft = document.createElement('div');
  topLeft.classList.add('top-left');
  topLeft.textContent = card.value + card.suit;
  cardDiv.appendChild(topLeft);

  const bottomRight = document.createElement('div');
  bottomRight.classList.add('bottom-right');
  bottomRight.textContent = card.value + card.suit;
  cardDiv.appendChild(bottomRight);

  const centerSymbol = document.createElement('div');
  centerSymbol.classList.add('center-symbol');
  centerSymbol.textContent = card.suit;
  cardDiv.appendChild(centerSymbol);

  return cardDiv; // Return the card element to be displayed
}

function showCountdown() {
  const instructions = document.getElementById('instructions');
  instructions.textContent = `Memorize your card! Starting in ${countdownSeconds} seconds...`;

  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  container.style.flexWrap = 'wrap';
  container.style.justifyContent = 'center';
  container.style.gap = '12px';

  cards.forEach(card => {
    const cardEl = createCardElement(card, true);
    cardEl.style.position = 'static';
    container.appendChild(cardEl);
  });

  countdownInterval = setInterval(() => {
    countdownSeconds--;
    if (countdownSeconds <= 0) {
      clearInterval(countdownInterval);
      instructions.textContent = 'Watch the cards combine...';
      combineCardsToCenter();
    } else {
      instructions.textContent = `Memorize your card! Starting in ${countdownSeconds} seconds...`;
    }
  }, 1000);
}

function combineCardsToCenter() {
  const container = document.getElementById('cards-container');
  const allCards = Array.from(container.children);

  allCards.forEach((cardEl, i) => {
    setTimeout(() => {
      cardEl.classList.add('combine-to-center');
    }, i * 30);
  });

  setTimeout(() => {
    renderPiles(cards);
    document.getElementById('instructions').textContent = 'Click the pile that contains your card.';
  }, 1000 + allCards.length * 30);
}

function renderPiles(cardArray) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  container.style.flexWrap = 'nowrap';
  container.style.justifyContent = 'center';
  container.style.gap = '40px';

  const piles = [[], [], []];
  for (let i = 0; i < cardArray.length; i++) {
    piles[i % 3].push(cardArray[i]);
  }

  piles.forEach((pile, pileIndex) => {
    const pileDiv = document.createElement('div');
    pileDiv.className = 'pile';
    pileDiv.onclick = () => choosePile(pileIndex);

    pile.forEach((card, i) => {
      const cardDiv = createCardElement(card, false);
      cardDiv.style.top = `${i * 30}px`;
      pileDiv.appendChild(cardDiv);
    });

    container.appendChild(pileDiv);
  });
}

function choosePile(selectedIndex) {
  const piles = [[], [], []];
  for (let i = 0; i < cards.length; i++) {
    piles[i % 3].push(cards[i]);
  }

  const order = selectedIndex === 0 ? [1, 0, 2] :
                selectedIndex === 1 ? [0, 1, 2] :
                [0, 2, 1];

  cards = [...piles[order[0]], ...piles[order[1]], ...piles[order[2]]];

  if (round < 3) {
    round++;
    renderPiles(cards);
    document.getElementById('instructions').textContent = 'Click the pile that contains your card.';
  } else {
    revealCard();
  }
}

function revealCard() { // Reveals the selected card after 3 rounds
  document.getElementById('cards-container').style.display = 'none';
  document.getElementById('instructions').textContent = '';
  document.getElementById('result').innerHTML = `🎉 Your card is:`;

  const revealedCard = createCardElement(cards[10]);
  revealedCard.style.margin = '20px auto';
  revealedCard.classList.add('revealed');
  document.getElementById('result').appendChild(revealedCard);
  document.getElementById('restart').style.display = 'inline-block';

  fireworkBlast();
}

function startGame() { // Initializes the game: generates cards and shows round 1
  cards = generateDeck();
  round = 1;
  countdownSeconds = 10;
  document.getElementById('result').innerHTML = '';
  document.getElementById('restart').style.display = 'none';
  document.getElementById('cards-container').style.display = 'flex';
  showCountdown();
}

window.onload = () => { // Automatically start the game when the page loads
  document.getElementById('restart').onclick = startGame;
  startGame();
};

function fireworkBlast() {
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const rockets = [];

  function createParticle(x, y) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 5 + 2;
    return {
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 100,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`
    };
  }

  function explode(x, y) {
    for (let i = 0; i < 40; i++) {
      particles.push(createParticle(x, y));
    }
  }

  function launchRocket() {
    const x = Math.random() * canvas.width;
    const rocket = {
      x,
      y: canvas.height,
      dx: 0,
      dy: -Math.random() * 3 - 4,
      peakY: Math.random() * (canvas.height / 2),
      exploded: false,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };
    rockets.push(rocket);
  }

  function updateSkyshots() {
    rockets.forEach((rocket, index) => {
      rocket.x += rocket.dx;
      rocket.y += rocket.dy;

      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = rocket.color;
      ctx.fill();

      if (!rocket.exploded && rocket.y <= rocket.peakY) {
        rocket.exploded = true;
        explode(rocket.x, rocket.y);
        rockets.splice(index, 1);
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.05;
      p.life--;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();

      if (p.life <= 0) particles.splice(i, 1);
    });

    updateSkyshots();

    if (particles.length > 0 || rockets.length > 0) {
      requestAnimationFrame(animate);
    }
  }

  explode(canvas.width / 2, canvas.height / 2);
  for (let i = 0; i < 5; i++) {
    setTimeout(launchRocket, i * 300);
  }

  animate();
}