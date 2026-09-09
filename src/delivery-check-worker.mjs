// A separate supervisor survives coordinator death. IPC disconnect and the local
// deadline terminate only this owned POSIX process group, including test children.
import { spawn } from "node:child_process";

if (process.argv[2] === "--supervise") {
  const timeout = Number(process.argv[3]);
  const tests = process.argv.slice(4);
  if (!process.send || !Number.isSafeInteger(timeout) || timeout < 100 || timeout > 300000 || !tests.length) process.exit(2);
  const terminate = () => { try { process.kill(-process.pid, "SIGKILL"); } catch { process.exit(2); } };
  process.once("disconnect", terminate);
  const timer = setTimeout(terminate, timeout + 3000);
  let started = false;
  process.on("message", message => {
    if (started || message?.action !== "start") return;
    started = true;
    const child = message.confined
      ? spawn(message.confined.command, message.confined.args, { env: message.confined.env, stdio: ["ignore", "inherit", "inherit"] })
      : spawn(process.execPath, ["--test", "--test-reporter=tap", `--test-timeout=${timeout}`, ...tests], { stdio: ["ignore", "inherit", "inherit"] });
    child.once("error", () => { clearTimeout(timer); process.exit(2); });
    child.once("exit", code => { clearTimeout(timer); process.exit(code ?? 1); });
  });
}
