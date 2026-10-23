export const models = [
 {id:'control',path:'public/assets/models/product-estuary.glb',url:'/public/assets/models/product-estuary.glb',bytes:10191496,sha256:'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'},
 {id:'mobile',path:'research/runs/2026-10-22-astra-geometry-mobile-bd8abb4a578f/candidate.glb',url:'/research/runs/2026-10-22-astra-geometry-mobile-bd8abb4a578f/candidate.glb',bytes:9195792,sha256:'3d652b91d18e13910a03fb595b0ce9386c424ab39eb72187f17a6de7eaeb3c5b'},
];
export const targets=['front-three-quarter','side','rear-three-quarter','wheel-brake','mirror-window','wipers','panel-seams','interior','glass-edge'];
export function buildPlan(){return models.flatMap(model=>targets.flatMap(target=>['Estuary Enamel','Carmine Candy'].flatMap(variant=>['shaded','wireframe','silhouette'].map(mode=>({id:`${model.id}--${target}--${variant.split(' ')[0].toLowerCase()}--${mode}`,model:model.id,target,variant,mode,width:600,height:400,dpr:1})))));}
