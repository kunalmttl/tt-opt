const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

async function captureSpecialized() {
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

  // 1. Screenshot of Scenario Editor Drawer
  console.log('Opening Scenario Editor drawer...');
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const editBtn = buttons.find(b => b.textContent.includes('Scenario Editor'));
      if (editBtn) editBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    const pathScenario = path.join(outDir, '01_scenario_editor_drawer.png');
    await page.screenshot({ path: pathScenario });
    console.log('Saved 01_scenario_editor_drawer.png');

    // Close the drawer by clicking close button or pressing Escape
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 1000));
  } catch (err) {
    console.error('Scenario editor capture error:', err);
  }

  // 2. Initial state before convergence (Fresh initial parameters)
  console.log('Capturing initial state before convergence...');
  const pathInitial = path.join(outDir, '02_initial_state_before_convergence.png');
  await page.screenshot({ path: pathInitial });
  console.log('Saved 02_initial_state_before_convergence.png');

  // 3. Start Evolution and wait for convergence
  console.log('Starting GA Evolution...');
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.textContent.includes('Start GA Evolution'));
      if (startBtn) startBtn.click();
    });
    console.log('Waiting for evolution to finish...');
    await new Promise(r => setTimeout(r, 4500));
  } catch (e) {
    console.error('Start evolution error:', e);
  }

  // 4. Dashboard after convergence
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  const pathDashboard = path.join(outDir, '03_dashboard_after_convergence.png');
  await page.screenshot({ path: pathDashboard });
  console.log('Saved 03_dashboard_after_convergence.png');

  // 5. Final Timetable Grid after convergence
  console.log('Scrolling to final timetable grid...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h3, h2, span, div'));
    const matrixEl = headings.find(el => el.textContent.includes('Weekly Class Schedule Matrix'));
    if (matrixEl) {
      matrixEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo(0, 800);
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const pathFinalTimetable = path.join(outDir, '04_final_timetable_after_convergence.png');
  await page.screenshot({ path: pathFinalTimetable });
  console.log('Saved 04_final_timetable_after_convergence.png');

  // 6. Operator Visualizer Tab (Initial Chromosome vs Repaired Timetable)
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

    const pathVisualizer = path.join(outDir, '05_visualizer_encoding_initial_sample.png');
    await page.screenshot({ path: pathVisualizer });
    console.log('Saved 05_visualizer_encoding_initial_sample.png');

    // Click Stage 5: Constraint Repair to show before vs after conflicts
    console.log('Clicking Stage 5 Constraint Repair...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const repBtn = buttons.find(b => b.textContent.includes('Constraint Repair'));
      if (repBtn) repBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    const pathRepair = path.join(outDir, '06_visualizer_constraint_repair_before_after.png');
    await page.screenshot({ path: pathRepair });
    console.log('Saved 06_visualizer_constraint_repair_before_after.png');

  } catch (err) {
    console.error('Visualizer capture error:', err);
  }

  await browser.close();
  console.log('All specialized screenshots captured successfully!');
}

captureSpecialized().catch(e => {
  console.error('Specialized capture failed:', e);
  process.exit(1);
});
