import { spawnSync } from "node:child_process";
import { platform } from "node:process";

const repoMatch = "cut-above";

if (platform === "win32") {
  const psCommand = [
    "$procs = @(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match '" +
      repoMatch +
      "' })",
    "if ($procs.Count -eq 0) { Write-Host 'No matching dev processes found.'; exit 0 }",
    "$procs | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
    'Write-Host ("Stopped " + $procs.Count + " process(es).")',
  ].join("; ");

  const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", psCommand], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
} else {
  const result = spawnSync("pkill", ["-f", repoMatch], { stdio: "inherit" });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status === 1) {
    console.log("No matching dev processes found.");
    process.exit(0);
  }

  if (result.status === 0) {
    console.log("Stopped matching dev processes.");
  }

  process.exit(result.status ?? 0);
}
