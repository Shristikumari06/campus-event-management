/**
 * Automated GitHub Repository Creator & File Uploader
 * Uses GitHub REST API to:
 * 1. Create repository under user's GitHub account (if not already existing)
 * 2. Upload all project code files directly to the repository (no git binary required)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const GITHUB_USERNAME = 'Shristikumari06';
const DEFAULT_REPO_NAME = 'campus-event-management';

const IGNORED_DIRS = new Set(['node_modules', '.git']);
const IGNORED_FILES = new Set(['cloudflared.exe', 'CampusConnect_Project_Submission.zip', 'campusconnect-live.zip']);
const IGNORED_EXTS = new Set(['.db', '.sqlite', '.sqlite3', '.zip']);

function getAllProjectFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        files = files.concat(getAllProjectFiles(fullPath, baseDir));
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IGNORED_FILES.has(entry.name) && !IGNORED_EXTS.has(ext)) {
        files.push({ fullPath, relPath });
      }
    }
  }

  return files;
}

async function githubRequest(url, method, token, body = null) {
  const headers = {
    'User-Agent': 'CampusConnect-Uploader',
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  const options = { method, headers };
  if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log('========================================================');
  console.log('  CampusConnect -> GitHub Automated Uploader');
  console.log(`  Target Account: https://github.com/${GITHUB_USERNAME}`);
  console.log('========================================================\n');

  let token = process.argv[2] || process.env.GITHUB_TOKEN;

  if (!token) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    token = await new Promise((resolve) => {
      rl.question('Paste your GitHub Personal Access Token (classic with "repo" scope):\n> ', (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    });
  }

  if (!token) {
    console.error('❌ Error: GitHub Token is required.');
    console.log('\nTo generate a token:');
    console.log('1. Open: https://github.com/settings/tokens/new');
    console.log('2. Set Note: "CampusConnect Upload"');
    console.log('3. Check the "repo" scope (Full control of private repositories)');
    console.log('4. Click "Generate token", copy it, and re-run:');
    console.log('   node github-upload.js <YOUR_TOKEN>\n');
    process.exit(1);
  }

  const repoName = process.argv[3] || DEFAULT_REPO_NAME;

  console.log(`\n🔍 Checking repository "${repoName}" on https://github.com/${GITHUB_USERNAME}...`);
  const checkRes = await githubRequest(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`, 'GET', token);

  if (checkRes.status === 404) {
    console.log(`🚀 Creating new repository: https://github.com/${GITHUB_USERNAME}/${repoName}...`);
    const createRes = await githubRequest('https://api.github.com/user/repos', 'POST', token, {
      name: repoName,
      description: 'Campus Event Management & Registration Portal — Full Stack Node.js, Express & SQLite',
      private: false,
      auto_init: false
    });

    if (!createRes.ok) {
      console.error('❌ Failed to create repository:', createRes.data);
      process.exit(1);
    }
    console.log('✅ Repository created successfully!');
  } else if (checkRes.ok) {
    console.log('ℹ️ Repository already exists. Proceeding with file upload...');
  } else {
    console.error('❌ Error communicating with GitHub:', checkRes.data);
    process.exit(1);
  }

  // Scan files
  const rootDir = __dirname;
  const files = getAllProjectFiles(rootDir);
  console.log(`\n📦 Found ${files.length} project files to upload.\n`);

  let uploadedCount = 0;
  for (const file of files) {
    const contentBuffer = fs.readFileSync(file.fullPath);
    const contentBase64 = contentBuffer.toString('base64');

    // Check if file exists to get its SHA (required for updates)
    const fileCheck = await githubRequest(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${file.relPath}`,
      'GET',
      token
    );

    const putBody = {
      message: `Add ${file.relPath}`,
      content: contentBase64
    };

    if (fileCheck.ok && fileCheck.data && fileCheck.data.sha) {
      putBody.sha = fileCheck.data.sha;
      putBody.message = `Update ${file.relPath}`;
    }

    const uploadRes = await githubRequest(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${file.relPath}`,
      'PUT',
      token,
      putBody
    );

    if (uploadRes.ok) {
      uploadedCount++;
      console.log(`✅ [${uploadedCount}/${files.length}] Uploaded: ${file.relPath}`);
    } else {
      console.warn(`⚠️ Failed to upload ${file.relPath}:`, uploadRes.data && uploadRes.data.message);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 UPLOAD COMPLETE!');
  console.log(`🔗 Repository URL: https://github.com/${GITHUB_USERNAME}/${repoName}`);
  console.log('========================================================\n');
}

main().catch(console.error);

