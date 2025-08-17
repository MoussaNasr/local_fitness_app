/*
 * Hybrid Strength Planner – Simple demo
 *
 * This script powers a lightweight training planner tailored for soccer/boxing striking and BJJ/wrestling.
 * Users can enter their estimated 1‑rep maxes, choose units and equipment mode,
 * and view a simplified 12‑week program. A basic log interface lets
 * users record workouts which persist via localStorage.
 */

// Select navigation elements
const navSetup = document.getElementById('navSetup');
const navPlan = document.getElementById('navPlan');
const navLog = document.getElementById('navLog');

// Select sections
const setupSection = document.getElementById('setup');
const planSection = document.getElementById('plan');
const logSection = document.getElementById('log');

// Settings form elements
const legPressInput = document.getElementById('legPress1rm');
const chestPressInput = document.getElementById('chestPress1rm');
const unitsSelect = document.getElementById('units');
const modeSelect = document.getElementById('mode');
const saveButton = document.getElementById('saveSettings');
const setupStatus = document.getElementById('setupStatus');
const equipmentList = document.getElementById('equipmentList');
const equipSelectAll = document.getElementById('equipSelectAll');
const equipClearAll = document.getElementById('equipClearAll');

// Top controls
const btnTheme = document.getElementById('btnTheme');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const importFile = document.getElementById('importFile');

// Containers for plan and log
const planContent = document.getElementById('planContent');
const logContent = document.getElementById('logContent');
const progressCanvas = document.getElementById('progressChart');
const weekRange = document.getElementById('weekRange');
const btnExpandWeeks = document.getElementById('btnExpandWeeks');
const btnCollapseWeeks = document.getElementById('btnCollapseWeeks');
const btnExpandLogWeeks = document.getElementById('btnExpandLogWeeks');
const btnCollapseLogWeeks = document.getElementById('btnCollapseLogWeeks');

// Tools elements
const calcReps = document.getElementById('calcReps');
const calcWeight = document.getElementById('calcWeight');
const btnCalc1RM = document.getElementById('btnCalc1RM');
const calc1RMResult = document.getElementById('calc1RMResult');

const plateTarget = document.getElementById('plateTarget');
const barWeight = document.getElementById('barWeight');
const availablePlates = document.getElementById('availablePlates');
const btnCalcPlates = document.getElementById('btnCalcPlates');
const plateResult = document.getElementById('plateResult');

const timerMinutes = document.getElementById('timerMinutes');
const timerDisplay = document.getElementById('timerDisplay');
const btnTimerStart = document.getElementById('btnTimerStart');
const btnTimerStop = document.getElementById('btnTimerStop');
const btnTimerReset = document.getElementById('btnTimerReset');
const presetTimerButtons = () => Array.from(document.querySelectorAll('.preset-timer'));

// Modal (optional utilities)
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

// LocalStorage keys
const SETTINGS_KEY = 'hybridStrengthSettings';
const LOG_KEY_PREFIX = 'hybridStrengthLog_';
const THEME_KEY = 'hybridTheme';
const EXERCISE_MAP_KEY = 'hybridExerciseReplacements';
const EQUIPMENT_KEY = 'hybridAvailableEquipment';
let planReplaceBound = false;

