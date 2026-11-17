const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

async function captureLocal() {
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
    defaultViewport: { width: 1440, height: 950 }
  });

  const page = await browser.newPage();
  const url = 'http://localhost:3000';
  console.log('Navigating to:', url);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check if "Start GA Evolution" button exists and click it
  console.log('Finding and clicking Start GA Evolution button...');
  try {
    const started = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.textContent.includes('Start GA Evolution'));
      if (startBtn) {
        startBtn.click();
        return true;
      }
      return false;
    });
    console.log('Start button clicked:', started);

    // Wait 4-5 seconds for evolution to complete and UI to update
    console.log('Waiting for evolution to converge...');
    await new Promise(r => setTimeout(r, 4500));
  } catch (err) {
    console.error('Error clicking start button:', err);
  }

  // Screenshot 1: Dashboard with live metrics, controls, and convergence chart
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  const pathDashboard = path.join(outDir, '01_live_optimizer_dashboard.png');
  await page.screenshot({ path: pathDashboard });
  console.log('Saved Screenshot 1 (Dashboard):', pathDashboard);

  // Screenshot 2: Scroll to Timetable Matrix
  await page.evaluate(() => {
    const tableEl = document.querySelector('table') || document.querySelector('.grid');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
      window.scrollBy(0, 650);
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const pathTimetable = path.join(outDir, '02_timetable_grid.png');
  await page.screenshot({ path: pathTimetable });
  console.log('Saved Screenshot 2 (Timetable):', pathTimetable);

  // Screenshot 3: Switch to Operator Visualizer Tab
  console.log('Navigating to Operator Visualizer...');
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const visBtn = buttons.find(b => b.textContent.includes('Operator Visualizer'));
      if (visBtn) visBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    const pathVisualizer = path.join(outDir, '03_operator_visualizer.png');
    await page.screenshot({ path: pathVisualizer });
    console.log('Saved Screenshot 3 (Visualizer Overview):', pathVisualizer);

    // Screenshot 4: Click Stage 2 - Tournament Selection
    console.log('Clicking Stage 2 Tournament Selection...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const selBtn = buttons.find(b => b.textContent.includes('Tournament Selection'));
      if (selBtn) selBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const pathSelection = path.join(outDir, '04_tournament_selection.png');
    await page.screenshot({ path: pathSelection });
    console.log('Saved Screenshot 4 (Tournament Selection):', pathSelection);
  } catch (err) {
    console.error('Visualizer navigation error:', err);
  }

  await browser.close();
  console.log('All 4 real local screenshots captured successfully!');
}

captureLocal().catch(err => {
  console.error('CaptureLocal failed:', err);
  process.exit(1);
});
