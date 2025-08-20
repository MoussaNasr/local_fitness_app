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
// Session section elements
const sessionSection = document.getElementById('session');
const sessionTitle = document.getElementById('sessionTitle');
const sessionSubtitle = document.getElementById('sessionSubtitle');
const sessionExercisesTable = document.getElementById('sessionExercisesTable');
const sessionWarmup = document.getElementById('sessionWarmup');
const sessionRecovery = document.getElementById('sessionRecovery');
const sessionBack = document.getElementById('sessionBack');
const sessionSaveEnd = document.getElementById('sessionSaveEnd');
const sessionTimerMinutes = document.getElementById('sessionTimerMinutes');
const sessionTimerDisplay = document.getElementById('sessionTimerDisplay');
const sessionTimerStart = document.getElementById('sessionTimerStart');
const sessionTimerStop = document.getElementById('sessionTimerStop');
const sessionTimerReset = document.getElementById('sessionTimerReset');

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
const progressCanvas = document.getElementById('progressChart');
const volumeCanvas = document.getElementById('volumeChart');
const statDays = document.getElementById('statDays');
const statVolume = document.getElementById('statVolume');
const statAvg = document.getElementById('statAvg');
const weekRange = document.getElementById('weekRange');
const btnExpandWeeks = document.getElementById('btnExpandWeeks');
const btnCollapseWeeks = document.getElementById('btnCollapseWeeks');
// removed log page expand/collapse controls

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
const PLAN_DONE_PREFIX = 'hybridPlanDone_';
const CUSTOM_PROGRAM_KEY = 'hybridCustomProgram';
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

const EXERCISE_IMAGES = {
  'Back Squat (Barbell)': ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Squat_-_weight_training_exercise.gif/640px-Squat_-_weight_training_exercise.gif'],
  'Leg Press': ['https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Leg_press_machine.jpg/640px-Leg_press_machine.jpg'],
  'Hack Squat': ['https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Hack_Squat.jpg/640px-Hack_Squat.jpg'],
  'Goblet Squat (DB)': ['https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Goblet_Squat.png/480px-Goblet_Squat.png'],
  'Bench Press': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bench_Press.png/640px-Bench_Press.png'],
  'Chest Press': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chest_press_machine.jpg/640px-Chest_press_machine.jpg'],
  'Dumbbell Bench Press': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Dumbbell-bench-press-2.png/640px-Dumbbell-bench-press-2.png'],
  'Push-Ups': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pushup.jpg/640px-Pushup.jpg'],
  'Overhead Press': ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Shoulder_press2.svg/512px-Shoulder_press2.svg.png'],
  'Dumbbell Shoulder Press': ['https://upload.wikimedia.org/wikipedia/commons/1/1f/Dumbbell_shoulder_press.png'],
  'Pike Push-Ups': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pushup.jpg/640px-Pushup.jpg'],
  'Machine Shoulder Press': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Shoulder_press_machine.jpg/640px-Shoulder_press_machine.jpg'],
  'Bodyweight Rows': ['https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Australian_Pull-Up.svg/512px-Australian_Pull-Up.svg.png'],
  'Barbell Row': ['https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Barbell_Bent-Over_Row.svg/512px-Barbell_Bent-Over_Row.svg.png'],
  'Dumbbell Row': ['https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/One-Arm_Dumbbell_Row.svg/512px-One-Arm_Dumbbell_Row.svg.png'],
  'Cable Row': ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Seated_cable_rows.jpg/640px-Seated_cable_rows.jpg'],
  'Loaded Carries': ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Farmer%27s_walk.gif/480px-Farmer%27s_walk.gif'],
  'Suitcase Carry': ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Farmer%27s_walk.gif/480px-Farmer%27s_walk.gif'],
  'Trap Bar Carry': ['https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Trap_bar_deadlift.jpg/640px-Trap_bar_deadlift.jpg'],
  'Shadow Boxing / Bag Rounds': ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Punching_bag_gymsports.jpg/640px-Punching_bag_gymsports.jpg'],
  'Assault Bike Intervals': ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Schwinn_Airdyne_exercise_bike.jpg/640px-Schwinn_Airdyne_exercise_bike.jpg'],
  'Row Erg Intervals': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Indoor_Rower.jpg/640px-Indoor_Rower.jpg'],
  'Hill / Stair Sprints': ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Running_up_stairs.jpg/640px-Running_up_stairs.jpg'],
  'Treadmill Sprints': ['https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Treadmill.jpg/640px-Treadmill.jpg'],
  'Bike Sprints': ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Exercise_bicycle.jpg/640px-Exercise_bicycle.jpg'],
  'Deadlift': ['https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Deadlift.svg/512px-Deadlift.svg.png'],
  'Hip Thrust (Bodyweight)': ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Hip_thrust.jpg/640px-Hip_thrust.jpg'],
  'Hip Thrust (Barbell)': ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Hip_thrust.jpg/640px-Hip_thrust.jpg'],
  'Kettlebell Swings': ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Kettlebell-swing.svg/512px-Kettlebell-swing.svg.png'],
  'Front Squat': ['https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Front_squat.svg/512px-Front_squat.svg.png'],
  'Rear Foot Elevated Split Squat': ['https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bulgarian_Split_Squat.svg/512px-Bulgarian_Split_Squat.svg.png'],
  'Leg Extension': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Leg_extension.svg/512px-Leg_extension.svg.png'],
  'Jump Series': ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Vertical_Jump.jpg/640px-Vertical_Jump.jpg'],
  'Push-Ups / Incline Press': ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Incline_bench_press_2.png/640px-Incline_bench_press_2.png'],
  'Towel/Sheet Rows': ['https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Australian_Pull-Up.svg/512px-Australian_Pull-Up.svg.png'],
};
const EX_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <rect width="100%" height="100%" fill="#121319"/>
    <rect x="20" y="20" width="600" height="320" rx="16" ry="16" fill="none" stroke="#3b3f53" stroke-width="2"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#e6e8ee" font-family="system-ui" font-size="20">No image available</text>
  </svg>