// Replacement catalog: per movement key, provide options with machine labels
const REPLACEMENTS = {
  K_LOWER_PRIMARY: [
  { name: 'Leg Press', machine: 'Leg Press' },
  { name: 'Hack Squat', machine: 'Hack Squat', adjust: { reps: 6 } },
  { name: 'Back Squat (Barbell)', machine: 'Squat Rack' },
  { name: 'Goblet Squat (DB)', machine: 'Dumbbells', adjust: { reps: 8 } },
  ],
  K_LOWER_UNILATERAL: [
  { name: 'Single-Leg Leg Press', machine: 'Leg Press' },
  { name: 'Bulgarian Split Squat', machine: 'Dumbbells' },
  { name: 'Walking Lunges', machine: 'Dumbbells', adjust: { reps: 10 } },
  ],
  K_PLYO: [
    { name: 'Box/Vertical Jumps', machine: 'Plyo Box / Space' },
    { name: 'Jump Rope', machine: 'Rope' },
  ],
  K_UPPER_PRESS: [
  { name: 'Chest Press', machine: 'Chest Press Machine', adjust: { percentDelta: -0.05 } },
  { name: 'Bench Press', machine: 'Bench + Barbell' },
  { name: 'Dumbbell Bench Press', machine: 'Bench + Dumbbells', adjust: { percentDelta: -0.1, reps: 8 } },
  { name: 'Push-Ups', machine: 'Bodyweight', adjust: { reps: 12, cue: 'Bodyweight / RIR 2-3' } },
  ],
  K_SHOULDER_PRESS: [
  { name: 'Overhead Press', machine: 'Barbell' },
  { name: 'Dumbbell Shoulder Press', machine: 'Dumbbells', adjust: { reps: 8 } },
  { name: 'Pike Push-Ups', machine: 'Bodyweight', adjust: { reps: 10, cue: 'Bodyweight / RIR 2-3' } },
  { name: 'Machine Shoulder Press', machine: 'Shoulder Press Machine', adjust: { percentDelta: -0.05, reps: 8 } },
  ],
  K_ROW: [
    { name: 'Bodyweight Rows', machine: 'Smith Machine / Bar' },
    { name: 'Barbell Row', machine: 'Barbell' },
    { name: 'Dumbbell Row', machine: 'Bench + Dumbbells' },
  { name: 'Cable Row', machine: 'Cable Row Machine', adjust: { reps: 10 } },
  ],
  K_CARRIES: [
    { name: 'Loaded Carries', machine: 'Farmer Handles / Dumbbells' },
    { name: 'Suitcase Carry', machine: 'Dumbbells' },
    { name: 'Trap Bar Carry', machine: 'Trap Bar' },
  ],
  K_STRIKE: [
    { name: 'Shadow Boxing / Bag Rounds', machine: 'Heavy Bag / Open Space' },
    { name: 'Assault Bike Intervals', machine: 'Air Bike' },
    { name: 'Row Erg Intervals', machine: 'Row Erg' },
  ],
  K_SPRINT: [
    { name: 'Hill / Stair Sprints', machine: 'Hill/Stairs' },
    { name: 'Treadmill Sprints', machine: 'Treadmill' },
    { name: 'Bike Sprints', machine: 'Spin Bike' },
  ],
  K_HINGE: [
    { name: 'Deadlift', machine: 'Barbell' },
    { name: 'Hip Thrust (Bodyweight)', machine: 'Bench / Bodyweight', adjust: { reps: 12, cue: 'Bodyweight / RIR 2-3', percentDelta: 0 } },
    { name: 'Hip Thrust (Barbell)', machine: 'Barbell + Bench', adjust: { reps: 8 } },
    { name: 'Kettlebell Swings', machine: 'Kettlebell', adjust: { reps: 12 } },
  ],
  K_LOWER_SECONDARY: [
    { name: 'Front Squat', machine: 'Barbell' },
    { name: 'Rear Foot Elevated Split Squat', machine: 'Dumbbells', adjust: { reps: 10 } },
    { name: 'Leg Extension', machine: 'Leg Extension Machine', adjust: { reps: 12 } },
  ],
};

// Preserve open weeks across re-render
function getOpenWeeksSet(){
  const set = new Set();
  planContent.querySelectorAll('details[open][data-week]').forEach(d=>{
    const w = parseInt(d.getAttribute('data-week')||'');
    if (!isNaN(w)) set.add(w);
  });
  return set;
}

// Compute adjusted sets/reps/percent/cue based on replacement
function computeAdjusted(exercise, selectedName){
  const key = exercise.key || exercise.name;
  const opts = REPLACEMENTS[key] || [];
  const found = opts.find(o=>o.name===selectedName);
  const adj = (found && found.adjust) || {};
  const sets = adj.sets != null ? adj.sets : exercise.sets;
  const reps = adj.reps != null ? adj.reps : exercise.reps;
  const percent = adj.percentDelta != null ? Math.max(0, (exercise.percent || 0) + adj.percentDelta) : exercise.percent;
  const cue = adj.cue;
  return { sets, reps, percent, cue };
}

