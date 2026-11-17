const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

async function capture() {
  const edgePath = EDGE_PATHS.find(p => fs.existsSync(p));
  if (!edgePath) {
    console.error('Edge executable not found.');
    process.exit(1);
  }

  const outDir = path.join(__dirname, 'report_images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Launching browser with Edge:', edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const url = 'https://frontend-azure-kappa-xbtipqbzto.vercel.app';
  console.log('Navigating to:', url);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.log('Navigation networkidle2 timed out, continuing...', e.message);
  }

  await new Promise(r => setTimeout(r, 2000));

  // 1. Live Optimizer Dashboard Screenshot
  const pathDashboard = path.join(outDir, '01_live_optimizer_dashboard.png');
  await page.screenshot({ path: pathDashboard, fullPage: false });
  console.log('Saved:', pathDashboard);

  // Scroll down to capture Timetable Grid
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  const pathTimetable = path.join(outDir, '02_timetable_grid.png');
  await page.screenshot({ path: pathTimetable, fullPage: false });
  console.log('Saved:', pathTimetable);

  // 2. Click Operator Visualizer tab
  console.log('Clicking Operator Visualizer tab...');
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const visBtn = buttons.find(b => b.textContent.includes('Operator Visualizer'));
      if (visBtn) visBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1000));

    const pathVisualizer = path.join(outDir, '03_operator_visualizer.png');
    await page.screenshot({ path: pathVisualizer, fullPage: false });
    console.log('Saved:', pathVisualizer);

    // Click Stage 2: Tournament Selection
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const selBtn = buttons.find(b => b.textContent.includes('Tournament Selection'));
      if (selBtn) selBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    const pathSelection = path.join(outDir, '04_tournament_selection.png');
    await page.screenshot({ path: pathSelection, fullPage: false });
    console.log('Saved:', pathSelection);

  } catch (err) {
    console.error('Visualizer tab click error:', err);
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch(err => {
  console.error('Capture script error:', err);
  process.exit(1);
});
