/* Shared daily-quest system for every course: ordered main quests, free-order side quests, end-of-day test. Course packs supply the content. */
(()=>{
 if(typeof navItems!=='undefined')return;
 const h=esc,TEST_XP=30;
 const testInfo={en:{weak:'Listening · nhận diện âm đầu của từ',review:['5 từ vựng đầu tiên','Chữ dễ nhầm: b / d, p / q']},zh:{weak:'Thanh 3 (mǎ) dễ nhầm với thanh 2',review:['妈 · 麻 · 马 · 骂','你好 · 谢谢 · 再见']}};
 const testDone=c=>!!state.dailyTest?.[c];
 /* Item: {title, meta, xp, icon, done, attrs, why}. Config: {course, day, main:[items in order], side:[items]}. */
 function next(c){const m=c.main.find(q=>!q.done);if(m)return {title:m.title,why:m.why,attrs:m.attrs,kind:'main'};if(!testDone(c.course))return {title:'Daily Test cuối ngày',why:'Kiểm tra nhanh những gì vừa học. Kết quả quyết định nội dung ôn của ngày mai.',attrs:`data-daily-test="${c.course}"`,kind:'test'};const s=c.side.find(q=>!q.done);if(s)return {title:s.title,why:'Nhiệm vụ chính đã xong. Làm nhiệm vụ phụ để nhận thêm XP.',attrs:s.attrs,kind:'side'};return {title:'Hôm nay đã hoàn thành',why:'Hệ thống đã xếp lịch ôn cho ngày mai. Hẹn gặp lại!',attrs:'',kind:'done'}}
 const body=q=>`<span class="qicon">${q.icon}</span><span><span class="q-title">${h(q.title)}</span><span class="q-meta" style="display:block">${h(q.meta)}</span></span><span class="xp">+${q.xp} XP</span>`;
 function card(c){const n=next(c),firstOpen=c.main.findIndex(q=>!q.done),mainDone=firstOpen<0,all=[...c.main,...c.side],done=all.filter(q=>q.done).length+(testDone(c.course)?1:0),earned=all.filter(q=>q.done).reduce((s,q)=>s+q.xp,0)+(testDone(c.course)?TEST_XP:0);
  const mainRow=(q,i)=>{const locked=firstOpen>=0&&i>firstOpen,isNext=i===firstOpen;return `<li class="qs-item ${q.done?'done':isNext?'next':locked?'locked':''}"><span class="qs-step" aria-hidden="true">${q.done?'✓':locked?'🔒':i+1}</span><button class="quest ${q.done?'done':''} ${locked?'qs-locked':''}" ${locked?`data-quest-locked="${h(c.main[i-1].title)}"`:q.attrs}>${body(q)}</button></li>`};
  const test=testDone(c.course);
  return `<section class="card qs-card"><div class="card-head"><h2>Nhiệm vụ hôm nay</h2><span class="tag">${h(c.day)}</span></div>
  <div class="qs-guide ${n.kind}"><span class="qs-sys">HỆ THỐNG</span><div><b>${n.kind==='done'?'':'Tiếp theo: '}${h(n.title)}</b><small>${h(n.why)}</small></div>${n.attrs?`<button class="primary" ${n.attrs}>${n.kind==='test'?'Làm test':'Làm ngay'} →</button>`:''}</div>
  <div class="qs-section"><b>NHIỆM VỤ CHÍNH</b><span>Làm theo thứ tự · bài sau dùng kiến thức bài trước</span></div>
  <ol class="qs-chain">${c.main.map(mainRow).join('')}<li class="qs-item ${test?'done':mainDone?'next':'locked'}"><span class="qs-step" aria-hidden="true">${test?'✓':mainDone?'★':'🔒'}</span><button class="quest qs-test ${test?'done':''} ${mainDone?'':'qs-locked'}" ${mainDone?`data-daily-test="${c.course}"`:`data-quest-locked="tất cả nhiệm vụ chính"`}>${body({icon:'✦',title:'Daily Test cuối ngày',meta:'Tổng hợp · 5 phút · mở khi xong nhiệm vụ chính',xp:TEST_XP})}</button></li></ol>
  <div class="qs-section"><b>NHIỆM VỤ PHỤ</b><span>Làm lúc nào cũng được</span></div>
  <div class="quests">${c.side.map(q=>`<button class="quest ${q.done?'done':''}" ${q.attrs}><span class="check">${q.done?'✓':''}</span>${body(q)}</button>`).join('')}</div>
  <p class="sub qs-foot">${done}/${all.length+1} hoàn thành · đã nhận ${earned} XP hôm nay</p></section>`}
 function testModal(c){const t=testInfo[c]||testInfo.en;return `<div class="modal-head"><span class="tag">DAILY TEST · DEMO</span><button class="close" data-close aria-label="Đóng">×</button></div><h2 id="modal-title">Kết quả hôm nay</h2><p>Bản thật: khoảng 10 câu tổng hợp từ các nhiệm vụ hôm nay. Mockup hiển thị kết quả mẫu.</p><div class="qs-result"><div><strong>8/10</strong><small>Điểm</small></div><div><strong>+${TEST_XP}</strong><small>XP</small></div><div><strong>${t.review.length}</strong><small>Mục vào lịch ôn</small></div></div><p><b>Kỹ năng cần củng cố:</b> ${h(t.weak)}</p><p><b>Đưa vào lịch ôn ngày mai:</b> ${t.review.map(h).join(' · ')}</p><div class="modal-actions"><button class="primary" data-daily-finish="${h(c)}">Nhận kết quả →</button></div>`}
 window.SoloQuests={card,next,testXp:c=>testDone(c)?TEST_XP:0};
 /* English course: map the existing six Level 0 quests onto a main chain and side quests. */
 const enWhy=['Nhận diện chữ cái trước, rồi mới đọc và nghe được từ.','Dùng chữ cái vừa học để đọc 5 từ đầu tiên.','Nghe lại chính những từ vừa học để nhận diện âm.',null,'Đọc các từ đã nghe để nối âm với chữ.',null];
 function enCfg(){const it=i=>({title:quests[i][0],meta:`${quests[i][1]} · ${quests[i][2]}`,xp:quests[i][3],icon:quests[i][4],done:state.done.includes(i),attrs:`data-lesson="${i}"`,why:state.tier===0?enWhy[i]:'Bài này dùng kiến thức của nhiệm vụ trước.'});return {course:'en',day:'DAY 1',main:[0,1,2,4].map(it),side:[3,5].map(it)}}
 const questCard=/<section class="card"><div class="card-head"><h2>Nhiệm vụ hôm nay<\/h2>[\s\S]*?<\/section>(?=<section class="card"><div class="card-head"><h2>Cây kỹ năng)/;
 const oldDashboard=dashboard;dashboard=function(){return oldDashboard().replace(questCard,()=>card(enCfg()))};
 const baseXp=xp;xp=function(){return baseXp()+(testDone('en')?TEST_XP:0)};
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const s=b.dataset;
  if(s.questLocked){e.stopImmediatePropagation();toast(`Hoàn thành “${s.questLocked}” trước. Nhiệm vụ chính đi theo thứ tự.`)}
  else if(s.dailyTest)openModal(testModal(s.dailyTest));
  else if(s.dailyFinish){state.dailyTest={...(state.dailyTest||{}),[s.dailyFinish]:true};save();closeModal();render();toast(`Hoàn thành Daily Test · +${TEST_XP} XP. Lịch ôn ngày mai đã được cập nhật.`)}},true);
 if(account&&state.onboarded)render();
})();
