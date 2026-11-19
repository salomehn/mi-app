// Minijuego aislado de la escena principal: no mueve ni oculta animales originales.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let activeGame=null;
export function startGrooming(original,name,onComplete){
  const animalNames = ['vaca', 'cerdo', 'oveja', 'gallina'];
  if(activeGame || !original || !animalNames.includes(name)) return;
  const overlay=document.createElement('section');overlay.id='groomOverlay';
  const animalLabels = { vaca: 'la vaquita', cerdo: 'el cerdito', oveja: 'la ovejita', gallina: 'la gallinita' };
  overlay.innerHTML=`<header class="groom-header"><button id="groomBack">← Volver a la granja</button><span>🪮 Peina a ${animalLabels[name]}</span></header><div class="groom-progress"><div id="groomFill"></div></div><p class="groom-hint">Mantén presionado y pasa el cepillo por los mechones</p>`;
  document.body.appendChild(overlay);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xf6e7dd);
  const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,0.1,100);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
  overlay.insertBefore(renderer.domElement,overlay.firstChild);
  const game={scene,camera,renderer,overlay,raf:null,brush:null,tufts:[],down:false,finished:false,closing:false,originalScale:null};
  activeGame=game;
  scene.add(new THREE.HemisphereLight(0xffffff,0xc29c91,2.5));
  const light=new THREE.DirectionalLight(0xffffff,2.0);light.position.set(3,7,7);scene.add(light);
  // Copiamos el objeto, nunca se modifica la malla ni la escena de la granja.
  const clone=original.clone(true);
  clone.traverse(node=>{if(node.isMesh){node.material=node.material.clone();}});
  const modelGroup=new THREE.Group();modelGroup.add(clone);scene.add(modelGroup);
  const box=new THREE.Box3().setFromObject(modelGroup);
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3());
  clone.position.sub(center);
  const factor=2.1/Math.max(size.x,size.y,size.z,0.1);
  modelGroup.scale.setScalar(factor);
  camera.position.set(0,0.65,Math.max(4.5,3.4/(camera.aspect||1)));
  camera.lookAt(0,0,0);
  modelGroup.updateWorldMatrix(true,true);
  const ray=new THREE.Raycaster();const pointer=new THREE.Vector2();
  const fill=overlay.querySelector('#groomFill');
  // Mechones visuales diferentes para cada especie; no se altera el GLB.
  const settings = {
    oveja: {count:48, radius:.045, length:.16, color:0xfaf3e7, sides:5},
    vaca: {count:28, radius:.022, length:.085, color:0xe2d5ba, sides:5},
    cerdo: {count:20, radius:.014, length:.08, color:0xbd8b84, sides:5},
    gallina: {count:24, radius:.045, length:.095, color:0xf9ead2, sides:6}
  }[name];
  const tuftGeom=new THREE.ConeGeometry(settings.radius,settings.length,settings.sides);
  const tuftMat=new THREE.MeshStandardMaterial({color:settings.color,roughness:1});
  // Repartir mechones sobre superficies visibles del animal, no en el aire.
  const sampledBox=new THREE.Box3().setFromObject(modelGroup),sz=sampledBox.getSize(new THREE.Vector3());
  let attempts=0;
  while(game.tufts.length<settings.count && attempts++<Math.max(450,settings.count*12)){
    const x=THREE.MathUtils.lerp(sampledBox.min.x,sampledBox.max.x,Math.random());
    const y=THREE.MathUtils.lerp(sampledBox.min.y,sampledBox.max.y,Math.random());
    ray.set(new THREE.Vector3(x,y,sampledBox.max.z+3),new THREE.Vector3(0,0,-1));
    const hit=ray.intersectObject(modelGroup,true)[0];
    if(!hit)continue;
    const tuft=new THREE.Mesh(tuftGeom,tuftMat);
    tuft.position.copy(hit.point).addScaledVector(hit.face.normal.clone().transformDirection(hit.object.matrixWorld),0.045);
    tuft.rotation.set((Math.random()-.5)*.9,(Math.random()-.5)*.9,(Math.random()-.5)*.9);
    scene.add(tuft);game.tufts.push(tuft);
  }
  const originalTufts=game.tufts.length;
  if(!originalTufts) {
    console.warn('No se pudieron colocar mechones sobre',name);
    overlay.querySelector('.groom-hint').textContent='No se pudieron generar mechones para este animal';
  }
  const cursor=new THREE.Mesh(new THREE.SphereGeometry(.065,8,6),new THREE.MeshStandardMaterial({color:0xf7a9c2}));
  cursor.visible=false;scene.add(cursor);
  const loader=new GLTFLoader();
  loader.load('assets/cepillo.glb',gltf=>{
    if(game.closing){return;}
    game.brush=gltf.scene;
    const b=new THREE.Box3().setFromObject(game.brush),bounds=b.getSize(new THREE.Vector3());
    game.brush.scale.setScalar(.4/Math.max(bounds.x,bounds.y,bounds.z,.01));
    scene.add(game.brush); game.brush.visible=false;
  },undefined,error=>console.error('No se pudo cargar el cepillo GLB:',error));
  function pointerCoords(e){
    const r=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(pointer,camera);
  }
  function onMove(e){
    pointerCoords(e);
    const hit=ray.intersectObject(modelGroup,true)[0];
    if(game.brush){game.brush.visible=!!hit;if(hit)game.brush.position.copy(hit.point).add(new THREE.Vector3(0,.18,.13));}
    cursor.visible=!game.brush&&!!hit;if(hit)cursor.position.copy(hit.point);
    if(!game.down||!hit||game.finished)return;
    // Se eliminan solo mechones próximos a una pasada real del cepillo.
    for(const tuft of [...game.tufts]){
      if(tuft.position.distanceTo(hit.point)<.22){
        scene.remove(tuft);game.tufts.splice(game.tufts.indexOf(tuft),1);
      }
    }
    const pct=originalTufts?Math.round(100*(originalTufts-game.tufts.length)/originalTufts):100;
    fill.style.width=pct+'%';
    if(pct>=100)finish();
  }
  function onDown(e){if(e.button!==0||game.finished||!originalTufts)return;game.down=true;renderer.domElement.setPointerCapture(e.pointerId);onMove(e);}
  function onUp(){game.down=false;}
  function onResize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
  function close(){
    if(game.closing)return;game.closing=true;
    renderer.domElement.removeEventListener('pointerdown',onDown);
    renderer.domElement.removeEventListener('pointermove',onMove);
    window.removeEventListener('pointerup',onUp);window.removeEventListener('resize',onResize);
    if(game.raf)cancelAnimationFrame(game.raf);
    game.tufts.forEach(t=>scene.remove(t));tuftGeom.dispose();tuftMat.dispose();
    if(game.brush){game.brush.traverse(c=>{if(c.isMesh){c.geometry?.dispose();}});}
    renderer.dispose();overlay.remove();activeGame=null;
  }
  function finish(){
    if(game.finished)return;game.finished=true;game.down=false;
    overlay.querySelector('.groom-hint').textContent='¡Qué linda quedó! ❤️';
    const heart=document.createElement('div');heart.className='groom-heart';heart.textContent='💗';overlay.appendChild(heart);
    if(typeof onComplete==='function')onComplete();
    // No cerrar inmediatamente: la persona ve que ha terminado.
    overlay.querySelector('#groomBack').textContent='← Volver a la granja';
  }
  overlay.querySelector('#groomBack').addEventListener('click',close);
  renderer.domElement.addEventListener('pointerdown',onDown);
  renderer.domElement.addEventListener('pointermove',onMove);
  window.addEventListener('pointerup',onUp);
  window.addEventListener('resize',onResize);
  function frame(){if(game.closing)return;game.raf=requestAnimationFrame(frame);renderer.render(scene,camera);}
  frame();
}
