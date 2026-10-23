export const models = [
 {id:'control',path:'public/assets/models/product-estuary.glb',url:'/public/assets/models/product-estuary.glb',bytes:10191496,sha256:'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'},
 {id:'safe',path:'research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b/candidate.glb',url:'/research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b/candidate.glb',bytes:9198676,sha256:'a30deb208c7c1c4b23859edbb57d2c9d1cb1ad828e00c9431d4ebc29a47d9bce'},
];
export const targets=['wipers','glass-edge'];
export function buildPlan(){return models.flatMap(model=>targets.flatMap(target=>['Estuary Enamel','Carmine Candy'].flatMap(variant=>['shaded','wireframe'].map(mode=>({id:`${model.id}--${target}--${variant.split(' ')[0].toLowerCase()}--${mode}`,model:model.id,target,variant,mode,width:600,height:400,dpr:1})))));}
