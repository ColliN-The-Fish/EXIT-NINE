import {perfectDisguise} from './mimicry.js';
// Echo measurements provide a physical clue, never an identity verdict.
export const SCAN_SECONDS=2.4;
export const SCAN_COOLDOWN=3;
export function scanReading(c){
 if(perfectDisguise(c))return '本次姿态下回波连续，未发现身体结构异常。高拟态个体可能维持正常结构；仍须核对身份、工单与陈述，正常回波不能证明权限。';
 const readings={joint:'左肘出现两组互相垂直的关节回波；与正常单轴弯曲不符。',gap:'掌心与所持物之间有连续空隙，物体的运动回波仍与手同步。',neck:'颈部回波长度不稳定，头部位移先于颈椎连续信号。'};
 return readings[c.anomaly]||'本次姿态下，关节与物体接触回波连续。单次扫描不能证明身份或员工权限。';
}
export function scannerReady(s){return !!s.scannerOwned&&!s.hidden&&!s.carry&&!s.boardCarry&&!s.trapCarry&&!s.finished;}
