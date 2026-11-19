// Checklist de los cuatro animales presentes en granja_completa.glb.
const animals = ['vaca', 'cerdo', 'oveja', 'gallina'];
const storageKey = 'careChecklist';
let state = {};
try { state = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {}; } catch { state = {}; }
for (const name of animals) state[name] = { fed: !!state[name]?.fed, groomed: !!state[name]?.groomed };
function render() {
  let panel = document.getElementById('carePanel');
  if (!panel) {
    panel = document.createElement('aside'); panel.id = 'carePanel';
    panel.innerHTML = '<h2>🌸 Cuidados de hoy</h2><p class="care-subtitle">Cuida a tus animalitos</p><div id="careList"></div><p id="careIndicator"></p>';
    document.body.appendChild(panel);
  }
  const list = panel.querySelector('#careList');
  const emoji = {vaca:'🐮',cerdo:'🐷',oveja:'🐑',gallina:'🐔'};
  list.replaceChildren();
  for (const name of animals) {
    const row = document.createElement('div'); row.className = 'care-row';
    const label = document.createElement('span'); label.className = 'care-name'; label.textContent = `${emoji[name]} ${name[0].toUpperCase()+name.slice(1)}`;
    const status = document.createElement('span'); status.className = 'care-status';
    status.textContent = `${state[name].fed ? '✅' : '▫️'} 🌾   ${state[name].groomed ? '✅' : '▫️'} 🪮`;
    row.append(label,status); list.appendChild(row);
  }
  const done = animals.filter(a=>state[a].fed && state[a].groomed).length;
  panel.querySelector('#careIndicator').textContent = done === animals.length ? '¡Todos cuidados! 💗' : `${done}/${animals.length} animales cuidados`;
}
function mark(name,key) {
  name = String(name).toLowerCase();
  if (!animals.includes(name)) return;
  state[name][key] = true;
  try {sessionStorage.setItem(storageKey,JSON.stringify(state));} catch {}
  render();
}
export function markFed(name) {mark(name,'fed');}
export function markGroomed(name) {mark(name,'groomed');}
render();
