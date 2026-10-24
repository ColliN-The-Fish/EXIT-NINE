// Diegetic screen text follows information already established in the current
// shift. This module never starts an event or changes an interaction condition.
export function radioDisplay(s){
 const n=s.narrative||{},stage=n.stage;
 if(s.night===3){
  if(stage==='waitingBrief')return {rows:['暂停营业 / 接应安排待确认','先接听柜台电话'],footer:'当前无待处理电台呼叫'};
  const rows=n.flags?.busConfirmed?['接应 N9 已核实','从前门去原公交站离站']:n.flags?.busArrived?['N9 已到店前原公交站','通过前场监控确认车辆']:['接应 N9 · 店前原公交站','车辆未到前，回拨本频道核实'];
  const active=['prepare3','verifyPickup','confrontPickup'].includes(stage);
  return {rows,footer:active?'E 联系原频道 · Q 离开':n.flags?.busConfirmed?'接应已核实 · 从前门离站':n.flags?.busArrived?'先查看前场监控':'等候原频道通知'};
 }
 if(s.night===2){
  const rows=['findWorker','restorePower'].includes(stage)?['照明故障 / 先确认现场安全','恢复供电后报告原频道']:stage==='report2'?['现场异常 / 请求安全离站','停止营业 · 联系原道路频道']:['review2','settle'].includes(stage)?['返程班车暂停 / 等待安全接应','留在站点 · 保持原频道联络']:['道路联络 / 留意结冰通知','当班名单仅一人 · 无临时派工'];
  return {rows,footer:s.phase==='dawn'?'E 完成本晚交班':stage==='report2'?'E 联系原频道 · Q 离开':'当前无待处理电台呼叫'};
 }
 return {rows:['review1','report1','settle'].includes(stage)?['当班联络 / 核实临时调班','无临时派工 · 先核实再开门']:['当班联络 / 保持原频道','有异常先确认现场，再联系'],footer:s.phase==='dawn'?'E 完成本晚交班':stage==='report1'?'E 联系原频道 · Q 离开':'当前无待处理电台呼叫'};
}

export function pumpDisplay(s){
 if(!s.power)return {header:'PUMP 03 / NO POWER',body:'主电源中断 / 暂时无法授权',footer:'恢复供电后再操作'};
 const c=s.cast?.find(c=>c.pump),actor=s.actors?.find(a=>a.id===c?.id),active=actor&&!['dead','leave','vehicleEnter','vehicleDepart'].includes(actor.mode);
 if(!c||!active&&!s.pumpDone)return {header:'PUMP 03 / READY',body:'NO PENDING ORDER / 泵台待命',footer:'当前没有待处理呼叫'};
 return {header:'PUMP 03 / ORDER '+(c.pumpOrder||'2305'),body:'LAT-305 / $24.60\n预授权成功 / 出油 '+(s.pumpDone?'正常':'0.00 GAL'),footer:s.pumpDone?'授权已恢复 · Q 离开':!s.pumpChecked?'先接过司机证件，对柜台电脑按 E 查看身份与工单。':s.heldId===c.id||s.trayId===c.id?'先归还司机证件，再恢复授权 · Q 离开':'E 恢复授权 · Q 离开'};
}
