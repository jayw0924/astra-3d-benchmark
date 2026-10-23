export const models = [
 {id:'control',path:'public/assets/models/product-estuary.glb',url:'/public/assets/models/product-estuary.glb',bytes:10191496,sha256:'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'},
 {id:'safe',path:'research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/candidate.glb',url:'/research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/candidate.glb',bytes:9239404,sha256:'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'},
];
export const targets=['front-three-quarter','side','rear-three-quarter','wheel-brake','mirror-window','wipers','panel-seams','interior','glass-edge'];
export function buildPlan(){return models.flatMap(model=>targets.flatMap(target=>['Estuary Enamel','Carmine Candy'].flatMap(variant=>['shaded','wireframe','silhouette'].map(mode=>({id:`${model.id}--${target}--${variant.split(' ')[0].toLowerCase()}--${mode}`,model:model.id,target,variant,mode,width:600,height:400,dpr:1})))));}
