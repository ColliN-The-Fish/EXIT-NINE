// Camera numbering is shared by the physical screen, controls and F2 tests.
export const CCTV_VIEWS=[
 {id:'store',label:'CAM 01 / STORE / 店内',view:[9.1,3.13,-4.1,-3,1.15,3.5]},
 {id:'stock',label:'CAM 02 / STOCKROOM / 后仓',view:[9.7,3.12,18,-5,1.05,12]},
 {id:'rear',label:'CAM 03 / REAR YARD / 后仓外',view:[10.3,4.1,19.8,-4,1.1,25.8]},
 {id:'front',label:'CAM 04 / FORECOURT / 店前外',view:[10.2,4.0,-5.7,-7,.8,-15.5]}
];
export const CCTV_BUS_VIEW=[-9.5,3,-17.4,-15.1,1.5,-18.3];
export function cctvView(index,busArrived=false){return index===3&&busArrived?CCTV_BUS_VIEW:CCTV_VIEWS[index]?.view||CCTV_VIEWS[0].view;}
export function cctvLabel(index,busArrived=false){return index===3&&busArrived?'CAM 04 / BUS STOP / N9':(CCTV_VIEWS[index]||CCTV_VIEWS[0]).label;}
