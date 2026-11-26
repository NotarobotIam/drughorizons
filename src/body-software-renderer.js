// Projects the same 3D meshes to Canvas 2D when GPU rendering is unavailable.
import { Vector3, Color, Matrix3 } from 'three';
export function softwareRenderer(canvas){
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');let width=1,height=1;
 const a=new Vector3(),b=new Vector3(),c=new Vector3(),normal=new Vector3(),edge=new Vector3(),sun=new Vector3(-.5,.7,1).normalize(),color=new Color(),normalMatrix=new Matrix3();
 return {setPixelRatio(){},setSize(w,h){width=w;height=h;canvas.width=w;canvas.height=h},render(scene,camera){
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);ctx.clearRect(0,0,width,height);const triangles=[];
  scene.traverse(mesh=>{if(!mesh.isMesh)return;const geo=mesh.geometry,pos=geo.attributes.position,index=geo.index,mat=mesh.material;if(!pos||!mat)return;normalMatrix.getNormalMatrix(mesh.matrixWorld);const normals=geo.attributes.normal;
   for(let i=0,n=index?index.count:pos.count;i<n;i+=3){const ia=index?index.getX(i):i,ib=index?index.getX(i+1):i+1,ic=index?index.getX(i+2):i+2;
    a.fromBufferAttribute(pos,ia).applyMatrix4(mesh.matrixWorld);b.fromBufferAttribute(pos,ib).applyMatrix4(mesh.matrixWorld);c.fromBufferAttribute(pos,ic).applyMatrix4(mesh.matrixWorld);
    if(normals){normal.fromBufferAttribute(normals,ia).add(edge.fromBufferAttribute(normals,ib)).add(edge.fromBufferAttribute(normals,ic)).applyMatrix3(normalMatrix).normalize()}else normal.subVectors(b,a).cross(edge.subVectors(c,a)).normalize();const brightness=.42+Math.max(0,normal.dot(sun))*.7; color.copy(mat.color).multiplyScalar(brightness);const fill='#'+color.getHexString();
    a.project(camera);b.project(camera);c.project(camera);if(a.z>1||b.z>1||c.z>1)continue;
    // Backface culling in projected screen coordinates.
    if(mat.side!==2&&(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)<=0)continue;
    triangles.push({xy:[(a.x+1)*width/2,(1-a.y)*height/2,(b.x+1)*width/2,(1-b.y)*height/2,(c.x+1)*width/2,(1-c.y)*height/2],z:(a.z+b.z+c.z)/3,fill,alpha:mat.transparent?mat.opacity:1});
   }
  });
  triangles.sort((a,b)=>b.z-a.z);for(const t of triangles){ctx.globalAlpha=t.alpha;ctx.fillStyle=t.fill;ctx.beginPath();ctx.moveTo(t.xy[0],t.xy[1]);ctx.lineTo(t.xy[2],t.xy[3]);ctx.lineTo(t.xy[4],t.xy[5]);ctx.closePath();ctx.fill();if(t.alpha===1){ctx.strokeStyle=t.fill;ctx.lineWidth=.6;ctx.stroke()}}ctx.globalAlpha=1;
 }};
}
