const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'restart.log');
const APP_START_COMMAND = 'npm run start';
const PORT_RANGE = { start: 3000, end: 3010 };

function log(message) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_PATH, fullMessage);
  console.log(fullMessage);
}

function getPIDonPort(port) {
  try {
    const stdout = execSync(`lsof -i :${port} -t || netstat -ano | findstr :${port}`);
    const lines = stdout.toString().split('\n').filter(line => line.trim() !== '');
    const pidLine = lines[0];

    if (!pidLine) return null;

    const pid = pidLine.match(/\d+/)?.[0];
    return pid || null;
  } catch {
    return null;
  }
}

function killPID(pid) {
  try {
    process.kill(pid, 'SIGKILL');
    log(`Killed process with PID ${pid}`);
  } catch (error) {
    log(`Failed to kill PID ${pid}: ${error.message}`);
  }
}

function restartApp() {
  log('Starting the app...');
  const child = spawn('npm', ['run', 'start'], {
    cwd: __dirname,
    detached: true,
    stdio: ['ignore', fs.openSync(LOG_PATH, 'a'), fs.openSync(LOG_PATH, 'a')],
  });

  child.unref();
  log(`App restarted with new PID: ${child.pid}`);
}

// Main execution
(async () => {
  log(`\n=== Restart script started ===`);

  for (let port = PORT_RANGE.start; port <= PORT_RANGE.end; port++) {
    const pid = getPIDonPort(port);
    if (pid) {
      log(`Port ${port} is occupied by PID ${pid}`);
      killPID(pid);
    } else {
      log(`Port ${port} is free`);
    }
  }

  restartApp();
})();
