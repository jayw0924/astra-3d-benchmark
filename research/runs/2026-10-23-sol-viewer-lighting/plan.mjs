export const model = { url:'/assets/models/product-estuary-safe.glb', path:'public/assets/models/product-estuary-safe.glb', bytes:9239404, sha256:'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4' };
export const rigs=['original','environment-only','grounded-studio'];
export const finishes=['Carmine Candy','Pearly Swirly','Torched Graphite','Estuary Enamel'];
export const targets=['front-three-quarter','side','rear-three-quarter','paint','glass','wheel'];
export const matrix=rigs.flatMap(rig=>finishes.flatMap((finish,f)=>targets.map(target=>({rig,finish,target,id:`${rig}-${f}-${target}`}))));
export const settings={width:600,height:400,dpr:1,fov:32,near:0.01,far:100,exposure:1.05,background:'#ddd9d0',rotationY:-0.22};