function loadExerciseMap(){
  try { return JSON.parse(localStorage.getItem(EXERCISE_MAP_KEY) || '{}'); } catch { return {}; }
}
function saveExerciseMap(map){ localStorage.setItem(EXERCISE_MAP_KEY, JSON.stringify(map)); }
function getSelectedExerciseName(key, fallback){
  const map = loadExerciseMap();
  return map[key] || fallback;
}
function getMachineForName(name, key){
  const opts = REPLACEMENTS[key] || [];
  const found = opts.find(o => o.name === name);
  return found ? found.machine : 'N/A';
}

// Equipment management
const EQUIPMENT = [
  'Leg Press','Hack Squat','Squat Rack','Dumbbells','Plyo Box / Space','Rope',
  'Chest Press Machine','Bench + Barbell','Bench + Dumbbells','Bodyweight',
  'Barbell','Shoulder Press Machine','Smith Machine / Bar','Cable Row Machine',
  'Farmer Handles / Dumbbells','Trap Bar','Heavy Bag / Open Space','Air Bike','Row Erg',
  'Hill/Stairs','Treadmill','Spin Bike','Bench / Bodyweight','Barbell + Bench','Kettlebell'
];
function loadEquipment(){ try { return JSON.parse(localStorage.getItem(EQUIPMENT_KEY) || '[]'); } catch { return []; } }
function saveEquipment(list){ localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(list)); }
function hasEquipment(machine){
  const avail = new Set(loadEquipment());
  return avail.has(machine);
}
function renderEquipmentUI(){
  if (!equipmentList) return;
  const selected = new Set(loadEquipment());
  equipmentList.innerHTML = '';
  EQUIPMENT.forEach(m => {
    const id = 'eq_' + m.replace(/[^a-z0-9]+/gi,'_');
    const wrap = document.createElement('label');
    wrap.className = 'card';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '10px';
    wrap.innerHTML = `<input type="checkbox" id="${id}"> <span>${m}</span>`;
    const cb = wrap.querySelector('input');
    cb.checked = selected.has(m);
    cb.addEventListener('change', ()=>{
      const current = new Set(loadEquipment());
      if (cb.checked) current.add(m); else current.delete(m);
      saveEquipment([...current]);
    });
    equipmentList.appendChild(wrap);
  });
  if (equipSelectAll) equipSelectAll.onclick = ()=>{ saveEquipment([...EQUIPMENT]); renderEquipmentUI(); };
  if (equipClearAll) equipClearAll.onclick = ()=>{ saveEquipment([]); renderEquipmentUI(); };
}

/**
 * Display one section and hide the others.
 * @param {string} section - 'setup', 'plan' or 'log'
 */
function showSection(section) {
  // Remove active states from nav links
  [navSetup, navPlan, navLog].forEach(el => el.classList.remove('active'));
  // Hide all sections
  setupSection.classList.add('hidden');
  planSection.classList.add('hidden');
  logSection.classList.add('hidden');
  switch (section) {
    case 'setup':
      setupSection.classList.remove('hidden');
      navSetup.classList.add('active');
      break;
    case 'plan':
      planSection.classList.remove('hidden');
      navPlan.classList.add('active');
      break;
    case 'log':
      logSection.classList.remove('hidden');
      navLog.classList.add('active');
      break;
  }
}

/**
 * Load saved settings from localStorage and populate the form.
 */
function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;
  try {
    const settings = JSON.parse(raw);
    if (settings.legPress1rm != null) legPressInput.value = settings.legPress1rm;
    if (settings.chestPress1rm != null) chestPressInput.value = settings.chestPress1rm;
    if (settings.units) unitsSelect.value = settings.units;
    if (settings.mode) modeSelect.value = settings.mode;
  } catch (e) {
    console.error('Failed to parse settings:', e);
  }
}

/**
 * Save current settings to localStorage and rebuild plan and log.
 */
