/*
    ╔══════════════════════════════════════╗
    ║                                      ║
    ║         🕵️ HIDDEN ASCII ART 🕵️        ║
    ║                                      ║
    ║     ██╗  ██╗██╗██████╗ ██████╗ ███████╗███╗   ██╗     ║
    ║     ██║  ██║██║██╔══██╗██╔══██╗██╔════╝████╗  ██║     ║
    ║     ███████║██║██║  ██║██║  ██║█████╗  ██╔██╗ ██║     ║
    ║     ██╔══██║██║██║  ██║██║  ██║██╔══╝  ██║╚██╗██║     ║
    ║     ██║  ██║██║██████╔╝██████╔╝███████╗██║ ╚████║     ║
    ║     ╚═╝  ╚═╝╚═╝╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝     ║
    ║                                      ║
    ║  "You found the secret ASCII art!"   ║
    ║                                      ║
    ╚══════════════════════════════════════╝
*/

class Terminal {
  constructor() {
    this.input = document.getElementById('input');
    this.output = document.getElementById('output');
    this.cursor = document.querySelector('.cursor');
    this.history = [];
    this.historyIndex = -1;
    this.currentDir = '~';
    this.konamiCode = [];
    this.konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    this.godModeActive = false;

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
    this.startBootSequence();
  }

  startBootSequence() {
    // Hide terminal interface during boot
    const inputLine = document.querySelector('.input-line');
    inputLine.style.display = 'none';
    
    const bootMessages = [
      { text: 'AASAROD Terminal OS v2.1.0 - Starting boot sequence...', delay: 500 },
      { text: 'Initializing hardware components...', delay: 800 },
      { text: 'Loading kernel modules...', delay: 600 },
      { text: 'Mounting filesystems...', delay: 700 },
      { text: 'Starting network services...', delay: 650 },
      { text: 'Loading user profile: marius@aasarod', delay: 900 },
      { text: 'Initializing terminal environment...', delay: 700 },
      { text: 'Checking portfolio data integrity...', delay: 800 },
      { text: 'All systems operational. Boot complete.', delay: 1000 },
      { text: '', delay: 300 }
    ];

    let messageIndex = 0;
    const displayMessage = () => {
      if (messageIndex < bootMessages.length) {
        const message = bootMessages[messageIndex];
        if (message.text) {
          this.appendOutput(`<span class="success">[OK]</span> <span class="muted">${message.text}</span>`);
        } else {
          this.appendOutput('');
        }
        messageIndex++;
        setTimeout(displayMessage, message.delay);
      } else {
        this.finishBoot();
      }
    };

    displayMessage();
  }

  finishBoot() {
    // Show welcome message and initialize normal terminal
    this.showWelcome();
    
    // Show terminal interface
    const inputLine = document.querySelector('.input-line');
    inputLine.style.display = 'flex';
    
    // Initialize input handlers
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
    // Check for Konami code - if activated, stop processing this key
    if (this.checkKonamiCode(event)) {
      return;
    }

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
    // Always scroll to bottom to show latest output like a real terminal
    window.scrollTo(0, document.body.scrollHeight);
  }

  showWelcome() {
    const welcome = `<span class="highlight"> 
 █████   █████  ███████  █████  ██████   ██████  ███████ 
██   ██ ██   ██ ██      ██   ██ ██   ██ ██    ██ ██    ██ 
███████ ███████ ███████ ███████ ██████  ██    ██ ██     ██ 
██   ██ ██   ██      ██ ██   ██ ██   ██ ██    ██ ██    ██ 
██   ██ ██   ██ ███████ ██   ██ ██   ██  ██████  ███████ </span>

Type <span class="success">'help'</span> to see available commands.`;
    this.appendOutput(welcome);
    this.scrollToBottom();
  }

