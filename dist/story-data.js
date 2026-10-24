// Story-only revision: all actors, props and locations reuse the existing scene.
export const STORY_VERSION=14;
export const RENT_TARGET=30000;
export const RENT_START=12000;
export const STORY_POINTS={worker:{x:-3.35,z:5.8},stop:{x:-13.15,z:-16.2},impostor:{x:.5,z:-7.2}};
const line=(speaker,actor,text,shot='wide',hold=0)=>({speaker,actor,text,shot,hold});
export const STORY_SCRIPTS={
 transition2:[line('亚历克斯','alex','天亮了。第一班的钱已经记到账上，离租房首付款还差一些。','black',9.2),line('亚历克斯','alex','假调班已经取消。本不会过来。睡几个小时，再回来做下一班。','black',6.2),line('亚历克斯','alex','又到晚上了。先接老板的电话。','black',4.2)],
 transition3:[line('亚历克斯','alex','关店了。道路还封着，今天先在员工室轮休，商店暂停营业。','black',9.2),line('亚历克斯','alex','天又黑了，商店继续暂停营业。今晚等原道路频道安排安全接应。','black',6.2),line('亚历克斯','alex','别开店。先接电话，核实接应的车。','black',4.2)],
 callback:[line('本','ben','你刚才找我？说老板改了班，让我明晚提前到。','phone'),line('亚历克斯','alex','没有。我一直在店里，没给你打过电话。','phone'),line('本','ben','那声音就是你。你看看店里录像，我先不接受这次调班。','phone')],
 review1:[line('录像记录',null,'收尾录像：客人趁你搬货，走到柜台座机旁。','rear'),line('录像中的声音','mimicAlex','本？明晚提前来。老板改了班。','rear'),line('亚历克斯','alex','他在学我说话……不是来帮忙的。先报告，别让本过来。','rear')],
 report1:[line('老板',null,'我没有改班。本已经核实，不会来。明晚留意柜台座机，不接临时帮工。','radio'),line('亚历克斯','alex','骗局被识破了。钱也确实挣到了。再做一班看看。','radio')],
 encounter:[line('亚历克斯','alex','店已经关了。你是谁？','over'),line('员工服人影','mimicBen','后面的我来，你去忙。','hands'),line('亚历克斯','alex','本今晚不会来。谁让你进来的？','reverse'),line('员工服人影','mimicBen','我知道。','close'),line('亚历克斯','alex','那你为什么用他的声音？','reverse'),line('员工服人影','mimicAlex','那你为什么用他的声音？','close'),line('现场',null,'它的下颌与肩背开始变形。','transform',3.3),line('现场',null,'它压低身体，猛地冲向正门。','escape',4.2)],
 report2:[line('亚历克斯','alex','它已经进店了。这班我不做了，安排我离开。','radio'),line('老板',null,'别接客了。工资照算，先保证你自己安全。','radio'),line('县道路联络',null,'降雪造成连环事故，返程班车已停。这里距安全接应点太远，不要步行上高速。我们正在协调清障，保持联络。','radio'),line('亚历克斯','alex','我会把门关好。通路一恢复，立刻通知我。','radio')],
 review2:[line('录像记录',null,'入店前，它站在后门玻璃前，一遍遍练习柜台上的问候。','rear'),line('录像中的声音','mimicAlex','你好，需要什么？','face'),line('亚历克斯','alex','它在学我。声音，还有我在柜台上做的事。','face')],
 briefing3:[line('亚历克斯','alex','天又黑了。今天不是来上班的，是等着离开。','phone'),line('老板',null,'暂停营业。应急值守仍计基本工资，别为了卖东西开门。','phone'),line('县道路联络',null,'接应车从店前公路左侧来，停在原公交站，车号 N9。接近时，我们会在员工室电台八频道再次确认。有人叫你去后面，先回那台电台核实。','phone')],
 falseBen:[line('门外的声音','mimicBen','亚历克斯，开门。我来接你。','front'),line('亚历克斯','alex','本没有安排来接我。先看监控，再向县里核实。','front')],
 pickup:[line('作业服来客','cal','路刚清出来。再拖一会儿，又得封。车停在后面，出来吧。','front'),line('亚历克斯','alex','接应说的是前面公交站。你的车呢？','front'),line('作业服来客','cal','后面。灯没开，免得看见。','front'),line('亚历克斯','alex','谁看见？我先回拨核实。','front')],
 verify:[line('县道路联络',null,'N9 还没到，我们没有派人步行进站。接应仍在店前公交站。保持门锁，不要跟他去后面。','radio'),line('亚历克斯','alex','外面那个不是来接我的。','radio')],
 exposed:[line('门外的声音','mimicAlex','还差一点。三班应该够了。','front'),line('亚历克斯','alex','那是我第一晚说过的话。它一直在听。','front'),line('门外的声音','mimicBen','后面的我来，你去忙。','front'),line('县道路联络',null,'通路正在恢复，留在建筑内。你不需要再开门营业。','front')],
 arrival:[line('现场',null,'引擎声渐近，门外的脚步声向远处退去。','front',4),line('县道路联络',null,'N9 从店前公路左侧接近，车已停在公交站。通过前场监控确认，再到站牌旁上车。不要去后仓等接应。','front')],
 epilogueHome:[line('结局',null,'白天。亚历克斯付清新住处的首笔费用，打开一直没拆的行李箱。','home',12),line('亚历克斯','alex','至少今晚，不用去上班了。','home',9)],
 epilogueRoom:[line('结局',null,'白天。亚历克斯回到旅馆，把挣到的钱收好，撕下服务区的招聘电话。','home',12),line('亚历克斯','alex','剩下的，换个地方挣。','home',9)],
 coda:[line('尾声',null,'入夜，第九出口的灯又亮了。柜台后站着熟悉的身影。','counter',6),line('柜台后的声音','mimicAlex','第九出口。这里还有人值班。','counter',7)]
};
export const STORY_NIGHTS=[null,
 {title:'它在听你说话',phone:'老板：先签配送单，六箱货逐箱验收再上架，补完两箱接客。顾客先挑货再排队；逐件扫码、收现金、找齐自动结账。证件拿到收银台电脑按 E 读取。今晚只有你一个员工。三班工资存入个人租房基金，店铺资金单独买补给。',manifest:'配送单 H-081：六箱正常商品。今晚没有临时员工。亚历克斯的租房首付款需要 $300，现有 $120；计划用三个夜班补齐差额。',incident:'收尾电话响了，是本。',clue:'假调班电话 / 柜台电话录像',ending:'第一晚 · 刚才打电话的真不是你？',closing:'本与老板核实：没有改班，假邀请被拒绝。亚历克斯正常下班，工资存入租房基金。'},
 {title:'谁还在上班',phone:'老板：昨晚的电话是假的，本不会来。柜台座机来电也要核实，不接受新增帮工。今晚只有你。广播提醒降雪和路面结冰，返程班车仍在关注道路情况。先按正常流程验货补货，不要让陌生人进后仓。',manifest:'配送单 H-082：六箱正常商品，没有额外回收件。道路提示：北段降雪，部分路段限速；留意县道路频道。',incident:'局部断电。黑暗里有人拖动纸箱，继续把商品放上货架。先确认营业区的人影。',clue:'员工服人影 / 学来的声音 / 模仿主角的工作',ending:'第二晚 · 谁还在上班',closing:'亚历克斯明确辞职并停止营业。道路事故与风雪中断返程交通。外部人员协调清障；主角暂留服务区等待安全接应，天亮后轮休。'},
 {title:'你等的那个人来了',phone:'暂停营业。先接听县道路联络，确认接应方向、车辆和停车位置。',manifest:'停止营业，无配送、无新增员工。',incident:'保持联络，准备离站。',clue:'假接应 / 店前公交站 N9 / 可核实的外部联络',ending:'第三晚 · 最后三班',closing:'亚历克斯确认真实接应，独自到原公交站上车。已经挣到的钱照常结算，不以租房金额作为离开的条件。'}
];

export function storySpeaker(l){if(l.actor==='alex')return '亚历克斯（你）';if(l.actor==='mimicBen')return '人影（本的声音）';if(l.actor==='mimicAlex')return l.speaker==='柜台后的声音'?'柜台后的身影（你的声音）':l.speaker==='录像中的声音'?'录像（你的声音）':'人影（你的声音）';return l.speaker;}