`);

function openModal(title, html){
  if (!modal) return;
  if (modalTitle) modalTitle.textContent = title || '';
  if (modalBody) modalBody.innerHTML = html || '';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(){
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) modal.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });

// Preserve open weeks across re-render
function getOpenWeeksSet(){
  const set = new Set();
  planContent.querySelectorAll('details[open][data-week]').forEach(d=>{
    const w = parseInt(d.getAttribute('data-week')||'');
    if (!isNaN(w)) set.add(w);
  });
  return set;
}

// Preserve open days (per week) across re-render
function getOpenDaysSet(){
  const set = new Set();
  planContent.querySelectorAll('details[data-week] details[open][data-day]').forEach(d=>{
    const week = d.closest('details[data-week]');
    const w = week ? parseInt(week.getAttribute('data-week')||'') : NaN;
    const day = parseInt(d.getAttribute('data-day')||'');
    if (!isNaN(w) && !isNaN(day)) set.add(`${w}_${day}`);
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
  if (sessionSection) sessionSection.classList.add('hidden');
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
      // Render analytics when entering stats page
      renderProgressChart();
      renderVolumeChart();
      renderStatsSummary();
      break;
    case 'session':
      if (sessionSection) sessionSection.classList.remove('hidden');
      // Do not set any nav tab active for session
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
  renderProgressChart();
}

// Custom Program helpers
function loadCustomProgram(){
  try { return JSON.parse(localStorage.getItem(CUSTOM_PROGRAM_KEY) || 'null'); } catch { return null; }
}
function saveCustomProgram(days){ localStorage.setItem(CUSTOM_PROGRAM_KEY, JSON.stringify(days)); }

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

  // Plan definition: 4 days repeated weekly for 12 weeks (can be overridden).
  const defaultDays = [
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
  const custom = loadCustomProgram();
  const days = Array.isArray(custom) && custom.length ? custom : defaultDays;

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
    // Nested day accordions
    days.forEach((day, dayIndex) => {
      const dDetails = document.createElement('details');
      dDetails.dataset.day = String(dayIndex+1);
      const openDays = options.openDays;
      dDetails.open = !!(openDays && openDays.has(`${week}_${dayIndex+1}`));
  const dSummary = document.createElement('summary');
      dSummary.innerHTML = `<span class="summary-title">${day.name}</span>`;
      dDetails.appendChild(dSummary);
  // Controls for this day
  const controlsBar = document.createElement('div');
  controlsBar.style = 'display:flex; justify-content:flex-end; gap:8px; margin:6px 0;';
  controlsBar.innerHTML = `<button class="btn btn-start-session" data-week="${week}" data-day="${dayIndex+1}">Start Session</button>`;
  dDetails.appendChild(controlsBar);
  // Build table for this day only
  let html = '<table><thead><tr><th>Exercise</th><th>Machine</th><th>Sets × Reps</th><th>Load / Cue</th><th>Replace</th><th>Done</th></tr></thead><tbody>';
      day.exercises.forEach((exercise, exIdx) => {
        // Auto-pick best exercise based on availability if user hasn't overridden
        const map = loadExerciseMap();
        const eKey = exercise.key || exercise.name;
        let currentName = map[eKey];
        if (!currentName) {
          const replOpts = REPLACEMENTS[eKey] || [{ name: exercise.name, machine: getMachineForName(exercise.name, eKey) }];
          const preferred = replOpts.find(o=> availSet.has(o.machine)) || replOpts[0];
          currentName = preferred.name;
        }
        const machine = getMachineForName(currentName, eKey);
        const { sets, reps, percent, cue } = computeAdjusted(exercise, currentName);
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
        const optsHtml = (REPLACEMENTS[exercise.key] || [{ name: exercise.name, machine: machine }]).map(o=>{
          const sel = o.name === currentName ? 'selected' : '';
          const disabled = availSet.size>0 && !availSet.has(o.machine) ? 'disabled' : '';
          return `<option value="${o.name}" ${sel} ${disabled}>${o.name}</option>`;
        }).join('');
  const infoBtn = `<button class="info-btn" title="Exercise info" aria-label="Exercise info" data-exname="${currentName}">ℹ️</button>`;
  const selectHtml = `<select class="replace-select" data-key="${exercise.key || exercise.name}">${optsHtml}</select>`;
        const doneKey = `${PLAN_DONE_PREFIX}${week}_${dayIndex+1}_${exIdx}`;
        const isDone = localStorage.getItem(doneKey) === '1';
        const doneHtml = `<input type="checkbox" class="done-check" data-week="${week}" data-day="${dayIndex+1}" data-ex="${exIdx}" ${isDone?'checked':''}>`;
  html += `<tr${isDone?' class="row-done"':''}><td>${currentName} ${infoBtn}</td><td>${machine}</td><td>${sets} × ${reps}</td><td>${loadCell}</td><td>${selectHtml}</td><td style="text-align:center;">${doneHtml}</td></tr>`;
      });
      html += '</tbody></table>';
      // Recovery details per day
      const rec = getRecoveryForDay(day.name);
      if (rec) {
        html += `<div class="hint" style="margin-top:10px">Recovery: ${rec.summary}</div>`;
        if (rec.stretches && rec.stretches.length){
          html += '<ul class="hint">' + rec.stretches.map(s=>`<li>${s.name}: ${s.duration}</li>`).join('') + '</ul>';
        }
        if (rec.massage && rec.massage.length){
          html += '<div class="hint">Massage gun: ' + rec.massage.map(m=>`${m.area} (${m.duration})`).join(', ') + '</div>';
        }
      }
      const wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      wrap.innerHTML = html;
      dDetails.appendChild(wrap);
      inner.appendChild(dDetails);
    });
    details.appendChild(inner);
    planContent.appendChild(details);
  }
  // Wire replacement selects once (event delegation)
  if (!planReplaceBound) {
    planContent.addEventListener('change', (e)=>{
      const t = e.target;
      if (!t) return;
      if (t.tagName === 'SELECT' && t.classList.contains('replace-select')){
        const key = t.getAttribute('data-key');
        const val = t.value;
        const map = loadExerciseMap();
        if (key) map[key] = val; else return;
        saveExerciseMap(map);
        // Re-render to reflect machine and names, preserve open weeks
        const raw = localStorage.getItem(SETTINGS_KEY);
        const settings = raw ? JSON.parse(raw) : {};
        const openWeeks = getOpenWeeksSet();
        const openDays = getOpenDaysSet();
        renderPlan(settings, { openWeeks, openDays });
        return;
      }
      if (t instanceof HTMLInputElement && t.type === 'checkbox' && t.classList.contains('done-check')){
        const w = t.getAttribute('data-week');
        const d = t.getAttribute('data-day');
        const x = t.getAttribute('data-ex');
        if (!w || !d || !x) return;
        const k = `${PLAN_DONE_PREFIX}${w}_${d}_${x}`;
        localStorage.setItem(k, t.checked ? '1' : '0');
        const tr = t.closest('tr');
        if (tr) tr.classList.toggle('row-done', t.checked);
        return;
      }
    });
    // Start Session button
    planContent.addEventListener('click', (e)=>{
      const btn = e.target.closest && e.target.closest('.btn-start-session');
      if (!btn) return;
      const w = parseInt(btn.getAttribute('data-week')||'');
      const d = parseInt(btn.getAttribute('data-day')||'');
      if (!w || !d) return;
      const raw = localStorage.getItem(SETTINGS_KEY);
      const settings = raw ? JSON.parse(raw) : {};
      renderSession(settings, w, d);
      showSection('session');
    });
    // Info button click (open images)
    planContent.addEventListener('click', (e)=>{
      const btn = e.target.closest && e.target.closest('button.info-btn');
      if (!btn) return;
      const name = btn.getAttribute('data-exname') || 'Exercise';
      const imgs = EXERCISE_IMAGES[name] || [];
      const content = imgs.length ?
        `<div class="modal-row">${imgs.map(src=>`<img src="${src}" alt="${name}" style="width:100%;height:auto;border-radius:8px;border:1px solid var(--border)" onerror="this.src='${EX_PLACEHOLDER}'">`).join('')}</div>`
        : `<img src="${EX_PLACEHOLDER}" alt="No image" style="width:100%;height:auto;border-radius:8px;border:1px solid var(--border)">`;
      openModal(name, content);
    });
    // Accordion behavior for days: keep only one open per week
    planContent.addEventListener('toggle', (e)=>{
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      // When a week opens, auto-open the first day if none is open
      if (target.matches('details[data-week]') && target.open){
        const dayDetails = target.querySelectorAll('details[data-day]');
        if (dayDetails.length){
          const anyOpen = Array.from(dayDetails).some(d=>d.open);
          if (!anyOpen) dayDetails[0].open = true;
        }
      }
      if (target.matches('details[data-day]') && target.open){
        const weekEl = target.closest('details[data-week]');
        if (!weekEl) return;
        weekEl.querySelectorAll('details[data-day]').forEach(d => { if (d !== target) d.open = false; });
      }
    });
    planReplaceBound = true;
  }
}

// ------------------------------
// Session Page Logic
// ------------------------------
let currentSession = null; // { week, day, name, exercises:[{name,machine,sets,reps,load,cue,done:Array<bool>}]} 

function getPlanDaysForSettings(settings){
  // Reuse same logic as in renderPlan to build days array
  const isMachine = settings.mode === 'machine';
  const defaultDays = [
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
  const custom = loadCustomProgram();
  return Array.isArray(custom) && custom.length ? custom : defaultDays;
}

function renderSession(settings, week, day){
  if (!sessionSection) return;
  const days = getPlanDaysForSettings(settings);
  const dayIdx = Math.max(1, Math.min(day, days.length));
  const dayObj = days[dayIdx-1];
  const availSet = new Set(loadEquipment());
  const legTM = settings.legPress1rm * 0.9;
  const chestTM = settings.chestPress1rm * 0.9;
  const isMachine = settings.mode === 'machine';

  // Build exercises with current replacements and loads
  const map = loadExerciseMap();
  const exercises = dayObj.exercises.map(ex => {
    const eKey = ex.key || ex.name;
    let currentName = map[eKey];
    if (!currentName){
      const replOpts = REPLACEMENTS[eKey] || [{ name: ex.name, machine: getMachineForName(ex.name, eKey) }];
      const preferred = replOpts.find(o=> availSet.has(o.machine)) || replOpts[0];
      currentName = preferred.name;
    }
    const machine = getMachineForName(currentName, eKey);
    const { sets, reps, percent, cue } = computeAdjusted(ex, currentName);
  let loadCell = '';
  let loadNumericKg = 0;
    if (cue) loadCell = cue; else if (ex.primary === 'leg') loadCell = formatLoadLabel(isMachine, settings, legTM, percent != null ? percent : ex.percent);
    else if (ex.primary === 'chest') loadCell = formatLoadLabel(isMachine, settings, chestTM, percent != null ? percent : ex.percent);
    else loadCell = isMachine ? 'Bodyweight / RIR 2-3' : 'As needed';
  // numeric estimate (kg) when load label is in kg/lb
  loadNumericKg = parseLoadToKg(loadCell);
  return { key: eKey, name: currentName, machine, sets, reps, load: loadCell, loadKg: loadNumericKg, done: Array.from({length: sets}, ()=>false) };
  });

  currentSession = { week, day: dayIdx, name: dayObj.name, exercises };

  if (sessionTitle) sessionTitle.textContent = `Session – Week ${week}, Day ${dayIdx}`;
  if (sessionSubtitle) sessionSubtitle.textContent = dayObj.name;

  // Warmup suggestions
  if (sessionWarmup){
    const wu = getWarmupForDay(dayObj.name);
    sessionWarmup.innerHTML = wu.map(w=>`<div>• ${w}</div>`).join('');
  }
  // Recovery
  if (sessionRecovery){
    const rec = getRecoveryForDay(dayObj.name);
    let html = `<div class="hint">${rec.summary}</div>`;
    if (rec.stretches?.length) html += '<ul class="hint">' + rec.stretches.map(s=>`<li>${s.name}: ${s.duration}</li>`).join('') + '</ul>';
    if (rec.massage?.length) html += '<div class="hint">Massage gun: ' + rec.massage.map(m=>`${m.area} (${m.duration})`).join(', ') + '</div>';
    sessionRecovery.innerHTML = html;
  }
  // Exercises table
  if (sessionExercisesTable){
    let html = '<thead><tr><th>Exercise</th><th>Prescribed</th><th>Load / Cue</th><th>Sets Tracker</th></tr></thead><tbody>';
    exercises.forEach((ex, i)=>{
      const setsBoxes = ex.done.map((v, sIdx)=>`<label style="margin-right:6px;white-space:nowrap;"><input type="checkbox" class="set-box" data-ex="${i}" data-set="${sIdx}"> S${sIdx+1}</label>`).join('');
      html += `<tr><td>${ex.name}</td><td>${ex.sets} × ${ex.reps}</td><td>${ex.load}</td><td>${setsBoxes}</td></tr>`;
    });
    html += '</tbody>';
    sessionExercisesTable.innerHTML = html;
  }
}

function formatLoadLabel(isMachine, settings, tm, percent){
  if (isMachine) {
    const rir = percent >= 0.85 ? 1 : percent >= 0.75 ? 2 : 3;
    return `RIR ${rir}`;
  }
  let weight = tm * percent;
  if (settings.units === 'lb') {
    weight = roundToIncrement(weight * 2.20462, 5);
    return `${weight.toFixed(0)} lb`;
  } else {
    weight = roundToIncrement(weight, 2.5);
    return `${weight.toFixed(1)} kg`;
  }
}

function getWarmupForDay(dayName){
  const n = (dayName||'').toLowerCase();
  if (n.includes('lower')) return [
    '5 min light bike/row',
    'Leg swings front/back ×10/side',
    'Hip circles ×10/side',
    'Bodyweight squats ×10',
  ];
  if (n.includes('upper')) return [
    '5 min light row/arm bike',
    'Band pull‑aparts ×20',
    'Scap push‑ups ×10',
    'Wall slides ×10',
  ];
  if (n.includes('explosive') || n.includes('conditioning')) return [
    '5 min jog or jump rope',
    'Ankle hops ×20',
    'A‑skips ×20m',
    'Hip flexor openers ×10/side',
  ];
  return [
    '5 min easy cardio',
    'Dynamic full‑body flow 2–3 min',
  ];
}

// Session timer (independent from Tools timer)
let sessionTimerId = null; let sessionTimerEnd = 0;
function startSessionTimer(seconds){
  if (sessionTimerId) clearInterval(sessionTimerId);
  sessionTimerEnd = Date.now() + seconds*1000;
  updateSessionTimerDisplay();
  sessionTimerId = setInterval(()=>{
    if (Date.now() >= sessionTimerEnd){
      clearInterval(sessionTimerId); sessionTimerId = null; sessionTimerEnd = 0; updateSessionTimerDisplay();
      try { new AudioContext(); } catch(_) {}
      return;
    }
    updateSessionTimerDisplay();
  }, 200);
}
function stopSessionTimer(){ if (sessionTimerId){ clearInterval(sessionTimerId); sessionTimerId = null; } }
function resetSessionTimer(){ stopSessionTimer(); sessionTimerEnd = 0; updateSessionTimerDisplay(); }
function updateSessionTimerDisplay(){
  if (!sessionTimerDisplay) return;
  let remaining = Math.max(0, Math.round((sessionTimerEnd - Date.now())/1000));
  const m = String(Math.floor(remaining/60)).padStart(2,'0');
  const s = String(remaining%60).padStart(2,'0');
  sessionTimerDisplay.textContent = `${m}:${s}`;
}

// Session interactions
if (sessionSection){
  // Timer buttons
  if (sessionTimerStart) sessionTimerStart.addEventListener('click', ()=>{
    const mins = Math.max(0, parseInt(sessionTimerMinutes.value)||0);
    startSessionTimer(mins*60);
  });
  if (sessionTimerStop) sessionTimerStop.addEventListener('click', stopSessionTimer);
  if (sessionTimerReset) sessionTimerReset.addEventListener('click', resetSessionTimer);
  document.querySelectorAll('.session-preset').forEach(btn=>{
    const secs = parseInt(btn.getAttribute('data-seconds')||'0')||0;
    btn.addEventListener('click', ()=> startSessionTimer(secs));
  });
  // Set tracker
  if (sessionExercisesTable) sessionExercisesTable.addEventListener('change', (e)=>{
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (!t.classList.contains('set-box')) return;
    const ex = parseInt(t.getAttribute('data-ex')||'');
    const s = parseInt(t.getAttribute('data-set')||'');
    if (!currentSession || isNaN(ex) || isNaN(s)) return;
    currentSession.exercises[ex].done[s] = t.checked;
  });
  if (sessionExercisesTable) sessionExercisesTable.addEventListener('click', (e)=>{
    const btn = e.target.closest && e.target.closest('.sess-q-timer');
    if (!btn) return;
    const secs = parseInt(btn.getAttribute('data-sec')||'0')||0;
    startSessionTimer(secs);
  });
  // Nav buttons
  if (sessionBack) sessionBack.addEventListener('click', ()=>{
    showSection('plan');
  });
  if (sessionSaveEnd) sessionSaveEnd.addEventListener('click', ()=>{
    if (!currentSession) { showSection('plan'); return; }
    const key = `${LOG_KEY_PREFIX}${currentSession.week}_${currentSession.day}`;
    const prev = JSON.parse(localStorage.getItem(key)||'{}');
    const notesEl = document.getElementById('sessionNotes');
    const rpeEl = document.getElementById('sessionRpe');
    const payload = {
      ...prev,
      notes: notesEl ? notesEl.value : (prev.notes||''),
      rpe: rpeEl ? rpeEl.value : (prev.rpe||''),
      session: {
        name: currentSession.name,
        exercises: currentSession.exercises.map(ex=>({ name: ex.name, sets: ex.sets, reps: ex.reps, load: ex.load, loadKg: ex.loadKg, done: ex.done }))
      },
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    // Also mark plan exercise rows as done if all sets done
    currentSession.exercises.forEach((ex, idx)=>{
      const doneAll = ex.done.every(Boolean);
      const doneKey = `${PLAN_DONE_PREFIX}${currentSession.week}_${currentSession.day}_${idx}`;
      localStorage.setItem(doneKey, doneAll ? '1' : '0');
    });
    // Return to log to review
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    renderLog(settings); renderProgressChart();
    showSection('log');
  });
}

// Simple recovery generator by day type keywords
function getRecoveryForDay(dayName){
  const n = (dayName||'').toLowerCase();
  // Defaults
  const base = {
    summary: '5–10 min light cardio cool‑down, then targeted stretches and optional massage gun.',
    stretches: [],
    massage: []
  };
  if (n.includes('lower')){
    base.stretches = [
      { name: 'Hamstring stretch', duration: '2×30s/side' },
      { name: 'Hip flexor lunge', duration: '2×30s/side' },
      { name: 'Calf stretch (wall)', duration: '2×30s/side' }
    ];
    base.massage = [
      { area: 'Quads', duration: '60–90s/leg' },
      { area: 'Glutes', duration: '60s/side' },
      { area: 'Calves', duration: '60s/side' }
    ];
  } else if (n.includes('upper')){
    base.stretches = [
      { name: 'Doorway chest stretch', duration: '2×30s' },
      { name: 'Lat stretch (overhead)', duration: '2×30s/side' },
      { name: 'Sleeper stretch', duration: '2×30s/side' }
    ];
    base.massage = [
      { area: 'Pecs', duration: '45–60s/side' },
      { area: 'Lats', duration: '60s/side' },
      { area: 'Rear delts', duration: '45s/side' }
    ];
  } else if (n.includes('explosive') || n.includes('conditioning') || n.includes('sprint') || n.includes('strike')){
    base.stretches = [
      { name: 'Hip flexor lunge', duration: '2×30s/side' },
      { name: 'T‑spine openers', duration: '2×30s/side' },
      { name: 'Ankle dorsiflexion wall drill', duration: '2×30s/side' }
    ];
    base.massage = [
      { area: 'Calves', duration: '60s/side' },
      { area: 'Hip flexors', duration: '45s/side' }
    ];
  } else if (n.includes('mixed') || n.includes('stability')){
    base.stretches = [
      { name: 'Cat‑cow (spine)', duration: '1–2 min' },
      { name: 'Figure‑4 glute stretch', duration: '2×30s/side' },
      { name: 'Child’s pose + side reach', duration: '1–2 min' }
    ];
    base.massage = [
      { area: 'Glutes', duration: '60s/side' },
      { area: 'Mid‑back (erectors)', duration: '60–90s' }
    ];
  } else {
    // Generic
    base.stretches = [
      { name: 'Hamstrings', duration: '2×30s' },
      { name: 'Chest', duration: '2×30s' },
      { name: 'Hips', duration: '2×30s' }
    ];
  }
  return base;
}

/**
 * Build log HTML: one entry per day per week. Loads any existing saved notes/weights.
 * @param {object} settings
 */
// Removed manual log editor; logs come from Session saves and are visualized as analytics

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
    for (let d=1; d<=7; d++){
      const key = `${LOG_KEY_PREFIX}${w}_${d}`;
      const saved = JSON.parse(localStorage.getItem(key)||'{}');
      if (saved && saved.savedAt) count++;
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

// Volume chart: aggregate estimated kg lifted per week (primary lifts only)
function collectWeeklyVolume(){
  const weeks = Array.from({length:12}, (_,i)=>i+1);
  const totals = weeks.map(()=>0);
  for (let w=1; w<=12; w++){
    for (let d=1; d<=7; d++){
      const key = `${LOG_KEY_PREFIX}${w}_${d}`;
      const saved = JSON.parse(localStorage.getItem(key)||'null');
      if (!saved || !saved.session) continue;
      const sess = saved.session;
      // Sum simple volume estimate: for leg/chest primary lifts -> sets*reps*estimated load kg
      (sess.exercises||[]).forEach(ex=>{
        if (!ex || !ex.sets || !ex.reps) return;
        // attempt to parse load like "100.0 kg" or store numeric if present
        const loadKg = parseLoadToKg(ex.load || saved.loadLabel || '0 kg');
        const vol = (ex.sets*ex.reps) * loadKg;
        if (isFinite(vol)) totals[w-1] += vol;
      });
    }
  }
  return totals;
}

function parseLoadToKg(label){
  if (!label) return 0;
  const m = String(label).match(/([0-9]+(?:\.[0-9]+)?)\s*(kg|lb)/i);
  if (!m) return 0;
  let val = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit === 'lb') val = val/2.20462;
  return val;
}

function renderVolumeChart(){
  if (!volumeCanvas) return;
  const ctx = volumeCanvas.getContext('2d');
  const data = collectWeeklyVolume();
  const w = volumeCanvas.width, h = volumeCanvas.height;
  ctx.clearRect(0,0,w,h);
  const padL = 40, padB = 30, padT = 10, padR = 10;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  ctx.strokeStyle = '#3b3f53'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT+chartH); ctx.lineTo(padL+chartW, padT+chartH); ctx.stroke();
  // y ticks at 5 levels
  const maxVal = Math.max(...data, 1);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted');
  ctx.font = '12px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let i=0;i<=5;i++){
    const v = (i/5)*maxVal;
    const py = padT + chartH - (v/maxVal)*chartH;
    ctx.fillText(String(Math.round(v)), padL-6, py);
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(padL+chartW, py); ctx.stroke();
  }
  // bars
  const barW = chartW / (data.length*1.5);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--brand');
  data.forEach((val, i)=>{
    const x = padL + i * (chartW/data.length) + (chartW/data.length - barW)/2;
    const hVal = (val/Math.max(maxVal,1)) * chartH;
    ctx.fillRect(x, padT + chartH - hVal, barW, Math.max(2, hVal));
  });
}

function renderStatsSummary(){
  if (!statDays || !statVolume || !statAvg) return;
  const counts = collectWeeklyLogCounts();
  const days = counts.reduce((a,b)=>a+b, 0);
  const vol = collectWeeklyVolume().reduce((a,b)=>a+b, 0);
  const avg = days ? (vol/days) : 0;
  statDays.textContent = String(days);
  statVolume.textContent = Math.round(vol).toLocaleString();
  statAvg.textContent = Math.round(avg).toLocaleString();
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
  renderProgressChart();
  renderVolumeChart();
  renderStatsSummary();
});

// Save button handler
saveButton.addEventListener('click', saveSettings);

// On initial load, populate form and plan/log if settings exist
loadSettings();
// Render plan/log by default so users see something when switching tabs without saving
renderPlan({ legPress1rm: 0, chestPress1rm: 0, units: 'kg', mode: 'machine' });
initTheme();
init1RMCalculator();
initPlateCalculator();
initTimer();
initImportExport();
renderProgressChart();
renderVolumeChart();
renderStatsSummary();
renderEquipmentUI();

// Custom Program UI wiring
const customProgramText = document.getElementById('customProgramJson');
const customProgramStatus = document.getElementById('customProgramStatus');
const btnSaveCustomProgram = document.getElementById('btnSaveCustomProgram');
const btnClearCustomProgram = document.getElementById('btnClearCustomProgram');
if (customProgramText){
  // Load existing
  const existing = loadCustomProgram();
  if (existing) customProgramText.value = JSON.stringify(existing, null, 2);
}
if (btnSaveCustomProgram){
  btnSaveCustomProgram.addEventListener('click', ()=>{
    try {
      const parsed = JSON.parse(customProgramText.value || '');
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('Invalid program format');
      saveCustomProgram(parsed);
      customProgramStatus.textContent = 'Custom program saved. Plan updated.';
      const raw = localStorage.getItem(SETTINGS_KEY);
      const settings = raw ? JSON.parse(raw) : {};
      const openWeeks = getOpenWeeksSet();
      const openDays = getOpenDaysSet();
      renderPlan(settings, { openWeeks, openDays });
    } catch (e){
      customProgramStatus.textContent = 'Failed to parse JSON.';
    }
  });
}
if (btnClearCustomProgram){
  btnClearCustomProgram.addEventListener('click', ()=>{
    localStorage.removeItem(CUSTOM_PROGRAM_KEY);
    if (customProgramText) customProgramText.value = '';
    customProgramStatus.textContent = 'Reverted to default program.';
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    const openWeeks = getOpenWeeksSet();
    const openDays = getOpenDaysSet();
    renderPlan(settings, { openWeeks, openDays });
  });
}

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
  const openDays = getOpenDaysSet();
  const toolsState = getOpenTools();
  renderPlan(settings, { openWeeks, openDays });
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
// Only toggle week-level accordions for Plan expand/collapse
if (btnExpandWeeks) btnExpandWeeks.addEventListener('click', ()=>{
  planContent.querySelectorAll('details[data-week]').forEach(d=> d.open = true);
});
if (btnCollapseWeeks) btnCollapseWeeks.addEventListener('click', ()=>{
  planContent.querySelectorAll('details[data-week]').forEach(d=> d.open = false);
});
if (btnExpandLogWeeks) btnExpandLogWeeks.addEventListener('click', ()=> setAllDetailsOpen(logContent, true));
if (btnCollapseLogWeeks) btnCollapseLogWeeks.addEventListener('click', ()=> setAllDetailsOpen(logContent, false));