/* Leaderboard prototype: sample peers plus the current browser account; no server ranking. */
(()=>{
 if(typeof navItems!=='undefined')return;
 const h=esc;
 /* Peers are ranked per course; the same person can appear in several courses and keeps one chat identity. */
 const zhPeers=[
  {name:'Mai Phương',lv:8,week:390,streak:18},{name:'Hoàng Long',lv:0,week:260,streak:7},{name:'Thu Trang',lv:15,week:240,streak:25},
  {name:'Minh Anh',lv:2,week:150,streak:12},{name:'Kim Ngân',lv:26,week:210,streak:11},{name:'Đức Anh',lv:0,week:120,streak:3},
  {name:'Bảo Ngọc',lv:40,week:175,streak:33},{name:'Minh Khang',lv:0,week:55,streak:2},{name:'Phương Linh',lv:64,week:90,streak:46}
 ];
 const hskTiers=[['Nền tảng',0],['HSK 1',1],['HSK 2',11],['HSK 3',21],['HSK 4',31],['HSK 5',46],['HSK 6',61],['HSK 7–9',76]];
 const peers=[
  {name:'Minh Anh',lv:6,week:420,streak:12},{name:'Gia Huy',lv:0,week:310,streak:9},{name:'Thảo Vy',lv:14,week:285,streak:21},
  {name:'Hải Yến',lv:58,week:240,streak:15},{name:'Khánh Linh',lv:24,week:205,streak:8},{name:'Quốc Bảo',lv:0,week:180,streak:4},
  {name:'Lan Chi',lv:42,week:150,streak:30},{name:'Ngọc Hân',lv:1,week:130,streak:6},{name:'Phương Nam',lv:93,week:120,streak:40},
  {name:'Đức Minh',lv:3,week:95,streak:2},{name:'Anh Thư',lv:11,week:75,streak:5},{name:'Bảo Trâm',lv:52,week:60,streak:3},
  {name:'Tuấn Kiệt',lv:0,week:40,streak:1}
 ];
 for(const p of [...peers,...zhPeers])p.id='peer-'+p.name.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,'-');
 window.soloPeers=[...peers,...zhPeers.filter(z=>!peers.some(p=>p.id===z.id))];
 const isZh=()=>state.course==='zh';
 const tierOf=lv=>isZh()?hskTiers.reduce((t,[,l],i)=>l<=lv?i:t,0):levels.reduce((t,l,i)=>l.level<=lv?i:t,0),tierName=lv=>{if(isZh())return hskTiers[tierOf(lv)][0];const c=levels[tierOf(lv)].code;return c==='0'?'Level 0':c};
 function opts(){return {metric:'week',scope:'tier',hidden:false,...(state.leaderboard||{})}}
 function board(){const o=opts(),zh=isZh(),me={name:state.displayName||'Bạn',lv:zh?[0,1,11,21,31,46,61,76][state.zhLevel||0]:currentTier().level,week:zh?window.SoloCourse?.xp()||0:xp(),streak:state.done.length||state.zhDone?.length?1:0,me:true};let list=[...(zh?zhPeers:peers),me];if(o.scope==='tier')list=list.filter(p=>tierOf(p.lv)===tierOf(me.lv));const k=o.metric==='week'?p=>[p.week,p.lv]:p=>[p.lv,p.week];list.sort((a,b)=>{const x=k(a),y=k(b);return y[0]-x[0]||y[1]-x[1]||a.name.localeCompare(b.name,'vi')});return {list,me,o}}
 function tip(list,i,me,o){if(list.length===1)return 'Chưa có học viên mẫu cùng chặng. Chọn “Toàn bộ” để xem các chặng khác.';if(i===0)return 'Bạn đang dẫn đầu. Giữ nhịp học mỗi ngày để giữ hạng.';const t=list[i-1];if(o.metric==='week')return `Còn ${t.week-me.week+1} XP để vượt ${h(t.name)} và lên hạng ${i}.`;return t.lv>me.lv?`Còn ${t.lv-me.lv} level để bắt kịp ${h(t.name)} (hạng ${i}).`:`Bạn ngang level với ${h(t.name)}. Thêm XP tuần này để vượt lên.`}
 function leaderboard(){const {list,me,o}=board(),i=list.findIndex(p=>p.me);const row=(p,r)=>`<li class="lb-row${p.me?' me':''}"><span class="lb-rank r${r}">${r}</span><span class="lb-avatar" aria-hidden="true">${h((p.name.trim()[0]||'?').toUpperCase())}</span><div class="lb-name"><b>${h(p.name)}${p.me?' (bạn)'+(o.hidden?' · đang ẩn với người khác':''):''}</b><small>${tierName(p.lv)} · LV ${p.lv} · 🔥 ${p.streak} ngày liên tiếp</small><div class="lb-bar" title="Tiến độ lộ trình: LV ${p.lv}/100"><i style="width:${Math.max(2,p.lv)}%"></i></div></div><div class="lb-side"><strong>${o.metric==='week'?p.week+' XP':'LV '+p.lv}</strong>${p.me?'':window.SoloChat?.action(p)||''}</div></li>`;const seg=(name,items,cur)=>`<div class="lb-seg" role="group" aria-label="${name}">${items.map(([k,l])=>`<button data-lb-${name==='Tiêu chí xếp hạng'?'metric':'scope'}="${k}" class="${cur===k?'active':''}" aria-pressed="${cur===k}">${l}</button>`).join('')}</div>`;
  return `<section class="card lb-card"><div class="card-head"><h2>Bảng xếp hạng · ${isZh()?'HSK':'IELTS'}</h2><div class="lb-head-tools">${window.SoloChat?.entry()||''}<span class="tag">DỮ LIỆU MINH HỌA</span></div></div><p class="lb-sub">So sánh XP tuần này hoặc vị trí trên lộ trình. Mặc định so với học viên cùng chặng để cuộc đua công bằng hơn.</p><div class="lb-controls">${seg('Tiêu chí xếp hạng',[['week','XP tuần này'],['level','Level & tiến độ']],o.metric)}${seg('Phạm vi',[['tier','Cùng chặng '+tierName(me.lv)],['all','Toàn bộ']],o.scope)}</div><ol class="lb-list">${list.slice(0,5).map((p,r)=>row(p,r+1)).join('')}</ol>${i>=5?`<div class="lb-gap" aria-hidden="true">···</div><ol class="lb-list">${row(me,i+1)}</ol>`:''}<div class="lb-tip">${tip(list,i,me,o)}</div><div class="lb-foot"><span>Bạn xếp hạng ${i+1}/${list.length}. Đề xuất: XP tuần đặt lại mỗi thứ Hai.<br>Xếp hạng không ảnh hưởng mastery, level hoặc mở khóa chặng.</span><button class="link" data-lb-hide>${o.hidden?'Hiện tên tôi':'Ẩn tên tôi'}</button></div></section>`}
 window.soloLeaderboard=leaderboard;
 const oldDashboard=dashboard;dashboard=function(){return oldDashboard()+leaderboard()};
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const o=opts();if(b.dataset.lbMetric)o.metric=b.dataset.lbMetric;else if(b.dataset.lbScope)o.scope=b.dataset.lbScope;else if(b.dataset.lbHide!==undefined){o.hidden=!o.hidden;toast(o.hidden?'Đã ẩn tên bạn với học viên khác (demo).':'Tên bạn đã hiện trên bảng xếp hạng (demo).')}else return;state.leaderboard=o;save();render()});
 if(account&&state.onboarded)render();
})();
