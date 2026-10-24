import {PRODUCTS,DENOMINATIONS,initialTill,tillValue} from './night-data.js';
export const basketTotal=basket=>basket.reduce((n,id)=>n+PRODUCTS[id].price,0);
export const newLedger=()=>({till:initialTill(),openingFloat:tillValue(initialTill()),sales:0,transactions:[],cashErrors:0});
export function newTransaction(c){return {id:c.id,items:[...c.basket],scanned:[],stage:'scan',total:0,tender:c.cash,selected:{},change:0,disputes:0,selection:0,message:'逐件拿过扫描器，全部扫描后顾客才会付款。'};}
export function scanProduct(t,index){if(!t||t.stage!=='scan'||!Number.isInteger(index)||!t.items[index]||t.scanned.includes(index))return false;t.scanned.push(index);t.total+=PRODUCTS[t.items[index]].price;if(t.scanned.length===t.items.length){t.stage='cash';t.message='商品已全部扫描。收下顾客放在柜台上的现金。';}return true;}
export function takeTender(t,ledger){if(!t||t.stage!=='cash'||t.tender<t.total)return false;ledger.till[t.tender]=(ledger.till[t.tender]||0)+1;t.stage='change';t.message='现金已收妥。打开钱箱，鼠标点击面额直接交给顾客。';return true;}
export function selectCash(t,ledger,value,remove=false){if(!t||t.stage!=='change'||!DENOMINATIONS.includes(value))return false;const count=t.selected[value]||0;if(remove){if(!count)return false;t.selected[value]--;t.change-=value;return true;}if(count>=(ledger.till[value]||0))return false;t.selected[value]=count+1;t.change+=value;return true;}
export function clearCash(t){if(!t||t.stage!=='change')return false;t.selected={};t.change=0;return true;}
export function handChange(t,ledger){if(!t||t.stage!=='change')return false;const due=t.tender-t.total;if(t.change!==due){t.disputes++;ledger.cashErrors++;t.message=t.change<due?'顾客：「这不够吧？麻烦再算一下。」':'找多了，请重新找零。Backspace 可收回本次找零。';return false;}for(const [value,count]of Object.entries(t.selected))ledger.till[value]-=count;t.stage='receipt';t.message='找零正确，正在自动结账。';return true;}
export function finishReceipt(t,ledger){if(!t||t.stage!=='receipt'||ledger.transactions.some(v=>v.id===t.id))return false;ledger.sales+=t.total;ledger.transactions.push({id:t.id,total:t.total,tender:t.tender,change:t.change,items:[...t.items]});t.stage='complete';return true;}
export function cancelCheckout(t,ledger){if(!t)return true;if(['receipt','complete'].includes(t.stage))return false;if(t.stage==='change'){ledger.till[t.tender]--;t.selected={};t.change=0;}t.stage='cancelled';return true;}
export function ledgerBalanced(ledger){return tillValue(ledger.till)-ledger.openingFloat===ledger.sales;}

// A click hands one denomination to the customer. Partial amounts remain in the
// transaction escrow; commit once, when exact. A refused excess piece is returned.
export function deliverCash(t,ledger,value){
 if(!selectCash(t,ledger,value))return {ok:false,reason:'empty'};
 const due=t.tender-t.total;
 if(t.change>due){selectCash(t,ledger,value,true);t.disputes++;t.message='找多了，请重新找零。刚才多选的面额未交付；Backspace 可收回本次找零。';return {ok:false,reason:'excess'};}
 if(t.change===due){handChange(t,ledger);return {ok:true,complete:true};}
 t.message='已直接交给顾客；还差 '+((due-t.change)/100).toFixed(2)+' 美元。';return {ok:true,complete:false};
}

// Return every piece of this transaction, including correctly handed change
// before the receipt is issued. Stage transition prevents duplicate refunds.
export function canRecallChange(t){return !!t&&['change','receipt'].includes(t.stage)&&t.change>0;}
export function recallChange(t,ledger){if(!canRecallChange(t)||ledger.transactions.some(x=>x.id===t.id))return false;const returned=t.change;if(t.stage==='receipt')for(const[value,count]of Object.entries(t.selected))ledger.till[value]=(ledger.till[value]||0)+count;t.stage='change';t.selected={};t.change=0;t.recalled=(t.recalled||0)+1;t.message='顾客把本次找零全部退回（'+(returned/100).toFixed(2)+' 美元）。请重新取钱；付款现金仍然保留。';return true;}

// Refusing service returns the original tender and recalls any committed change.
export function refundCheckout(t,ledger){if(!t||['complete','cancelled'].includes(t.stage))return false;if(t.stage==='receipt')for(const[value,count]of Object.entries(t.selected))ledger.till[value]=(ledger.till[value]||0)+count;if(['change','receipt'].includes(t.stage))ledger.till[t.tender]=(ledger.till[t.tender]||0)-1;t.selected={};t.change=0;t.stage='cancelled';return true;}
