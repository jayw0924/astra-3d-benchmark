export const models = [
 {id:'control',path:'public/assets/models/product-estuary.glb',url:'/public/assets/models/product-estuary.glb',bytes:10191496,sha256:'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'},
 {id:'safe',path:'research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab/candidate.glb',url:'/research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab/candidate.glb',bytes:9051644,sha256:'0c57718add772f1265f8cbb3d9f165bc3b06c73629b50f5297f31f844d32c810'},
];
export const targets=['front-three-quarter','side','rear-three-quarter','wheel-brake','mirror-window','wipers','panel-seams','interior','glass-edge'];
export function buildPlan(){return models.flatMap(model=>targets.flatMap(target=>['Estuary Enamel','Carmine Candy'].flatMap(variant=>['shaded','wireframe','silhouette'].map(mode=>({id:`${model.id}--${target}--${variant.split(' ')[0].toLowerCase()}--${mode}`,model:model.id,target,variant,mode,width:600,height:400,dpr:1})))));}
