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
 function material(){const m=new THREE.MeshStandardMaterial({color:0x849da7,roughness:.7,metalness:.02});materials.push(m);return m;}
 function mesh(geometry,pos,scale,area,name){const m=new THREE.Mesh(geometry,material());m.position.set(...pos);if(scale)m.scale.set(...scale);m.userData={area,name};body.add(m);parts.push(m);return m;}
 // Continuous CC0 MakeHuman mesh. Surface regions are approximate navigation zones.
 const script=document.querySelector('script[src*="body-map.js"]');
 fetch(new URL('assets/body-human.json',script.src),{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('model');return r.json()}).then(data=>{
  const full=new THREE.BufferGeometry();full.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));full.setIndex(data.indices);full.computeVertexNormals();const surface=full.toNonIndexed(),p=surface.attributes.position,n=surface.attributes.normal;
  const zones=new Map();const names={Brain:'Head / nervous system',Heart:'Chest / circulation',Lungs:'Chest / respiration',Digestive:'Abdomen / digestive system',Kidneys:'Lower abdomen / urinary system',Bones:'Limbs / bones and joints'};
  for(let i=0;i<p.count;i+=3){const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3;
   const area=y>2.86?'Brain':y<1.63||Math.abs(x)>.35?'Bones':y<1.91?'Kidneys':y<2.22?'Digestive':x>.015&&x<.19&&y<2.57?'Heart':'Lungs';
   if(!zones.has(area))zones.set(area,{positions:[],normals:[]});const zone=zones.get(area);for(let j=0;j<3;j++){zone.positions.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));zone.normals.push(n.getX(i+j),n.getY(i+j),n.getZ(i+j))}
  }
  for(const [area,zone] of zones){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(zone.positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(zone.normals,3));mesh(geometry,[0,0,0],null,area,names[area]);}
  full.dispose();surface.dispose();sync();status.textContent='Drag to rotate · select a region to explore';
 }).catch(()=>{status.textContent='The body model could not load. Use the body-system buttons to explore trials.'});
 const floor=new THREE.Mesh(new THREE.CircleGeometry(.88,64),new THREE.MeshBasicMaterial({color:0x4bbbae,transparent:true,opacity:.12,side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=.015;scene.add(floor);
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function render(){body.rotation.set(pitch,yaw,0);camera.zoom=zoom;camera.updateProjectionMatrix();renderer.render(scene,camera)}
 function recolor(){const isDark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);parts.forEach(p=>{const active=p.userData.area===selected||selected==='Skin'||selected==='Blood',over=p===hover;p.material.color.set(over?0x9dd6ce:active?0x6fbdb2:isDark?0xa7b5bf:0xb9c5cc);p.material.emissive.set(active?0x0b3b36:0x000000);p.material.emissiveIntensity=active?.25:0});render()}
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
 new MutationObserver(sync).observe(document.getElementById('areas'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});document.addEventListener('dh-theme-change',recolor);sync();resize();
 }
}