function saveSettings() {
  const settings = {
    legPress1rm: parseFloat(legPressInput.value) || 0,
    chestPress1rm: parseFloat(chestPressInput.value) || 0,
    units: unitsSelect.value,
    mode: modeSelect.value,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  setupStatus.textContent = 'Settings saved!';
  // Refresh plan and log
  renderPlan(settings);
  renderLog(settings);
  renderProgressChart();
}

/**
 * Utility to round a number to the nearest increment.
 * @param {number} value
 * @param {number} increment
 */
function roundToIncrement(value, increment) {
  return Math.round(value / increment) * increment;
}

/**
 * Build plan HTML based on current settings and inject into DOM.
 * @param {object} settings
 */
function inSelectedRange(week) {
  if (!weekRange || !weekRange.value || weekRange.value === 'all') return true;
  const [a,b] = weekRange.value.split('-').map(n=>parseInt(n));
  return week >= a && week <= b;
}

function renderPlan(settings, options = {}) {
  // Remove any previous content
  planContent.innerHTML = '';

  // Compute training maxes
  const legTM = settings.legPress1rm * 0.9;
  const chestTM = settings.chestPress1rm * 0.9;
  const isMachine = settings.mode === 'machine';
  const availSet = new Set(loadEquipment());

  // Helper to get weight string or RIR notes
  function formatWeight(tm, percent) {
    if (isMachine) {
      // For machines/bodyweight we provide RIR cues instead of weight.
      const rir = percent >= 0.85 ? 1 : percent >= 0.75 ? 2 : 3;
      return `RIR ${rir}`;
    }
    // Convert to chosen unit
    let weight = tm * percent;
    if (settings.units === 'lb') {
      // Convert kg to lb
      weight = weight * 2.20462;
      // Round to nearest 5 lb
      weight = roundToIncrement(weight, 5);
      return `${weight.toFixed(0)} lb`;
    } else {
      // kg, round to nearest 2.5kg
      weight = roundToIncrement(weight, 2.5);
      return `${weight.toFixed(1)} kg`;
    }
  }

  // Plan definition: 4 days repeated weekly for 12 weeks.
  const days = [
    {
      name: 'Day 1 – Lower Body Power',
      exercises: [
        { key: 'K_LOWER_PRIMARY', name: isMachine ? 'Leg Press' : 'Back Squat (Barbell)', sets: 5, reps: 5, percent: 0.85, primary: 'leg' },
        { key: 'K_LOWER_UNILATERAL', name: isMachine ? 'Single-Leg Leg Press' : 'Bulgarian Split Squat', sets: 3, reps: 8, percent: 0.75, primary: 'leg' },
        { key: 'K_PLYO', name: 'Box/Vertical Jumps', sets: 4, reps: 6, percent: 0.50, primary: null },
      ],
    },
    {
      name: 'Day 2 – Upper Push & Pull',
      exercises: [
        { key: 'K_UPPER_PRESS', name: isMachine ? 'Chest Press' : 'Bench Press', sets: 5, reps: 5, percent: 0.85, primary: 'chest' },
        { key: 'K_SHOULDER_PRESS', name: isMachine ? 'Pike Push-Ups' : 'Overhead Press', sets: 3, reps: 8, percent: 0.75, primary: 'chest' },
        { key: 'K_ROW', name: 'Bodyweight Rows', sets: 4, reps: 8, percent: 0.50, primary: null },
        { key: 'K_CARRIES', name: 'Loaded Carries', sets: 4, reps: 1, percent: 0.60, primary: null },
      ],
    },
    {
      name: 'Day 3 – Explosive & Conditioning',
      exercises: [
        { key: 'K_PLYO', name: 'Jump Series', sets: 5, reps: 3, percent: 0.50, primary: null },
        { key: 'K_STRIKE', name: 'Shadow Boxing / Bag Rounds', sets: 6, reps: 2, percent: 0.50, primary: null },
        { key: 'K_SPRINT', name: 'Hill / Stair Sprints', sets: 8, reps: 1, percent: 0.50, primary: null },
      ],
    },
    {
      name: 'Day 4 – Mixed Strength & Stability',
      exercises: [
        { key: 'K_HINGE', name: isMachine ? 'Hip Thrust (Bodyweight)' : 'Deadlift', sets: 4, reps: 6, percent: 0.80, primary: 'leg' },
        { key: 'K_LOWER_SECONDARY', name: isMachine ? 'Rear Foot Elevated Split Squat' : 'Front Squat', sets: 4, reps: 8, percent: 0.75, primary: 'leg' },
        { key: 'K_UPPER_PRESS', name: 'Push-Ups / Incline Press', sets: 3, reps: 10, percent: 0.70, primary: 'chest' },
        { key: 'K_ROW', name: 'Towel/Sheet Rows', sets: 4, reps: 8, percent: 0.50, primary: null },
      ],
    },
  ];

  for (let week = 1; week <= 12; week++) {
    if (!inSelectedRange(week)) continue;
    const details = document.createElement('details');
    details.dataset.week = String(week);
    details.open = !!(options.openWeeks && options.openWeeks.has(week));
    const summary = document.createElement('summary');
    summary.innerHTML = `<span class="summary-title">Week ${week}</span>`;
    details.appendChild(summary);
    const inner = document.createElement('div');
    inner.className = 'details-inner';
    let html = '<table><thead><tr><th>Day</th><th>Exercise</th><th>Machine</th><th>Sets × Reps</th><th>Load / Cue</th><th>Replace</th></tr></thead><tbody>';
    days.forEach((day) => {
      day.exercises.forEach((exercise, exIdx) => {
        // Auto-pick best exercise based on availability if user hasn't overridden
        const map = loadExerciseMap();
        const eKey = exercise.key || exercise.name;
        let currentName = map[eKey];
        if (!currentName) {
          const opts = REPLACEMENTS[eKey] || [{ name: exercise.name, machine: getMachineForName(exercise.name, eKey) }];
          const preferred = opts.find(o=> availSet.has(o.machine)) || opts[0];
          currentName = preferred.name;
        }
        const machine = getMachineForName(currentName, eKey);
        const dayNameCell = exIdx === 0 ? `<td rowspan="${day.exercises.length}">${day.name}</td>` : '';
        const { sets, reps, percent, cue } = computeAdjusted(exercise, currentName);
        // Determine load cell after adjustment
        let loadCell = '';
        if (cue) {
          loadCell = cue;
        } else if (exercise.primary === 'leg') {
          loadCell = formatWeight(legTM, percent != null ? percent : exercise.percent);
        } else if (exercise.primary === 'chest') {
          loadCell = formatWeight(chestTM, percent != null ? percent : exercise.percent);
        } else {
          loadCell = isMachine ? 'Bodyweight / RIR 2-3' : 'As needed';
        }
        // Build replace select options
        const opts = (REPLACEMENTS[exercise.key] || [{ name: exercise.name, machine: machine }]).map(o=>{
          const sel = o.name === currentName ? 'selected' : '';
          const disabled = availSet.size>0 && !availSet.has(o.machine) ? 'disabled' : '';
          return `<option value="${o.name}" ${sel} ${disabled}>${o.name}</option>`;
        }).join('');
        const selectHtml = `<select class="replace-select" data-key="${exercise.key || exercise.name}">${opts}</select>`;
        html += `<tr>${dayNameCell}<td>${currentName}</td><td>${machine}</td><td>${sets} × ${reps}</td><td>${loadCell}</td><td>${selectHtml}</td></tr>`;
      });
    });
    html += '</tbody></table>';
    inner.innerHTML = html;
    details.appendChild(inner);
    planContent.appendChild(details);
  }
  // Wire replacement selects once (event delegation)
  if (!planReplaceBound) {
    planContent.addEventListener('change', (e)=>{
      const t = e.target;
      if (!(t && t.tagName === 'SELECT')) return;
      if (!t.classList.contains('replace-select')) return;
      const key = t.getAttribute('data-key');
      const val = t.value;
      const map = loadExerciseMap();
      if (key) map[key] = val; else return;
      saveExerciseMap(map);
      // Re-render to reflect machine and names
  const raw = localStorage.getItem(SETTINGS_KEY);
  const settings = raw ? JSON.parse(raw) : {};
  const openWeeks = getOpenWeeksSet();
  renderPlan(settings, { openWeeks });
    });
    planReplaceBound = true;
  }
}

/**
 * Build log HTML: one entry per day per week. Loads any existing saved notes/weights.
 * @param {object} settings
 */
function renderLog(settings) {
  logContent.innerHTML = '';
  // We'll allow logs for 4 days × 12 weeks
  for (let week = 1; week <= 12; week++) {
    if (!inSelectedRange(week)) continue;
    const details = document.createElement('details');
    details.open = false;
    const summary = document.createElement('summary');
    summary.innerHTML = `<span class="summary-title">Week ${week}</span>`;
    details.appendChild(summary);
    const inner = document.createElement('div');
    inner.className = 'details-inner';
    for (let day = 1; day <= 4; day++) {
      const key = `${LOG_KEY_PREFIX}${week}_${day}`;
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = `<strong>Day ${day}</strong><br/>`;
      // Notes textarea
      const notes = document.createElement('textarea');
      notes.placeholder = 'Notes, weights used, how you felt...';
      notes.value = saved.notes || '';
      // Save button for this entry
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save Entry';
      saveBtn.addEventListener('click', () => {
        localStorage.setItem(key, JSON.stringify({ notes: notes.value }));
        saveBtn.textContent = 'Saved!';
        setTimeout(() => (saveBtn.textContent = 'Save Entry'), 2000);
        renderProgressChart();
      });
      entry.appendChild(notes);
      entry.appendChild(saveBtn);
      // Extra small utilities per log day: quick timer and perceived exertion
      const extras = document.createElement('div');
      extras.className = 'log-actions';
      const reSel = document.createElement('select');
      reSel.innerHTML = '<option value="">RPE</option>' + Array.from({length:10},(_,i)=>`<option>${i+1}</option>`).join('');
      if (saved.rpe) reSel.value = saved.rpe;
      reSel.addEventListener('change', ()=>{
        const obj = JSON.parse(localStorage.getItem(key) || '{}');
        obj.rpe = reSel.value;
        localStorage.setItem(key, JSON.stringify(obj));
      });
      const presetsWrap = document.createElement('div');
      presetsWrap.style.display = 'flex';
      presetsWrap.style.gap = '6px';
      ;[
        {label:'30s', s:30},
        {label:'1m', s:60},
        {label:'1:30', s:90},
        {label:'2m', s:120},
      ].forEach(p=>{
        const b = document.createElement('button');
        b.className = 'btn ghost'; b.textContent = p.label; b.addEventListener('click', ()=>startTimer(p.s));
        presetsWrap.appendChild(b);
      });
      extras.appendChild(reSel);
      extras.appendChild(presetsWrap);
      entry.appendChild(extras);
      inner.appendChild(entry);
    }
    details.appendChild(inner);
    logContent.appendChild(details);
  }
}

// Expand/Collapse helpers
function setAllDetailsOpen(container, open){
  const nodes = container.querySelectorAll('details');
  nodes.forEach(d => d.open = open);
}

// ------------------------------
// Theme toggle
// ------------------------------
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme(){
  const stored = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = stored || (prefersLight ? 'light' : 'dark');
  applyTheme(theme);
  if (btnTheme) {
    btnTheme.textContent = theme === 'light' ? 'Dark' : 'Light';
    btnTheme.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      btnTheme.textContent = next === 'light' ? 'Dark' : 'Light';
    });
  }
}

