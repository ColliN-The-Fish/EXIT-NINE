export const SITE={shop:{x0:-11,x1:11,z0:-5,z1:9},stock:{x0:-11,x1:11,z0:9,z1:19},office:{x0:11,x1:18,z0:9,z1:17},breaker:{x:19.65,z:19.3},radio:{x:16.25,z:14.6},hide:{x:12.5,z:15.5},loading:{x:-6,z:19},bounds:{x0:-22,x1:22,z0:-20,z1:31}};
export const NPC_SCALE=1.05;
export const inRect=(p,r)=>p.x>=r.x0&&p.x<=r.x1&&p.z>=r.z0&&p.z<=r.z1;
export const siteZone=p=>inRect(p,SITE.shop)?'shop':inRect(p,SITE.stock)?'stock':inRect(p,SITE.office)?'office':'outside';
export const OFFICE_SHIFT=7;

export function truckRise(p,s=null){if(s?.freight&&s.freight.phase!=='ready')return 0;if(p.x< -7.52||p.x> -4.48||p.z<19.35||p.z>27.35)return 0;return Math.min(1.02,Math.max(0,(p.z-19.35)/1.40*1.02));}