  showHelp() {
    let help = `Available Commands:

about      - Learn more about me
contact    - Get my contact information
skills     - View my technical skills
work       - View my work experience
cv/resume  - View my work experience
neofetch   - Display system information

Entertainment:

snake      - Play Snake game

System Commands:

ls         - List directory contents
cat [file] - Display file contents
date       - Show current date and time
echo [text]- Display text
clear      - Clear the terminal
help       - Show this help message`;

    if (this.godModeActive) {
      help += `

<span class="warning">🔓 GOD MODE COMMANDS:</span>

hack       - Simulate hacking sequence
sudo [cmd] - Run commands with fake admin rights
reboot     - Restart the terminal (with style)
uptime     - Show system uptime
ps         - Show running processes
kill [pid] - Kill a process (fake)
whoami     - Enhanced user info`;
    }

    help += `

<span class="muted">💡 Tip: Try the Konami code (↑↑↓↓←→←→BA) for secret commands!</span>`;
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

  checkKonamiCode(event) {
    this.konamiCode.push(event.code);

    // Keep only the last 10 keys
    if (this.konamiCode.length > 10) {
      this.konamiCode.shift();
    }

    // Check if the sequence matches
    if (this.konamiCode.length === 10 &&
      this.konamiCode.every((key, index) => key === this.konamiSequence[index])) {
      event.preventDefault(); // Prevent the final "A" from being typed
      this.activateKonamiMode();
      this.konamiCode = []; // Reset
      return true; // Indicate Konami code was activated
    }
    return false;
  }

  activateKonamiMode() {
    // Clear the input prompt
    this.input.value = '';
    this.updateCursor();

    this.appendOutput('');
    this.appendOutput('<span class="success">🎉 KONAMI CODE ACTIVATED! 🎉</span>');
    this.appendOutput('<span class="highlight">You have unlocked secret developer mode!</span>');
    this.appendOutput('');
    this.appendOutput('<span class="info">Secret commands unlocked:</span>');
    this.appendOutput('<span class="muted">• matrix - Enter the Matrix</span>');
    this.appendOutput('<span class="muted">• god - Admin privileges activated</span>');
    this.appendOutput('<span class="muted">• secret - Hidden portfolio content</span>');
    this.appendOutput('');

    // Add secret commands
    this.commands.matrix = this.startMatrix.bind(this);
    this.commands.god = this.godMode.bind(this);
    this.commands.secret = this.showSecret.bind(this);
  }

  startMatrix() {
    this.appendOutput('Entering the Matrix...');

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: black;
      z-index: 1000;
      overflow: hidden;
      font-family: monospace;
    `;

    document.body.appendChild(overlay);

    // Matrix rain effect
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アカサタナハマヤラワガザダバパイキシチニヒミリギジヂビピウクスツヌフムユルグズブプエケセテネヘメレゲゼデベペオコソトノホモヨロゴゾドボポヲン';
    const matrix = [];
    const columns = Math.floor(window.innerWidth / 15);

    for (let i = 0; i < columns; i++) {
      matrix[i] = 0;
    }

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    overlay.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0F0';
    ctx.font = '15px monospace';

    let matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';

      for (let i = 0; i < matrix.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 15, matrix[i] * 15);

        if (matrix[i] * 15 > canvas.height && Math.random() > 0.975) {
          matrix[i] = 0;
        }
        matrix[i]++;
      }
    }, 50);

    // Exit on any key press or click
    const exitMatrix = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      clearInterval(matrixInterval);
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', exitMatrix, true);
      this.input.focus();
    };

    // Use capture phase to get the event before the terminal handler
    document.addEventListener('keydown', exitMatrix, true);
    overlay.addEventListener('click', exitMatrix);
  }

  godMode() {
    this.appendOutput('<span class="warning">🔓 GOD MODE ACTIVATED</span>');
    this.appendOutput('<span class="highlight">root@aasarod:~# Access Granted</span>');
    this.appendOutput('<span class="success">All systems unlocked. You now have admin privileges!</span>');
    this.appendOutput('');
    this.godModeActive = true;

    // Add god mode commands
    this.commands.hack = this.hackSequence.bind(this);
    this.commands.sudo = this.sudoCommand.bind(this);
    this.commands.reboot = this.rebootSystem.bind(this);
    this.commands.uptime = this.showUptime.bind(this);
    this.commands.ps = this.showProcesses.bind(this);
    this.commands.kill = this.killProcess.bind(this);
    this.commands.whoami = this.enhancedWhoami.bind(this);

    this.appendOutput('<span class="info">New commands available! Type "help" to see them.</span>');
  }

  showSecret() {
    this.appendOutput('<span class="info">🕵️ Secret Portfolio Content 🕵️</span>');
    this.appendOutput('');
    this.appendOutput('<span class="highlight">Hidden Skills:</span>');
    this.appendOutput('<span class="success">• Coffee Consumption: Expert Level ☕</span>');
    this.appendOutput('<span class="success">• Debugging at 3 AM: Professional</span>');
    this.appendOutput('<span class="success">• Stack Overflow Navigation: Master</span>');
    this.appendOutput('<span class="success">• Rubber Duck Debugging: Advanced</span>');
    this.appendOutput('<span class="success">• Googling Error Messages: Ninja Level</span>');
    this.appendOutput('');
    this.appendOutput('<span class="highlight">Secret Projects:</span>');
    this.appendOutput('<span class="aqua">• This Terminal Portfolio (you\'re using it!)</span>');
    this.appendOutput('<span class="aqua">• Konami Code Implementation (you found it!)</span>');
    this.appendOutput('<span class="aqua">• Secret Matrix Rain Effect</span>');
    this.appendOutput('<span class="aqua">• Fake God Mode System</span>');
    this.appendOutput('');
    this.appendOutput('<span class="highlight">Fun Facts:</span>');
    this.appendOutput('<span class="purple">• This terminal has exactly ' + Object.keys(this.commands).length + ' commands</span>');
    this.appendOutput('<span class="purple">• You\'ve typed ' + this.history.length + ' commands so far</span>');
    this.appendOutput('<span class="purple">• The snake game gets progressively faster</span>');
    this.appendOutput('<span class="purple">• There\'s ASCII art hidden in the code</span>');
    this.appendOutput('');
    this.appendOutput('<span class="muted">Thanks for exploring! 🎮 Keep being curious!</span>');
  }

  hackSequence() {
    this.appendOutput('<span class="warning">🔴 INITIATING HACK SEQUENCE...</span>');
    this.appendOutput('');

    const steps = [
      'Scanning network topology...',
      'Bypassing firewall protocols...',
      'Injecting SQL queries...',
      'Decrypting password hashes...',
      'Accessing mainframe database...',
      'Downloading classified files...',
      'Covering digital footprints...',
      'HACK COMPLETE ✓'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length - 1) {
        this.appendOutput(`<span class="muted">[${i + 1}/7] ${steps[i]}</span>`);
      } else {
        this.appendOutput(`<span class="success">${steps[i]}</span>`);
        this.appendOutput('<span class="highlight">Just kidding! This is completely fake 😄</span>');
        clearInterval(interval);
      }
      i++;
    }, 800);
  }

  sudoCommand(args) {
    if (!args.length) {
      this.appendOutput('<span class="error">sudo: usage: sudo [command]</span>');
      return;
    }

    const command = args.join(' ');
    this.appendOutput(`<span class="warning">[sudo] password for marius:</span> <span class="muted">**********</span>`);
    this.appendOutput(`<span class="success">✓ Executing with admin privileges: ${command}</span>`);
    this.appendOutput('<span class="highlight">Admin command executed successfully!</span>');
    this.appendOutput('<span class="muted">(Actually just pretending - no real sudo here!)</span>');
  }

  rebootSystem() {
    this.appendOutput('<span class="warning">🔄 SYSTEM REBOOT INITIATED</span>');
    this.appendOutput('<span class="muted">Stopping services...</span>');
    this.appendOutput('<span class="muted">Unmounting filesystems...</span>');
    this.appendOutput('<span class="muted">Shutting down...</span>');

    setTimeout(() => {
      this.clear();
      this.appendOutput('<span class="success">🖥️  SYSTEM RESTART COMPLETE</span>');
      this.appendOutput('<span class="highlight">Welcome back to AASAROD Terminal OS</span>');
      this.appendOutput('');
      this.showWelcome();
    }, 2000);
  }

  showUptime() {
    const now = new Date();
    const startTime = new Date(now.getTime() - Math.random() * 86400000); // Random uptime up to 1 day
    const uptime = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    this.appendOutput(`<span class="highlight">System uptime:</span> ${hours}h ${minutes}m`);
    this.appendOutput(`<span class="info">Load average:</span> 0.${Math.floor(Math.random() * 99)}, 0.${Math.floor(Math.random() * 99)}, 0.${Math.floor(Math.random() * 99)}`);
    this.appendOutput(`<span class="success">Users logged in:</span> 1 (you!)`);
  }

  showProcesses() {
    this.appendOutput('<span class="highlight">PID  COMMAND           CPU   MEM</span>');
    this.appendOutput('<span class="muted">───  ───────────────   ───   ───</span>');

    const processes = [
      { pid: 1, name: 'portfolio-kernel', cpu: '2.1%', mem: '15MB' },
      { pid: 42, name: 'terminal-emulator', cpu: '0.8%', mem: '8MB' },
      { pid: 101, name: 'snake-game-engine', cpu: '0.0%', mem: '2MB' },
      { pid: 256, name: 'matrix-renderer', cpu: '0.0%', mem: '1MB' },
      { pid: 512, name: 'konami-detector', cpu: '0.1%', mem: '0.5MB' },
      { pid: 1337, name: 'hacker-simulator', cpu: '99.9%', mem: '1337MB' }
    ];

    processes.forEach(proc => {
      this.appendOutput(`<span class="aqua">${proc.pid.toString().padEnd(4)}</span> <span class="success">${proc.name.padEnd(17)}</span> <span class="warning">${proc.cpu.padEnd(5)}</span> <span class="purple">${proc.mem}</span>`);
    });
  }

  killProcess(args) {
    if (!args.length) {
      this.appendOutput('<span class="error">kill: usage: kill [pid]</span>');
      return;
    }

    const pid = args[0];
    if (pid === '1337') {
      this.appendOutput('<span class="error">kill: cannot kill process 1337: Operation not permitted</span>');
      this.appendOutput('<span class="muted">Nice try! That process is protected 😉</span>');
    } else {
      this.appendOutput(`<span class="success">Process ${pid} terminated successfully</span>`);
      this.appendOutput('<span class="muted">(Fake process killed - no actual processes harmed!)</span>');
    }
  }

  enhancedWhoami() {
    this.appendOutput('<span class="highlight">Enhanced User Information:</span>');
    this.appendOutput('');
    this.appendOutput('<span class="success">Username:</span> marhaasa');
    this.appendOutput('<span class="success">Real Name:</span> Marius Høgli Aasarød');
    this.appendOutput('<span class="success">Role:</span> Data Wizard & Terminal Enthusiast');
    this.appendOutput('<span class="success">Access Level:</span> 🔓 GOD MODE ACTIVATED');
    this.appendOutput('<span class="success">Terminal Skills:</span> Expert');
    this.appendOutput('<span class="success">Konami Code Status:</span> ✓ Discovered');
    this.appendOutput('<span class="success">Secret Commands:</span> Unlocked');
    this.appendOutput('<span class="success">Coffee Level:</span> ☕☕☕ (High)');
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