// ------------------------------
// 1RM Calculator
// ------------------------------
function estimate1RM(weight, reps){
  // Epley and Brzycki estimates
  const epley = weight * (1 + reps/30);
  const brzycki = weight * (36 / (37 - reps));
  return { epley, brzycki };
}

function init1RMCalculator(){
  if (!btnCalc1RM) return;
  btnCalc1RM.addEventListener('click', ()=>{
    const w = parseFloat(calcWeight.value) || 0;
    const r = Math.max(1, Math.min(12, parseInt(calcReps.value)||1));
    const { epley, brzycki } = estimate1RM(w, r);
    const unit = unitsSelect.value || 'kg';
    calc1RMResult.textContent = `Epley: ${epley.toFixed(1)} ${unit} • Brzycki: ${brzycki.toFixed(1)} ${unit}`;
  });
}

// ------------------------------
// Plate Calculator
// ------------------------------
function calcPlates(targetTotal, bar, plates){
  // returns array of pairs per side
  let perSide = (targetTotal - bar) / 2;
  const result = [];
  for (const p of plates){
    let count = 0;
    while (perSide >= p - 1e-9) {
      perSide = +(perSide - p).toFixed(3);
      count++;
    }
    if (count>0) result.push([p, count]);
  }
  return { pairs: result, remaining: +perSide.toFixed(3) };
}

