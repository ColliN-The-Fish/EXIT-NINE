// Rear freight lane stays clear (z >= 28). The breaker is reached around the
// east side of the building, not through the delivery truck's working apron.
export const SCRAP_BARRIER=[
 {x:11.9,z:21.8,w:1.65,d:2.8,kind:'cage'},
 {x:13.9,z:22.2,w:1.8,d:2.0,kind:'pallet'},
 {x:15.65,z:22.2,w:1.55,d:2.2,kind:'barrels'},
 {x:17.25,z:22.15,w:1.65,d:2.7,kind:'appliances'},
 {x:19.2,z:22.5,w:1.55,d:1.9,kind:'barrels'},
 {x:4.2,z:23.1,w:1.8,d:1.6,kind:'pallet'},
 {x:7.1,z:24.4,w:1.5,d:1.5,kind:'appliances'}
];
export const WEED_BEDS=[
 {id:'alley-wall',x0:18.22,x1:18.72,z0:7.6,z1:17.8,count:360,min:.48,max:1.12},
 {id:'alley-fence',x0:21.35,x1:22.05,z0:7.4,z1:23.7,count:640,min:.65,max:1.65},
 {id:'rear-barrier',x0:11.3,x1:20.7,z0:20.7,z1:24.7,count:1180,min:.85,max:2.15},
 {id:'west-yard-edge',x0:-13.9,x1:-12.8,z0:20.0,z1:28.0,count:360,min:.5,max:1.55},
 {id:'rear-stores',x0:2.0,x1:8.4,z0:23.5,z1:25.5,count:390,min:.6,max:1.6}
];
export function inWeedBed(x,z){return WEED_BEDS.some(b=>x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1);}
