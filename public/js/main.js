import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { startGrooming } from './grooming.js';
import { markFed, markGroomed } from './checklist.js';

const container = document.getElementById('sceneContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9dc7cd);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
camera.position.set(20, 20, 20);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera,renderer.domElement);
controls.target.set(0,0,0); controls.update();
scene.add(new THREE.HemisphereLight(0xfff6df,0x718d73,2.0));
const sun = new THREE.DirectionalLight(0xffe7c0,2.0);
sun.position.set(20,35,15); sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-35;sun.shadow.camera.right=35;
sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;
scene.add(sun);
const animalObjects={};
const animalNames=['vaca','cerdo','oveja','gallina'];
new GLTFLoader().load('assets/granja_completa.glb',gltf=>{
  const root=gltf.scene;
  root.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
  // Los nodos tienen nombres exactos en el archivo GLB original.
  for(const name of animalNames){
    const obj=root.getObjectByName(name[0].toUpperCase()+name.slice(1));
    if(obj) animalObjects[name]=obj;
    else console.warn('No se encontró el animal:',name);
  }
  scene.add(root);
  console.info('Granja completa cargada');
},undefined,error=>{console.error('No se pudo cargar la granja:',error);showMessage('No se pudo cargar la granja. Revisa la consola.');});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const feedBtn=document.getElementById('feedTool'),brushBtn=document.getElementById('brushTool');
const message=document.createElement('div'); message.id='instruction';document.body.appendChild(message);
let activeTool='feed',selected=null,selector=null,feeding=new Set();
function showMessage(text){message.textContent=text;}
function setTool(tool){
  activeTool=tool;feedBtn.classList.toggle('active',tool==='feed');brushBtn.classList.toggle('active',tool==='brush');
  showMessage(tool==='brush'?'Selecciona un animal para peinarlo 🪮':'Selecciona un animal para alimentarlo 🌾');
}
feedBtn.addEventListener('click',()=>setTool('feed'));
brushBtn.addEventListener('click',()=>setTool('brush'));
setTool('feed');
function updateSelection(name){
  if(selector){scene.remove(selector);selector.geometry.dispose();selector.material.dispose();selector=null;}
  selected=name;
  if(name){selector=new THREE.BoxHelper(animalObjects[name],0xffda78);scene.add(selector);showMessage(name+' seleccionado · vuelve a tocarlo para '+(activeTool==='feed'?'alimentarlo':'peinarlo'));}
}
function animalFromClick(event){
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(Object.values(animalObjects),true);
  for(const hit of hits){
    for(const [name,animal] of Object.entries(animalObjects)){
      let obj=hit.object;
      while(obj){if(obj===animal)return name;obj=obj.parent;}
    }
  }
  return null;
}
renderer.domElement.addEventListener('click',e=>{
  const name=animalFromClick(e);
  if(!name){updateSelection(null);return;}
  if(selected!==name){updateSelection(name);return;}
  if(activeTool==='feed')feedAnimal(name);
  else {
    // Start grooming for any animal
    updateSelection(null);
    startGrooming(animalObjects[name], name, () => {
      markGroomed(name);
      showMessage(`¡${name.charAt(0).toUpperCase()+name.slice(1)} ya recibió sus cuidados! 💗`);
    });
  }

});
function heartAbove(name){
  const animal=animalObjects[name];if(!animal)return;
  animal.updateWorldMatrix(true,true);
  const box=new THREE.Box3().setFromObject(animal);
  const top=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y+0.35,(box.min.z+box.max.z)/2);
  top.project(camera);
  if(top.z>1)return;
  const el=document.createElement('div');el.className='floating-heart';el.textContent='❤️';
  el.style.left=`${(top.x+1)/2*innerWidth}px`;el.style.top=`${(1-top.y)/2*innerHeight}px`;
  document.body.appendChild(el);el.addEventListener('animationend',()=>el.remove());
}
function feedAnimal(name){
  const obj=animalObjects[name];if(!obj||feeding.has(name))return;
  feeding.add(name);markFed(name);heartAbove(name);
  // No desplazamos el animal: el efecto visual se hace sin cambiar la escena original.
  const start=performance.now();
  function tick(now){
    if(now-start<450)requestAnimationFrame(tick);
    else feeding.delete(name);
  }
  requestAnimationFrame(tick);
}
function loop(){requestAnimationFrame(loop);if(selector)selector.update();controls.update();renderer.render(scene,camera);}
loop();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