function initPlateCalculator(){
  if (!btnCalcPlates) return;
  btnCalcPlates.addEventListener('click', ()=>{
    const unit = unitsSelect.value || 'kg';
    const target = parseFloat(plateTarget.value)||0;
    const bar = parseFloat(barWeight.value)||0;
    const plates = (availablePlates.value||'')
      .split(',')
      .map(s=>parseFloat(s.trim()))
      .filter(n=>!isNaN(n))
      .sort((a,b)=>b-a);
    if (target <= bar) {
      plateResult.textContent = `Target must be greater than bar weight.`;
      return;
    }
    const { pairs, remaining } = calcPlates(target, bar, plates);
    const list = pairs.map(([p,c])=>`${c} × ${p}${unit}`).join(', ');
    plateResult.textContent = `Per side: ${list || '—'}${remaining>0?` • Remaining: ${remaining}${unit}`:''}`;
  });
}

// ------------------------------
// Rest Timer
// ------------------------------
let timerId = null; let timerEnd = 0;
function startTimer(seconds){
  if (timerId) clearInterval(timerId);
  timerEnd = Date.now() + seconds*1000;
  updateTimerDisplay();
  timerId = setInterval(()=>{
    if (Date.now() >= timerEnd) {
      clearInterval(timerId); timerId = null; timerEnd = 0; updateTimerDisplay();
      try { new AudioContext(); } catch(_) {}
      if (document.visibilityState !== 'visible') {
        // simple attention cue
        document.title = '⏱️ Done - Hybrid Strength';
        setTimeout(()=>{ document.title = 'Hybrid Strength Planner'; }, 3000);
      }
      return;
    }
    updateTimerDisplay();
  }, 200);
}
function stopTimer(){ if (timerId) { clearInterval(timerId); timerId = null; } }
function resetTimer(){ stopTimer(); timerEnd = 0; updateTimerDisplay(); }
function updateTimerDisplay(){
  if (!timerDisplay) return;
  let remaining = Math.max(0, Math.round((timerEnd - Date.now())/1000));
  const m = String(Math.floor(remaining/60)).padStart(2,'0');
  const s = String(remaining%60).padStart(2,'0');
  timerDisplay.textContent = `${m}:${s}`;
}
function initTimer(){
  if (btnTimerStart) btnTimerStart.addEventListener('click', ()=>{
    const mins = Math.max(0, parseInt(timerMinutes.value)||0);
    startTimer(mins*60);
  });
  if (btnTimerStop) btnTimerStop.addEventListener('click', stopTimer);
  if (btnTimerReset) btnTimerReset.addEventListener('click', resetTimer);
  // Preset buttons in Tools
  presetTimerButtons().forEach(btn=>{
    const secs = parseInt(btn.getAttribute('data-seconds')||'0') || 0;
    btn.addEventListener('click', ()=> startTimer(secs));
  });
}

