import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {Box3,Matrix4,Vector3} from 'three';
import {writeFile} from 'node:fs/promises';
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).read('public/assets/models/product-estuary-safe.glb');
const bounds=new Box3(), rows=[];
for(const node of doc.getRoot().listNodes())for(const primitive of node.getMesh()?.listPrimitives()??[]){
 const p=primitive.getAttribute('POSITION'), positions=p.getArray(),local=new Box3();
 for(let i=0;i<positions.length;i+=3)local.expandByPoint(new Vector3(positions[i],positions[i+1],positions[i+2]));
 const matrix=new Matrix4().fromArray(node.getWorldMatrix()),box=local.clone().applyMatrix4(matrix);bounds.union(box);
 let min=Infinity;for(let i=0;i<positions.length;i+=3)min=Math.min(min,new Vector3(positions[i],positions[i+1],positions[i+2]).applyMatrix4(matrix).y);
 rows.push({node:node.getName(),material:primitive.getMaterial()?.getName(),conservativeY:box.min.y,preciseY:min,worldMatrix:matrix.toArray()});
}
const center=bounds.getCenter(new Vector3()),offset=-center.y+bounds.getSize(new Vector3()).y/2;
for(const row of rows){row.viewerConservativeY=row.conservativeY+offset;row.viewerPreciseY=row.preciseY+offset;}
rows.sort((a,b)=>a.viewerConservativeY-b.viewerConservativeY);
await writeFile(new URL('raw-glb-bounds.json',import.meta.url),JSON.stringify({rawBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},viewerVerticalOffset:offset,note:'Viewer rotation is around Y only; it does not alter Y minima. No asset writes.',rows},null,2));
console.log(JSON.stringify(rows.slice(0,6),null,2));
