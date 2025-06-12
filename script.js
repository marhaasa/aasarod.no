class Terminal {
  constructor() {
    this.input = document.getElementById('input');
    this.output = document.getElementById('output');
    this.cursor = document.querySelector('.cursor');
    this.history = [];
    this.historyIndex = -1;
    this.currentDir = '~';

    this.commands = {
      help: this.showHelp.bind(this),
      clear: this.clear.bind(this),
      about: this.showAbout.bind(this),
      contact: this.showContact.bind(this),
      skills: this.showSkills.bind(this),
      work: this.showWork.bind(this),
      cv: this.showWork.bind(this),
      resume: this.showWork.bind(this),
      ls: this.listDirectory.bind(this),
      cat: this.showFile.bind(this),
      date: this.showDate.bind(this),
      echo: this.echo.bind(this),
      snake: this.startSnake.bind(this),
      neofetch: this.neofetch.bind(this)
    };

    this.init();
  }

  init() {
    this.showWelcome();
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.input.addEventListener('input', this.updateCursor.bind(this));

    // Keep input focused
    this.input.addEventListener('blur', () => {
      setTimeout(() => this.input.focus(), 0);
    });

    // Focus input on page load and clicks
    this.input.focus();
    document.addEventListener('click', () => {
      this.input.focus();
    });

    this.updateCursor();
  }

  handleKeydown(event) {
    if (event.key === 'Enter') {
      this.processCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(1);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.autoComplete();
    }
  }

  processCommand() {
    const command = this.input.value.trim();
    if (command) {
      this.history.push(command);
      this.historyIndex = this.history.length;
    }

    this.appendOutput(`<span class="success">marius@aasarod:${this.currentDir}$ </span>${command}`);

    if (command) {
      const [cmd, ...args] = command.split(' ');
      if (this.commands[cmd]) {
        this.commands[cmd](args);
      } else if (cmd) {
        this.appendOutput(`<span class="error">zsh: command not found: ${cmd}</span>`);
      }
    }

    this.input.value = '';
    this.updateCursor();
    this.scrollToBottom();

    // Ensure input stays focused
    setTimeout(() => {
      this.input.focus();
    }, 0);
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;

    this.historyIndex += direction;

    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.history.length) {
      this.historyIndex = this.history.length;
      this.input.value = '';
    } else {
      this.input.value = this.history[this.historyIndex];
    }

    this.updateCursor();
    setTimeout(() => {
      this.input.setSelectionRange(this.input.value.length, this.input.value.length);
    }, 0);
  }

  autoComplete() {
    const command = this.input.value.trim();
    const parts = command.split(' ');

    if (parts.length === 1) {
      // Complete command names
      const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(command));
      if (matches.length === 1) {
        this.input.value = matches[0];
      } else if (matches.length > 1) {
        this.appendOutput(matches.join('  '));
        this.scrollToBottom();
      }
    } else if (parts[0] === 'cat' && parts.length === 2) {
      // Complete file names for cat command
      const files = ['about.txt', 'skills.txt', 'work.txt'];
      const partial = parts[1];
      const matches = files.filter(file => file.startsWith(partial));

      if (matches.length === 1) {
        this.input.value = `cat ${matches[0]}`;
      } else if (matches.length > 1) {
        this.appendOutput(matches.join('  '));
        this.scrollToBottom();
      }
    }

    this.updateCursor();
    setTimeout(() => {
      this.input.focus();
      this.input.setSelectionRange(this.input.value.length, this.input.value.length);
    }, 0);
  }

  updateCursor() {
    const promptElement = document.querySelector('.prompt');
    if (!promptElement) return;

    const promptRect = promptElement.getBoundingClientRect();
    const inputRect = this.input.getBoundingClientRect();
    const textWidth = this.getTextWidth(this.input.value, this.input);

    // Position cursor relative to input element (which already has proper spacing)
    const leftOffset = inputRect.left - this.input.parentElement.getBoundingClientRect().left + textWidth;

    this.cursor.style.left = `${leftOffset}px`;
  }

  getTextWidth(text, element) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const style = window.getComputedStyle(element);
    context.font = `${style.fontSize} ${style.fontFamily}`;
    return context.measureText(text).width;
  }

  appendOutput(text) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.innerHTML = text;
    this.output.appendChild(line);
  }

  scrollToBottom() {
    // Only scroll if needed, don't force to bottom
    const output = this.output;
    const terminal = output.parentElement;
    const outputRect = output.getBoundingClientRect();
    const terminalRect = terminal.getBoundingClientRect();

    if (outputRect.bottom > terminalRect.bottom) {
      output.scrollTop = output.scrollHeight - output.clientHeight;
    }
  }

  showWelcome() {
    const welcome = `<span class="highlight"> 
 █████   █████  ███████  █████  ██████   ██████  ███████ 
██   ██ ██   ██ ██       ██   ██ ██   ██ ██    ██ ██   ██ 
███████ ███████ ███████  ███████ ██████  ██    ██ ██   ██ 
██   ██ ██   ██      ██  ██   ██ ██   ██ ██    ██ ██   ██ 
██   ██ ██   ██ ███████  ██   ██ ██   ██  ██████  ███████ </span>

Type <span class="success">'help'</span> to see available commands.`;
    this.appendOutput(welcome);
    this.scrollToBottom();
  }

  showHelp() {
    const help = `Available Commands:

about      - Learn more about me
contact    - Get my contact information
skills     - View my technical skills
work       - View my work experience
cv/resume  - View my work experience
neofetch   - Display system information

System Commands:

ls         - List directory contents
cat [file] - Display file contents
date       - Show current date and time
echo [text]- Display text
snake      - Play Snake game
clear      - Clear the terminal
help       - Show this help message`;
    this.appendOutput(help);
  }

  clear() {
    this.output.innerHTML = '';
  }

  showAbout() {
    const about = `About

Hello! My name is Marius Høgli Aasarød, and I am passionate about fly fishing, cooking, programming, data visualization, design, art, and strategy. I love exploring new ways to combine these interests in my work and hobbies.

If you'd like to get in touch, feel free to reach out via email or connect with me on GitHub.

<span class="highlight">GitHub:</span> <a href="https://github.com/marhaasa" target="_blank">github.com/marhaasa</a>
<span class="highlight">Email:</span>  <a href="mailto:marius@aasarod.no">marius@aasarod.no</a>`;
    this.appendOutput(about);
  }

  showContact() {
    const contact = `Contact Information

<span class="highlight">GitHub:</span> <a href="https://github.com/marhaasa" target="_blank">github.com/marhaasa</a>
<span class="highlight">Email:</span>  <a href="mailto:marius@aasarod.no">marius@aasarod.no</a>`;
    this.appendOutput(contact);
  }

  showSkills() {
    const skills = `Technical Skills

Programming languages:
Python, Go, SQL, HTML/CSS/JS

Tools and platforms:
Tableau, Power BI, Azure, Azure Functions, Google Analytics, Pandas, Polars

Skills:
Data Analysis, Visualization & Interpretation
Data Storage, Manipulation, Transformation & Management
Agile Development Methodologies
Collaborative Leadership`;
    this.appendOutput(skills);
  }

  showWork() {
    const work = `Work Experience

<span class="highlight">Senior Consultant at Crayon Consulting AS</span>
Transforming data into actionable insights.

<span class="highlight">Business Analyst at Folkeinvest AS</span>
Tackled the intricate world of analytics and Python-based microservice development for streamlining workflows through automation.

<span class="highlight">Senior Associate at KPMG AS</span>
Developed customizable dashboards, robust reporting systems, and defined design principles to optimize usability and enhance overall business effectiveness.

<span class="highlight">Consultant at Rav Norge AS</span>
Designed dashboards, reporting solutions and established design guidelines focusing on UX/service design for better user experiences and holistic business management.`;
    this.appendOutput(work);
  }

  listDirectory() {
    const files = `total 3
-rw-r--r--  1 marius  staff  287 Dec  6 14:30 about.txt
-rw-r--r--  1 marius  staff  421 Dec  6 14:30 skills.txt
-rw-r--r--  1 marius  staff  612 Dec  6 14:30 work.txt`;
    this.appendOutput(files);
  }

  showFile(args) {
    if (!args.length) {
      this.appendOutput('<span class="error">cat: usage: cat [file]</span>');
      return;
    }

    const filename = args[0];
    const fileMap = {
      'about.txt': () => this.showAbout(),
      'skills.txt': () => this.showSkills(),
      'work.txt': () => this.showWork()
    };

    if (fileMap[filename]) {
      fileMap[filename]();
    } else {
      this.appendOutput(`<span class="error">cat: ${filename}: No such file or directory</span>`);
    }
  }


  showDate() {
    const now = new Date();
    this.appendOutput(now.toString());
  }

  echo(args) {
    const text = args.join(' ');
    this.appendOutput(text);
  }

  neofetch() {
    const neofetch = `                    -\`               <span class="highlight">marius@aasarod.no</span>
                   .o+\`              -----------------
                  \`ooo/              <span class="info">OS:</span> Portfolio macOS
                 \`+oooo:             <span class="info">Host:</span> Web Terminal
                \`+oooooo:            <span class="info">Kernel:</span> JavaScript Engine
                -+oooooo+:           <span class="info">Uptime:</span> Since page load
              \`/:-:++oooo+:          <span class="info">Shell:</span> zsh 5.8.1
             \`/++++/+++++++:         <span class="info">Resolution:</span> ${window.innerWidth}x${window.innerHeight}
            \`/++++++++++++++:        <span class="info">Terminal:</span> Web Browser
           \`/+++ooooooooooooo/\`      <span class="info">CPU:</span> JavaScript V8
          ./ooosssso++osssssso+\`     <span class="info">Memory:</span> Optimized
         .oossssso-\`\`\`\`/ossssss+\`    
        -osssssso.      :ssssssso.   
       :osssssss/        osssso+++.  
      /ossssssss/        +ssssooo/-  <span class="error">●</span><span class="warning">●</span><span class="success">●</span><span class="info">●</span><span class="secondary">●</span><span class="highlight">●</span>
    \`/ossssso+/:-        -:/+osssso+- 
   \`+sso+:-\`                 \`.-/+oso:
  \`++:.                           \`-/+/
  .\`                                 \`/`;
    this.appendOutput(neofetch);
  }

  startSnake() {
    this.appendOutput('Starting Snake Game... Use WASD to move, Q to quit');

    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: var(--bg0-hard);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: monospace;
            color: var(--fg1);
        `;

    const gameOutput = document.createElement('div');
    gameOutput.id = 'snake-game';
    overlay.appendChild(gameOutput);

    document.body.appendChild(overlay);

    // Simple Snake Game
    const game = new SnakeGame(gameOutput, () => {
      document.body.removeChild(overlay);
      this.input.value = ''; // Clear input
      this.updateCursor();
      this.input.focus();
    });
    game.start();
  }
}

class SnakeGame {
  constructor(container, onExit) {
    this.container = container;
    this.onExit = onExit;
    this.width = 40;
    this.height = 20;
    this.snake = [{ x: 20, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.food = this.generateFood();
    this.score = 0;
    this.gameRunning = true;
    this.keyHandler = this.handleKey.bind(this);
    this.speed = 200; // Starting speed
    this.gameLoop = null;
  }

  generateFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * this.width),
        y: Math.floor(Math.random() * this.height)
      };
    } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
    return food;
  }

  handleKey(event) {
    const key = event.key.toLowerCase();

    if (this.gameRunning) {
      switch (key) {
        case 'w': case 'arrowup':
          if (this.direction.y === 0) this.direction = { x: 0, y: -1 };
          break;
        case 's': case 'arrowdown':
          if (this.direction.y === 0) this.direction = { x: 0, y: 1 };
          break;
        case 'a': case 'arrowleft':
          if (this.direction.x === 0) this.direction = { x: -1, y: 0 };
          break;
        case 'd': case 'arrowright':
          if (this.direction.x === 0) this.direction = { x: 1, y: 0 };
          break;
        case 'q':
          event.preventDefault();
          event.stopPropagation();
          this.endGame();
          return;
      }
    } else {
      // Game over state - only respond to Q to quit
      if (key === 'q') {
        event.preventDefault();
        event.stopPropagation();
        this.endGame();
        return;
      }
    }
    event.preventDefault();
  }

  update() {
    if (!this.gameRunning) return;

    const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

    // Check wall collision
    if (head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height) {
      this.gameOver();
      return;
    }

    // Check self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.food = this.generateFood();
      this.increaseSpeed();
    } else {
      this.snake.pop();
    }

    this.render();
  }

  render() {
    let grid = Array(this.height).fill().map(() => Array(this.width).fill(' '));

    // Place food
    grid[this.food.y][this.food.x] = '●';

    // Place snake with consistent rendering
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        grid[segment.y][segment.x] = '█'; // head - solid block
      } else {
        grid[segment.y][segment.x] = '█'; // body - same solid block
      }
    });

    const statusText = this.gameRunning
      ? `<span class="highlight">Score: ${this.score}</span> | <span class="muted">WASD to move, Q to quit</span>`
      : `<span class="error">GAME OVER!</span> <span class="highlight">Final Score: ${this.score}</span> | <span class="muted">Press Q to quit</span>`;

    const gameDisplay = `┌${'─'.repeat(this.width)}┐\n` +
      grid.map(row => `│${row.join('')}│`).join('\n') +
      `\n└${'─'.repeat(this.width)}┘\n\n` +
      statusText;

    this.container.innerHTML = `<pre style="line-height: 1; font-size: 12px;">${gameDisplay}</pre>`;
  }

  increaseSpeed() {
    // Increase speed by reducing interval by 8ms each food eaten
    // Minimum speed of 80ms to keep it playable
    this.speed = Math.max(80, this.speed - 8);

    // Restart the game loop with new speed
    clearInterval(this.gameLoop);
    this.gameLoop = setInterval(() => this.update(), this.speed);
  }

  start() {
    document.addEventListener('keydown', this.keyHandler);
    this.render();
    this.gameLoop = setInterval(() => this.update(), this.speed);
  }

  gameOver() {
    this.gameRunning = false;
    clearInterval(this.gameLoop);
    this.render(); // Re-render with game over message
  }

  endGame() {
    clearInterval(this.gameLoop);
    document.removeEventListener('keydown', this.keyHandler);

    // Clear any pending input and reset terminal state
    setTimeout(() => {
      // Clear any keys that might be in the input buffer
      const terminal = document.querySelector('#input');
      if (terminal) {
        terminal.value = '';
      }
      this.onExit();
    }, 100);
  }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Terminal();
});