// ------------------------------
// Progress Chart (lightweight canvas chart)
// ------------------------------
function collectWeeklyLogCounts(){
  const weeks = Array.from({length:12}, (_,i)=>i+1);
  return weeks.map(w=>{
    let count = 0;
    for (let d=1; d<=4; d++){
      const key = `${LOG_KEY_PREFIX}${w}_${d}`;
      const saved = JSON.parse(localStorage.getItem(key)||'{}');
      if (saved.notes && saved.notes.trim()) count++;
    }
    return count;
  });
}

function renderProgressChart(){
  if (!progressCanvas) return;
  const ctx = progressCanvas.getContext('2d');
  const data = collectWeeklyLogCounts();
  const w = progressCanvas.width, h = progressCanvas.height;
  ctx.clearRect(0,0,w,h);
  // axes
  const padL = 40, padB = 30, padT = 10, padR = 10;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  ctx.strokeStyle = '#3b3f53'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT+chartH); ctx.lineTo(padL+chartW, padT+chartH); ctx.stroke();
  // y ticks 0..4
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted');
  ctx.font = '12px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let y=0; y<=4; y++){
    const py = padT + chartH - (y/4)*chartH;
    ctx.fillText(String(y), padL-6, py);
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(padL+chartW, py); ctx.stroke();
  }
  // bars
  const barW = chartW / (data.length*1.5);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--brand');
  data.forEach((val, i)=>{
    const x = padL + i * (chartW/data.length) + (chartW/data.length - barW)/2;
    const hVal = (val/4) * chartH;
    ctx.fillRect(x, padT + chartH - hVal, barW, Math.max(2, hVal));
  });
}

