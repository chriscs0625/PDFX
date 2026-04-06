import { spawn } from "node:child_process";

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || "3000";
const isWindows = process.platform === "win32";
const npxCommand = isWindows ? "npx.cmd" : "npx";

function spawnNpx(args, options = {}) {
  if (isWindows) {
    return spawn("cmd.exe", ["/d", "/s", "/c", `${npxCommand} ${args.join(" ")}`], {
      shell: false,
      ...options,
    });
  }

  return spawn(npxCommand, args, {
    shell: false,
    ...options,
  });
}

function runProcess(args, options = {}) {
  return new Promise((resolve) => {
    const child = spawnNpx(args, {
      stdio: "inherit",
      ...options,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        resolve(1);
        return;
      }
      resolve(code ?? 0);
    });

    child.on("error", () => resolve(1));
  });
}

const prismaExitCode = await runProcess(["prisma", "generate"]);
if (prismaExitCode !== 0) {
  console.error("Failed to generate Prisma client. Aborting dev server startup.");
  process.exit(prismaExitCode);
}

const nextDev = spawnNpx(["next", "dev", "--hostname", host, "--port", port], {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

let startupMessagePrinted = false;
nextDev.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  if (!startupMessagePrinted && text.includes("Ready in")) {
    console.log(`Server running on http://localhost:${port}`);
    startupMessagePrinted = true;
  }
});

nextDev.stderr.on("data", (chunk) => {
  process.stderr.write(chunk.toString());
});

const forwardSignal = (signal) => {
  if (!nextDev.killed) {
    nextDev.kill(signal);
  }
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

nextDev.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
    return;
  }
  process.exit(code ?? 0);
});
