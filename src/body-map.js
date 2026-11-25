import * as THREE from 'three';
import { softwareRenderer } from './body-software-renderer.js';
const host=document.getElementById('bodyMap');
if(host){
 const canvas=host.querySelector('canvas'),status=document.getElementById('bodyMapStatus'),label=document.getElementById('bodyMapSelection');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});}catch{try{renderer=softwareRenderer(canvas)}catch{} if(!renderer){status.textContent='3D is unavailable in this browser. Use the body-system buttons to explore trials.';canvas.hidden=true;host.classList.add('body-map-unavailable');}}
 if(renderer){
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.1,50);camera.position.set(0,1.8,8.8);camera.lookAt(0,1.8,0);
 scene.add(new THREE.HemisphereLight(0xe8ffff,0x334751,2.4));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-3,5,5);scene.add(light);const rim=new THREE.DirectionalLight(0x63ddd0,2);rim.position.set(3,3,-4);scene.add(rim);
 const body=new THREE.Group();scene.add(body);let yaw=-.2,pitch=0,zoom=1,selected='Brain',hover=null;
 const parts=[],materials=[];
 function material(){const m=new THREE.MeshStandardMaterial({color:0x849da7,roughness:.48,metalness:.12});materials.push(m);return m;}
 function mesh(geometry,pos,scale,area,name){const m=new THREE.Mesh(geometry,material());m.position.set(...pos);if(scale)m.scale.set(...scale);m.userData={area,name};body.add(m);parts.push(m);return m;}
 const sphere=new THREE.SphereGeometry(1,24,16);
 function ellipsoid(pos,scale,area,name){return mesh(sphere,pos,scale,area,name)}
 function segment(a,b,r1,r2,area,name){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const m=mesh(new THREE.CylinderGeometry(r2,r1,delta.length(),18),start.clone().add(end).multiplyScalar(.5).toArray(),null,area,name);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
 // Original, schematic body geometry; regions are navigation aids, not anatomical boundaries.
 ellipsoid([0,3.13,0],[.225,.31,.205],'Brain','Head / brain');
 ellipsoid([0,3.04,.145],[.155,.18,.09],'Brain','Head / brain');
 ellipsoid([0,3.1,.224],[.035,.065,.045],'Brain','Head / brain');
 segment([0,2.62,0],[0,2.9,0],.12,.105,'Brain','Neck / nervous system');
 const torsoPoints=[[0,1.54],[.21,1.54],[.285,1.65],[.26,1.83],[.285,2.08],[.345,2.36],[.37,2.53],[.30,2.64],[.13,2.71],[0,2.71]].map(([x,y])=>new THREE.Vector2(x,y));
 const torso=mesh(new THREE.LatheGeometry(torsoPoints,32),[0,0,0],[1,1,.64],'Heart','Chest / circulation');
 // Subtle surface zones provide visible, selectable research regions on the torso.
 ellipsoid([0,1.9,.04],[.267,.30,.185],'Digestive','Abdomen / digestive system');
 ellipsoid([0,1.56,0],[.30,.205,.19],'Kidneys','Pelvis / urinary system');
 for(const side of [-1,1]){
  const x=v=>side*v;
  ellipsoid([x(.37),2.5,0],[.16,.175,.15],'Bones','Shoulder / joints');
  segment([x(.41),2.46,0],[x(.59),1.99,.015],.135,.095,'Bones','Arm / bones and joints');
  ellipsoid([x(.59),1.99,.015],[.10,.11,.10],'Bones','Elbow / joints');
  segment([x(.60),1.98,.015],[x(.72),1.55,.04],.095,.062,'Bones','Forearm / bones and joints');
  ellipsoid([x(.735),1.43,.045],[.075,.135,.045],'Bones','Hand / joints');
  for(let f=0;f<4;f++)ellipsoid([x(.69+f*.027),1.30-(f===0||f===3?.005:.025),.052],[.015,.065,.019],'Bones','Hand / joints');
  ellipsoid([x(.66),1.45,.09],[.027,.07,.028],'Bones','Hand / joints').rotation.z=side*-.5;
  segment([x(.16),1.52,0],[x(.175),.86,.025],.155,.105,'Bones','Thigh / bones and joints');
  ellipsoid([x(.175),.84,.025],[.108,.12,.10],'Bones','Knee / joints');
  segment([x(.175),.82,.025],[x(.19),.20,0],.105,.065,'Bones','Lower leg / bones and joints');
  ellipsoid([x(.18),.56,-.025],[.105,.23,.105],'Bones','Lower leg / bones and joints');
  ellipsoid([x(.19),.12,.09],[.092,.09,.21],'Bones','Foot / joints');
 }
 // Chest research markers, positioned on the front surface, are schematic locations.
 const markers=[];
 function marker(pos,area,name,r){const m=ellipsoid(pos,[r,r*.9,r*.45],area,name);markers.push(m);return m;}
 marker([.105,2.34,.235],'Heart','Heart & circulation',.07);
 marker([-.14,2.39,.21],'Lungs','Lungs & respiration',.065);marker([.19,2.42,.19],'Lungs','Lungs & respiration',.055);
 marker([0,2.00,.22],'Digestive','Digestive system',.075);
 marker([-.13,1.74,.19],'Kidneys','Kidneys & urinary system',.05);marker([.13,1.74,.19],'Kidneys','Kidneys & urinary system',.05);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(.88,64),new THREE.MeshBasicMaterial({color:0x4bbbae,transparent:true,opacity:.12,side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=.015;scene.add(floor);
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function render(){body.rotation.set(pitch,yaw,0);camera.zoom=zoom;camera.updateProjectionMatrix();renderer.render(scene,camera)}
 function recolor(){const isDark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);parts.forEach(p=>{const active=p.userData.area===selected||selected==='Skin'||selected==='Blood',over=p===hover;p.material.color.set(over?0xa3f3df:active?0x33b6a9:isDark?0x8faab5:0x9aafb9);p.material.emissive.set(active?0x0b3b36:0x000000);p.material.emissiveIntensity=active?.25:0});markers.forEach(p=>{if(p!==hover&&p.userData.area!==selected)p.material.color.set(0x467e87)});render()}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render()}
 new ResizeObserver(resize).observe(host);
 function hit(event){const box=canvas.getBoundingClientRect();pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(parts,false)[0]?.object||null}
 function select(area){const button=document.querySelector(`#areas [data-area="${area}"]`);button?.click()}
 let drag=null;
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved ||= Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5;if(drag.moved){yaw+=dx*.009;pitch=THREE.MathUtils.clamp(pitch+dy*.004,-.3,.3);render()}drag.x=e.clientX;drag.y=e.clientY;}else{const next=hit(e);if(next!==hover){hover=next;canvas.style.cursor=hover?'pointer':'grab';status.textContent=hover?hover.userData.name+' · select to explore research':'Drag to rotate · select a region to explore';recolor()}}});
 canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved){const target=hit(e);if(target)select(target.userData.area)}drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null});canvas.addEventListener('pointerleave',()=>{if(!drag){hover=null;recolor()}});
 function rotate(delta){yaw+=delta;render()}
 document.getElementById('bodyRotateLeft').onclick=()=>rotate(-Math.PI/6);document.getElementById('bodyRotateRight').onclick=()=>rotate(Math.PI/6);document.getElementById('bodyReset').onclick=()=>{yaw=-.2;pitch=0;zoom=1;render()};document.getElementById('bodyZoomIn').onclick=()=>{zoom=Math.min(1.5,zoom+.1);render()};document.getElementById('bodyZoomOut').onclick=()=>{zoom=Math.max(.8,zoom-.1);render()};
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(e.key==='ArrowLeft'?-.2:.2)}});
 function sync(){const active=document.querySelector('#areas [aria-pressed="true"]');selected=active?.dataset.area||'Brain';label.textContent=active?document.getElementById('areaLabel').textContent:'Choose a body system';recolor()}
 new MutationObserver(sync).observe(document.getElementById('areas'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});document.addEventListener('dh-theme-change',recolor);sync();resize();status.textContent='Drag to rotate · select a region to explore';
 }
}