// ------------------------------
// Import / Export
// ------------------------------
function exportData(){
  const data = {};
  for (let i=0; i<localStorage.length; i++){
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith('hybrid')) data[k] = localStorage.getItem(k);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'hybrid-strength-data.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 500);
}

function importData(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      Object.entries(data).forEach(([k,v])=>{
        if (typeof v === 'string' && k.startsWith('hybrid')) localStorage.setItem(k, v);
      });
      loadSettings();
      const raw = localStorage.getItem(SETTINGS_KEY);
      const settings = raw ? JSON.parse(raw) : {};
      renderPlan(settings); renderLog(settings); renderProgressChart();
      alert('Import complete.');
    } catch (e){
      alert('Failed to import data.');
    }
  };
  reader.readAsText(file);
}

function initImportExport(){
  if (btnExport) btnExport.addEventListener('click', exportData);
  if (btnImport) btnImport.addEventListener('click', ()=>importFile && importFile.click());
  if (importFile) importFile.addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0];
    if (file) importData(file);
    importFile.value = '';
  });
}

// Wire up nav clicks
navSetup.addEventListener('click', () => showSection('setup'));
navPlan.addEventListener('click', () => {
  showSection('plan');
  // Render plan on demand
  const raw = localStorage.getItem(SETTINGS_KEY);
  const settings = raw ? JSON.parse(raw) : {};
  renderPlan(settings);
  renderProgressChart();
});
navLog.addEventListener('click', () => {
  showSection('log');
  const raw = localStorage.getItem(SETTINGS_KEY);
  const settings = raw ? JSON.parse(raw) : {};
  renderLog(settings);
  renderProgressChart();
});

// Save button handler
saveButton.addEventListener('click', saveSettings);

// On initial load, populate form and plan/log if settings exist
loadSettings();
// Render plan/log by default so users see something when switching tabs without saving
renderPlan({ legPress1rm: 0, chestPress1rm: 0, units: 'kg', mode: 'machine' });
renderLog({});
initTheme();
init1RMCalculator();
initPlateCalculator();
initTimer();
initImportExport();
renderProgressChart();
renderEquipmentUI();

// Re-render plan when equipment changes; preserve open states
function getOpenTools(){
  const ids = ['tools1rm','toolsPlates','toolsTimer'];
  const state = {};
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if (el) state[id] = el.open;
  });
  return state;
}
function restoreOpenTools(state){
  Object.entries(state||{}).forEach(([id, open])=>{
    const el = document.getElementById(id);
    if (el) el.open = !!open;
  });
}
// Listen at the container so select-all/clear also trigger this
const equipContainer = document.getElementById('availableEquipmentDetails');
if (equipContainer) equipContainer.addEventListener('change', ()=>{
  const raw = localStorage.getItem(SETTINGS_KEY);
  const settings = raw ? JSON.parse(raw) : {};
  const openWeeks = getOpenWeeksSet();
  const toolsState = getOpenTools();
  renderPlan(settings, { openWeeks });
  // restore tools open drawers
  restoreOpenTools(toolsState);
});

// Week range and expand/collapse controls
if (weekRange){
  weekRange.addEventListener('change', ()=>{
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    // re-render both so UI stays in sync
    renderPlan(settings);
    renderLog(settings);
  });
}
if (btnExpandWeeks) btnExpandWeeks.addEventListener('click', ()=> setAllDetailsOpen(planContent, true));
if (btnCollapseWeeks) btnCollapseWeeks.addEventListener('click', ()=> setAllDetailsOpen(planContent, false));
if (btnExpandLogWeeks) btnExpandLogWeeks.addEventListener('click', ()=> setAllDetailsOpen(logContent, true));
if (btnCollapseLogWeeks) btnCollapseLogWeeks.addEventListener('click', ()=> setAllDetailsOpen(logContent, false));