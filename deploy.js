// deploy.js

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";

const config = {
  mainBranch: "main",
  productionBranch: "production",
};

function runCommand(command, message) {
  console.log(`\n⏳ ${message}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Gagal saat menjalankan: ${command}`);
    throw error;
  }
}


// --- Proses Utama Deployment ---
try {
  console.log("🚀 Memulai proses deployment...");

  runCommand(
    `git checkout --orphan ${config.productionBranch}`,
    "Membuat branch 'production' baru..."
  );

  runCommand(
    "npm run build",
    "Menjalankan build project..."
  );

  // --- SOLUSI: Tentukan nama folder SETELAH build selesai ---
  const buildDir = existsSync("dist") ? "dist" : "build";
  console.log(`✅ Build selesai. Folder output terdeteksi: '${buildDir}'`);


  runCommand(
    `git --work-tree ${buildDir} add --all`, // Gunakan variabel 'buildDir' yang baru
    `Menambahkan semua file dari folder '${buildDir}'...`
  );

  const commitMessage = `"Deploy to production: ${new Date().toISOString()}"`;
  runCommand(
    `git --work-tree ${buildDir} commit -m ${commitMessage}`,
    "Membuat commit untuk production..."
  );

  runCommand(
    `git push origin HEAD:${config.productionBranch} --force`,
    "Mendorong (push) ke branch 'production' di remote..."
  );

  console.log("\n🧹 Membersihkan sisa proses...");
  rmSync(buildDir, { recursive: true, force: true }); // Gunakan variabel 'buildDir' yang baru

  runCommand(
    `git checkout -f ${config.mainBranch}`,
    `Kembali ke branch '${config.mainBranch}'...`
  );

  runCommand(
    `git branch -D ${config.productionBranch}`,
    `Menghapus branch 'production' lokal...`
  );

  console.log("\n\n✅ Deployment berhasil!");

} catch (e) {
  console.error("\n\n❌ Terjadi kesalahan selama deployment!");
  console.error(e);
  process.exit(1);
}