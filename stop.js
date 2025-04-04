const { exec } = require("child_process");

exec("lsof -i :3000 | awk 'NR>1 {print $2}'", (err, stdout, stderr) => {
  if (err || stderr) {
    console.error("Error finding process:", err || stderr);
    process.exit(1);
  }

  const pid = stdout.trim();
  if (!pid) {
    console.log("No process found on port 3000.");
    process.exit(0);
  }

  console.log(`Killing process on port 3000 (PID: ${pid})`);
  exec(`kill -9 ${pid}`, (killErr, killStdout, killStderr) => {
    if (killErr || killStderr) {
      console.error("Error killing process:", killErr || killStderr);
      process.exit(1);
    }
    console.log("Process killed successfully.");
    process.exit(0);
  });
});
