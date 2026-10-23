import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import * as T from 'three';
const run='research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92';
const source='public/assets/models/product-estuary.glb',bytes=readFileSync(source);
assert.equal(createHash('sha256').update(bytes).digest('hex'),'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f');
const spec=JSON.parse(readFileSync('research/runs/2026-10-21-sol-safe-correction-comparison/control-spec.json'));
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(source),root=doc.getRoot(),objects=[];
const outer=new T.Matrix4().compose(new T.Vector3().fromArray(spec.transform.position),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),spec.transform.rotationY),new T.Vector3(1,1,1));
for(const [ni,node] of root.listNodes().entries())if(node.getMesh()){
 const mi=root.listMeshes().indexOf(node.getMesh());
 for(const [pi,p] of node.getMesh().listPrimitives().entries()){
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p.getAttribute('POSITION').getArray(),3));geo.setIndex(new T.BufferAttribute(p.getIndices().getArray(),1));
  const obj=new T.Mesh(geo,new T.MeshBasicMaterial({side:p.getMaterial()?.getDoubleSided()?T.DoubleSide:T.FrontSide}));obj.matrixAutoUpdate=false;obj.matrix.copy(outer).multiply(new T.Matrix4().fromArray(node.getWorldMatrix()));obj.updateMatrixWorld(true);obj.userData={node:ni,name:node.getName(),mesh:mi,primitive:pi};objects.push(obj);
 }
}
const camera=new T.PerspectiveCamera(spec.cameras['glass-edge'].fov,1.5,0.005,100),c=spec.cameras['glass-edge'];camera.position.fromArray(c.position);camera.lookAt(new T.Vector3().fromArray(c.target));camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
const ray=new T.Raycaster(),results=[];
for(let y=317;y<=345;y++)for(let x=410;x<=430;x++){
 ray.setFromCamera(new T.Vector2((x+0.5)/600*2-1,1-(y+0.5)/400*2),camera);
 const hits=ray.intersectObjects(objects,false).slice(0,5).map(h=>({...h.object.userData,distance:h.distance,faceIndex:h.faceIndex,point:h.point.toArray()}));results.push({pixel:[x,y],hits});
}
const nearestCounts={},regionCounts={};for(const r of results){const h=r.hits[0];if(h){const key=`${h.mesh}/${h.primitive} ${h.name}`;nearestCounts[key]=(nearestCounts[key]??0)+1;if(r.pixel[0]>=418&&r.pixel[0]<=423&&r.pixel[1]>=323&&r.pixel[1]<=339)regionCounts[key]=(regionCounts[key]??0)+1;}}
writeFileSync(`${run}/source-pixel-probe.json`,JSON.stringify({source,method:'Direct source POSITION/index ray intersection, full NodeIO world transforms and frozen outer model transform/camera; pixel centers, source material sidedness. Geometric localization, not optical causality.',camera:c,nearestCounts,regionCounts,results},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({nearestCounts,regionCounts},null,2));
