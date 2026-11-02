const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const pkgPath = path.join(rootDir, "package.json");
const publicVersionPath = path.join(rootDir, "public", "version.json");
const srcVersionPath = path.join(rootDir, "src", "version.js");

// 1. Read package.json version
let appVersion = "1.0.0";
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.version) {
    appVersion = pkg.version;
  }
} catch (e) {
  console.warn("Could not read package.json version, using fallback:", appVersion);
}

// 2. Generate timestamp and build code
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const yyyy = now.getFullYear();
const mm = pad(now.getMonth() + 1);
const dd = pad(now.getDate());
const hh = pad(now.getHours());
const min = pad(now.getMinutes());

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const monthStr = monthNames[now.getMonth()];

// Format 12-hour time with AM/PM
let hours12 = now.getHours();
const ampm = hours12 >= 12 ? "PM" : "AM";
hours12 = hours12 % 12;
hours12 = hours12 ? hours12 : 12; // 0 should be 12
const timeStr = `${pad(hours12)}:${min} ${ampm}`;

const buildCode = `${yyyy}${mm}${dd}.${hh}${min}`;
const buildDate = `${dd}-${monthStr}-${yyyy} ${timeStr}`;

// 3. Optional: Get git commit hash and branch
let gitCommit = "";
let gitBranch = "";
try {
  gitCommit = execSync("git rev-parse --short HEAD", {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
  gitBranch = execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch (e) {
  // git not available in environment
}

const versionData = {
  version: appVersion,
  buildCode: buildCode,
  buildDate: buildDate,
  gitCommit: gitCommit || undefined,
  gitBranch: gitBranch || undefined,
  timestamp: now.getTime(),
  appName: "OxyLoans Web",
};

// 4. Write public/version.json
try {
  fs.writeFileSync(
    publicVersionPath,
    JSON.stringify(versionData, null, 2) + "\n",
    "utf8"
  );
  console.log(`[Version Generator] Generated ${publicVersionPath} -> Build Code: ${buildCode}`);
} catch (e) {
  console.error("Failed to write public/version.json:", e);
}

// 5. Write src/version.js
const versionJsContent = `// Automatically generated during build - DO NOT EDIT MANUALLY
export const APP_VERSION = ${JSON.stringify(versionData, null, 2)};

export default APP_VERSION;
`;

try {
  fs.writeFileSync(srcVersionPath, versionJsContent, "utf8");
  console.log(`[Version Generator] Generated ${srcVersionPath} -> Build Code: ${buildCode}`);
} catch (e) {
  console.error("Failed to write src/version.js:", e);
}
