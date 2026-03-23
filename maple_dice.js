const TOTAL=40,COLS=11,ROWS=11;
const DICE_DOTS={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]]};
function diceSvg(v,size=26){const dots=DICE_DOTS[v].map(([x,y])=>`<circle cx="${x}%" cy="${y}%" r="9%" fill="currentColor"/>`).join('');return`<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block">${dots}</svg>`;}

let coinVals=[0,500,100,600,400,400,300,400,300,400,400,100,600,100,400,100,300,300,400,100,150,400,100,300,300,300,100,300,400,100,600,0,600,600,600,400,600,400,100,300,300];
let specialCells=[{cellNum:16,type:'move',moveVal:-3},{cellNum:23,type:'move',moveVal:3},{cellNum:31,type:'mystery',moveVal:0},{cellNum:33,type:'move',moveVal:-2}];

const PATH_POS=[null];
for(let c=10;c>=0;c--)PATH_POS.push([10,c]);
for(let r=9;r>=1;r--)PATH_POS.push([r,0]);
for(let c=0;c<=10;c++)PATH_POS.push([0,c]);
for(let r=1;r<=9;r++)PATH_POS.push([r,10]);
const CORNERS=new Set([1,11,21,31]);
let currentPos=1;
let passedStart=false; // START를 한 번이라도 통과했는지 여부
// 주사위 개수 1~3, 각 주사위 값
let diceCount=3;
let chosenDice=[6,5,4];
let highlightedPath=[];

// 특수 주사위 상태: 각 주사위 인덱스에 적용된 효과
// null = 특수 없음, 또는 { type: 'x2'|'x3'|'fert'|'minus5'|'minus10'|'xminus3' }
let specialDiceEffects=[null,null,null];

const SPECIAL_EFFECTS=[
  {id:'x2',    label:'×2',    desc:'이동칸 ×2',         color:'#ffd84a'},
  {id:'x3',    label:'×3',    desc:'이동칸 ×3',         color:'#ff9f1c'},
  {id:'fert',  label:'🌿×2',  desc:'코인 ×2 (성장비료)',color:'#39ff8a'},
  {id:'m5',    label:'-5',    desc:'이동칸 -5',         color:'#ff4fce'},
  {id:'m10',   label:'-10',   desc:'이동칸 -10',        color:'#ff4060'},
  {id:'xm3',   label:'×(-3)',desc:'이동칸 ×(-3)',       color:'#b87aff'},
];

function applySpecialToSteps(dice,effectId){
  // 이동 칸 수 변환
  switch(effectId){
    case 'x2':   return dice*2;
    case 'x3':   return dice*3;
    case 'fert': return dice; // 이동칸은 그대로, 코인만 나중에 2배
    case 'm5':   return dice-5;
    case 'm10':  return dice-10;
    case 'xm3':  return dice*-3;
    default:     return dice;
  }
}

function getSpecial(n){return specialCells.find(s=>s.cellNum===n)||null}
function cellArrow(i){if(i<=11)return'◀';if(i<=20)return'▲';if(i<=31)return'▶';return'▼'}

document.addEventListener('click',e=>{
  if(!e.target.closest('.help-btn')&&!e.target.closest('.help-popup'))
    document.querySelector('.help-popup')?.classList.remove('show');
});

function renderBoard(){
  const grid=document.getElementById('boardGrid');
  grid.innerHTML='';
  const lookup={};
  for(let i=1;i<=TOTAL;i++){const[r,c]=PATH_POS[i];lookup[`${r},${c}`]=i}
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const div=document.createElement('div');
      const idx=lookup[`${r},${c}`];
      if(idx!==undefined){
        const sp=getSpecial(idx);
        const isCur=idx===currentPos,isOn=highlightedPath.includes(idx),corner=CORNERS.has(idx);
        let cls='bc';
        if(corner)cls+=' corner';
        if(isCur)cls+=' cur';else if(isOn)cls+=' onpath';
        if(sp){if(sp.type==='mystery')cls+=' mystery';else cls+=sp.moveVal>=0?' move-plus':' move-minus';}
        div.className=cls;
        let inner=`<span class="cn">${idx}</span>`;
        if(idx===1)inner+=`<span class="cstart">START</span>`;
        if(sp){
          if(sp.type==='mystery')inner+=`<span class="cv myst">?</span>`;
          else{const s=sp.moveVal>=0?'+':'';inner+=`<span class="cv ${sp.moveVal>=0?'movepos':'moveneg'}">${s}${sp.moveVal}칸</span>`;}
        }else{inner+=`<span class="cv pos">+${coinVals[idx]}</span>`;}
        if(!corner)inner+=`<span style="font-size:5px;color:var(--text3);line-height:1">${cellArrow(idx)}</span>`;
        if(isCur)inner+=`<span class="piece"><svg width="20" height="24" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pg" cx="40%" cy="35%"><stop offset="0%" stop-color="#80ffff"/><stop offset="60%" stop-color="#00b8d4"/><stop offset="100%" stop-color="#005f7f"/></radialGradient></defs><ellipse cx="10" cy="22" rx="5" ry="2.2" fill="rgba(0,220,255,0.25)"/><circle cx="10" cy="10" r="9" fill="url(#pg)" stroke="#00e5ff" stroke-width="2"/><circle cx="10" cy="10" r="4.5" fill="white" opacity="0.95"/><circle cx="8" cy="8" r="1.5" fill="white" opacity="0.6"/></svg></span>`;
        div.innerHTML=inner;
        div.onclick=()=>{currentPos=idx;highlightedPath=[];renderBoard();document.getElementById('posDisplay').textContent=`${idx}번 칸${idx===1?' (START)':''}`};
      }else{
        div.className=(r===5&&c===5)?'bc icenter':'bc inner';
      }
      grid.appendChild(div);
    }
  }
  const ov=document.createElement('div');ov.className='board-center-overlay';
  ov.innerHTML=`<div class="center-gem">💎</div><div class="center-title">진의<br>신비한<br>정원</div>`;
  grid.appendChild(ov);
}

function renderDice(){
  const c=document.getElementById('diceContainer');
  c.innerHTML='';

  // ── START 통과 여부 ──
  const lapRow=document.createElement('div');
  lapRow.style='display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(120,60,255,.2);';
  lapRow.innerHTML=`<span style="font-family:'Jua',sans-serif;font-size:11px;color:var(--text2);white-space:nowrap;">START 통과</span>`;
  const lapBtnWrap=document.createElement('div');
  lapBtnWrap.style='display:flex;gap:5px;';
  [{val:false,label:'미통과'},{val:true,label:'통과 ✓'}].forEach(({val,label})=>{
    const btn=document.createElement('button');
    const sel=passedStart===val;
    const isPass=val===true;
    btn.style=`padding:5px 12px;border-radius:5px;border:1px solid ${sel?(isPass?'var(--neon-green)':'rgba(200,160,255,.7)'):(isPass?'rgba(0,200,80,.2)':'rgba(80,40,150,.5)')};background:${sel?(isPass?'rgba(0,180,80,.25)':'rgba(100,60,200,.25)'):'rgba(0,0,0,.3)'};color:${sel?(isPass?'var(--neon-green)':'#fff'):'var(--text3)'};font-family:'Jua',sans-serif;font-size:12px;cursor:pointer;transition:all .13s;box-shadow:${sel&&isPass?'0 0 8px rgba(0,255,100,.35)':sel?'0 0 8px rgba(150,100,255,.4)':''};`;
    btn.textContent=label;
    btn.title=isPass?'START 통과 후 → 이후 통과 시 성장비료 +400':'아직 첫 바퀴 → START 통과해도 보너스 없음';
    btn.onclick=()=>{passedStart=val;renderDice();};
    lapBtnWrap.appendChild(btn);
  });
  lapRow.appendChild(lapBtnWrap);
  const lapHint=document.createElement('span');
  lapHint.style=`font-size:9px;font-family:'Jua',sans-serif;${passedStart?'color:var(--neon-green);':'color:var(--text3);'}`;
  lapHint.textContent=passedStart?'★ 통과 보너스 적용됨':'★ 보너스 없음';
  lapRow.appendChild(lapHint);
  c.appendChild(lapRow);

  // ── 주사위 개수 선택 ──
  const countRow=document.createElement('div');
  countRow.style='display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(120,60,255,.2);';
  countRow.innerHTML=`<span style="font-family:'Jua',sans-serif;font-size:11px;color:var(--text2);white-space:nowrap;">주사위 개수</span>`;
  const btnWrap=document.createElement('div');
  btnWrap.style='display:flex;gap:5px;';
  [1,2,3].forEach(n=>{
    const btn=document.createElement('button');
    const sel=diceCount===n;
    btn.style=`padding:5px 14px;border-radius:5px;border:1px solid ${sel?'var(--neon-cyan)':'rgba(80,40,150,.5)'};background:${sel?'rgba(0,160,220,.25)':'rgba(0,0,0,.3)'};color:${sel?'#fff':'var(--text3)'};font-family:'Jua',sans-serif;font-size:12px;cursor:pointer;transition:all .13s;box-shadow:${sel?'0 0 8px rgba(0,200,255,.4)':''};`;
    btn.textContent=`${n}개`;
    btn.onclick=()=>{
      diceCount=n;
      while(chosenDice.length<n) chosenDice.push(1);
      while(specialDiceEffects.length<n) specialDiceEffects.push(null);
      renderDice();
    };
    btnWrap.appendChild(btn);
  });
  countRow.appendChild(btnWrap);
  c.appendChild(countRow);

  // ── 주사위 값 선택 (diceCount 개수만큼만) ──
  for(let d=0;d<diceCount;d++){
    const row=document.createElement('div');row.className='dr';row.style='flex-direction:column;gap:4px;align-items:stretch;';

    // 상단: 레이블 + 주사위 선택 + 숫자입력
    const topRow=document.createElement('div');
    topRow.style='display:flex;align-items:center;gap:4px;';
    const lbl=document.createElement('div');lbl.className='dlabel';lbl.textContent=`주사위 ${d+1}`;topRow.appendChild(lbl);
    const opts=document.createElement('div');opts.className='dopts';
    for(let v=1;v<=6;v++){
      const btn=document.createElement('button');
      btn.className='dbtn'+(chosenDice[d]===v?' sel':'');
      btn.innerHTML=diceSvg(v);
      btn.title=`${v}`;
      btn.onclick=()=>{chosenDice[d]=v;renderDice()};
      opts.appendChild(btn);
    }
    topRow.appendChild(opts);
    const numIn=document.createElement('input');
    numIn.type='number';numIn.className='dnum';numIn.min=1;numIn.max=6;numIn.value=chosenDice[d];
    numIn.oninput=()=>{
      const v=Math.max(1,Math.min(6,parseInt(numIn.value)||1));
      chosenDice[d]=v;
      topRow.querySelectorAll('.dbtn').forEach((b,i)=>b.classList.toggle('sel',i+1===v));
    };
    numIn.onblur=()=>{numIn.value=chosenDice[d]};
    topRow.appendChild(numIn);
    row.appendChild(topRow);

    // 하단: 특수 주사위 효과 선택 버튼들
    const specRow=document.createElement('div');
    specRow.style='display:flex;align-items:center;gap:3px;flex-wrap:wrap;padding:4px 0 6px 0;border-bottom:1px solid rgba(120,60,255,.15);';
    const specLabel=document.createElement('span');
    specLabel.style='font-size:11px;color:var(--text3);width:44px;flex-shrink:0;font-family:"Jua",sans-serif;';
    specLabel.textContent='특수효과';
    specRow.appendChild(specLabel);

    // "없음" 버튼
    const noneBtn=document.createElement('button');
    const noneActive=!specialDiceEffects[d];
    noneBtn.style=`padding:2px 6px;border-radius:4px;border:1px solid ${noneActive?'var(--neon-cyan)':'rgba(80,40,150,.4)'};background:${noneActive?'rgba(0,160,220,.2)':'rgba(0,0,0,.3)'};color:${noneActive?'#fff':'var(--text3)'};font-size:9px;cursor:pointer;font-family:"Jua",sans-serif;transition:all .13s;`;
    noneBtn.textContent='없음';
    noneBtn.onclick=()=>{specialDiceEffects[d]=null;renderDice();};
    specRow.appendChild(noneBtn);

    SPECIAL_EFFECTS.forEach(eff=>{
      const effBtn=document.createElement('button');
      const isActive=specialDiceEffects[d]===eff.id;
      effBtn.style=`padding:2px 6px;border-radius:4px;border:1px solid ${isActive?eff.color:'rgba(80,40,150,.4)'};background:${isActive?`rgba(80,40,150,.35)`:'rgba(0,0,0,.3)'};color:${isActive?eff.color:'var(--text3)'};font-size:9px;cursor:pointer;font-family:"Jua",sans-serif;transition:all .13s;${isActive?`box-shadow:0 0 6px ${eff.color}44;`:''}`;
      effBtn.textContent=eff.label;
      effBtn.title=eff.desc;
      effBtn.onclick=()=>{specialDiceEffects[d]=eff.id;renderDice();};
      specRow.appendChild(effBtn);
    });

    // 현재 적용 효과 표시
    if(specialDiceEffects[d]){
      const eff=SPECIAL_EFFECTS.find(e=>e.id===specialDiceEffects[d]);
      const raw=chosenDice[d];
      const finalSteps=applySpecialToSteps(raw,eff.id);
      const tag=document.createElement('span');
      tag.style=`font-size:9px;color:${eff.color};margin-left:2px;font-family:"Jua",sans-serif;`;
      tag.textContent=`→ ${finalSteps}칸${eff.id==='fert'?' (코인×2)':''}`;
      specRow.appendChild(tag);
    }

    row.appendChild(specRow);
    c.appendChild(row);
  }
}

function renderCellEdit(){
  const grid=document.getElementById('cellEditGrid');grid.innerHTML='';
  for(let i=1;i<=TOTAL;i++){
    const sp=getSpecial(i);
    const div=document.createElement('div');div.className='ced';
    const lbl=document.createElement('span');lbl.className='cel';lbl.textContent=i===1?'START':`${i}번`;div.appendChild(lbl);
    if(sp){
      const badge=document.createElement('span');
      if(sp.type==='mystery'){badge.style='display:flex;align-items:center;justify-content:center;font-size:11px;padding:3px 0;border-radius:5px;background:rgba(255,144,64,.1);border:1px solid rgba(255,144,64,.4);color:var(--orange)';badge.textContent='?';}
      else{badge.style=`display:flex;align-items:center;justify-content:center;font-size:8px;padding:3px 1px;border-radius:5px;background:${sp.moveVal>=0?'rgba(80,216,255,.1)':'rgba(240,96,112,.1)'};border:1px solid ${sp.moveVal>=0?'rgba(80,216,255,.4)':'rgba(240,96,112,.4)'};color:${sp.moveVal>=0?'var(--cyan)':'var(--red)'}`;badge.textContent=(sp.moveVal>=0?'+':'')+sp.moveVal+'칸';}
      div.appendChild(badge);
    }else{
      const inp=document.createElement('input');inp.type='number';inp.className='cei';inp.value=coinVals[i];
      inp.onchange=()=>{coinVals[i]=parseInt(inp.value)||0;renderBoard();showSave()};
      div.appendChild(inp);
    }
    grid.appendChild(div);
  }
}

function renderSpecialList(){
  const list=document.getElementById('specialList');list.innerHTML='';
  specialCells.forEach((sp,idx)=>{
    const item=document.createElement('div');item.className='special-item';
    const hdr=document.createElement('div');hdr.className='special-item-header';
    const title=document.createElement('span');title.className='special-item-title';title.textContent=`특수 칸 #${idx+1}`;hdr.appendChild(title);
    const badge=document.createElement('span');badge.className='special-badge';
    const updateBadge=()=>{
      if(sp.type==='mystery'){badge.className='special-badge badge-mystery';badge.textContent='? 랜덤';}
      else if(sp.moveVal>=0){badge.className='special-badge badge-move-plus';badge.textContent=`+${sp.moveVal}칸 이동`;}
      else{badge.className='special-badge badge-move-minus';badge.textContent=`${sp.moveVal}칸 이동`;}
    };
    updateBadge();hdr.appendChild(badge);item.appendChild(hdr);
    const row1=document.createElement('div');row1.className='special-row';
    const nl=document.createElement('span');nl.className='special-label';nl.textContent='칸 번호';row1.appendChild(nl);
    const ni=document.createElement('input');ni.type='number';ni.className='special-input';ni.min=1;ni.max=TOTAL;ni.value=sp.cellNum;
    ni.onchange=()=>{sp.cellNum=Math.max(1,Math.min(TOTAL,parseInt(ni.value)||1));ni.value=sp.cellNum;renderBoard();renderCellEdit();showSave()};
    row1.appendChild(ni);
    const tbtns=document.createElement('div');tbtns.className='type-btns';
    const mkType=(label,cls,check,action)=>{const b=document.createElement('button');b.className='type-btn'+(check()?` ${cls}`:'');b.textContent=label;b.onclick=()=>{action();updateBadge();renderSpecialList();renderBoard();renderCellEdit();showSave()};tbtns.appendChild(b);};
    mkType('+이동','ap',()=>sp.type==='move'&&sp.moveVal>=0,()=>{sp.type='move';if(sp.moveVal<0)sp.moveVal=3});
    mkType('-이동','am',()=>sp.type==='move'&&sp.moveVal<0,()=>{sp.type='move';if(sp.moveVal>=0)sp.moveVal=-3});
    mkType('?','aq',()=>sp.type==='mystery',()=>{sp.type='mystery';sp.moveVal=0});
    row1.appendChild(tbtns);
    const del=document.createElement('button');del.className='del-btn';del.innerHTML='×';
    del.onclick=()=>{specialCells.splice(idx,1);renderSpecialList();renderBoard();renderCellEdit();showSave()};
    row1.appendChild(del);item.appendChild(row1);
    if(sp.type==='move'){
      const row2=document.createElement('div');row2.className='special-row';
      const vl=document.createElement('span');vl.className='special-label';vl.textContent='이동 칸 수';row2.appendChild(vl);
      const vi=document.createElement('input');vi.type='number';vi.className='special-input';vi.value=sp.moveVal;
      vi.onchange=()=>{sp.moveVal=parseInt(vi.value)||0;vi.value=sp.moveVal;updateBadge();renderBoard();renderCellEdit();showSave()};
      row2.appendChild(vi);
      const hint=document.createElement('span');hint.style='font-size:9px;color:var(--text3)';hint.textContent='(+앞 / -뒤)';row2.appendChild(hint);
      item.appendChild(row2);
    }
    list.appendChild(item);
  });
}

function addSpecialCell(){specialCells.push({cellNum:1,type:'move',moveVal:3});renderSpecialList();renderCellEdit()}
function showSave(){const n=document.getElementById('saveNotice');n.classList.add('show');clearTimeout(n._t);n._t=setTimeout(()=>n.classList.remove('show'),1500)}

function switchTab(name){
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',['play','settings'][i]===name));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if(name==='settings'){renderCellEdit();renderSpecialList()}
}

function permutations(arr){
  if(arr.length<=1)return[[...arr]];
  const res=[];
  for(let i=0;i<arr.length;i++){const rest=[...arr.slice(0,i),...arr.slice(i+1)];for(const p of permutations(rest))res.push([arr[i],...p])}
  return res;
}

function stepForward(pos,steps){
  return((pos-1+steps)%TOTAL+TOTAL)%TOTAL+1;
}

function didPassOrLandStart(from,steps){
  if(steps<=0)return false;
  // 통과 또는 착지 둘 다 체크 (i=1부터 steps까지 포함)
  for(let i=1;i<=steps;i++){
    if(((from-1+i)%TOTAL)+1===1)return true;
  }
  return false;
}

function simulate(start,order,effects,alreadyPassedStart){
  let pos=start,coins=0,hasPassedStart=alreadyPassedStart||false;
  const pathDetails=[];
  const firedMoveCells=new Set();

  for(let i=0;i<order.length;i++){
    const rawDice=order[i];
    const effId=effects?effects[i]:null;
    const isFert=effId==='fert';
    const d=applySpecialToSteps(rawDice,effId);

    const landed=stepForward(pos,d);

    let passBonus=0;
    const crossesStart=d>0&&didPassOrLandStart(pos,d);
    if(crossesStart){
      if(hasPassedStart) passBonus=coinVals[1]; // 이미 첫 통과 했으면 보너스
      hasPassedStart=true; // 이번에 통과했으니 이후부터 보너스 활성화
    }

    const sp=getSpecial(landed);
    let finalPos=landed,stepCoins=0,teleFrom=null,moveBlocked=false;

    if(sp){
      if(sp.type==='mystery'){
        stepCoins=0;finalPos=landed;
      }else{
        if(firedMoveCells.has(landed)){
          stepCoins=isFert?200:100;finalPos=landed;moveBlocked=true;
        }else{
          firedMoveCells.add(landed);
          teleFrom=landed;
          const visited=new Set([landed]);
          let cur=landed;
          while(true){
            const nsp=getSpecial(cur);
            if(!nsp||nsp.type==='mystery'){stepCoins=isFert?(coinVals[cur]||0)*2:(coinVals[cur]||0);break;}
            if(cur!==landed&&firedMoveCells.has(cur)){stepCoins=isFert?200:100;finalPos=cur;moveBlocked=true;break;}
            firedMoveCells.add(cur);
            const next=stepForward(cur,nsp.moveVal);
            if(visited.has(next)){stepCoins=0;break;}
            visited.add(next);cur=next;
          }
          if(!moveBlocked)finalPos=cur;
        }
      }
    }else{
      stepCoins=isFert?(coinVals[landed]||0)*2:(coinVals[landed]||0);
    }

    coins+=stepCoins+passBonus;
    pathDetails.push({from:pos,dice:rawDice,effId,actualSteps:d,landed,teleFrom,dest:finalPos,coins:stepCoins+passBonus,passBonus,moveBlocked,isFert});
    pos=finalPos;
  }
  return{coins,pos,pathDetails};
}

function calculate(){
  const activeDice=chosenDice.slice(0,diceCount);
  const activeEffects=specialDiceEffects.slice(0,diceCount);

  // 주사위 인덱스 배열로 순열 생성 (값이 같아도 효과가 다를 수 있으므로 인덱스 기준)
  const indices=[...Array(diceCount).keys()];
  const idxPerms=permutations(indices);
  const seen=new Set();
  const results=[];

  for(const perm of idxPerms){
    const orderVals=perm.map(i=>activeDice[i]);
    const orderEffs=perm.map(i=>activeEffects[i]);
    // 같은 값+효과 조합 중복 제거
    const key=perm.map(i=>`${activeDice[i]}:${activeEffects[i]||''}`).join(',');
    if(seen.has(key))continue;
    seen.add(key);
    results.push({order:orderVals,effects:orderEffs,...simulate(currentPos,orderVals,orderEffs,passedStart)});
  }
  results.sort((a,b)=>b.coins-a.coins);

  highlightedPath=results[0].pathDetails.map(d=>d.dest);
  const steps=results[0].pathDetails;
  let delay=0;
  steps.forEach(step=>{
    setTimeout(()=>{
      currentPos=step.dest;renderBoard();
      const piece=document.querySelector('.piece');
      if(piece){piece.classList.add('moving');setTimeout(()=>piece&&piece.classList.remove('moving'),350);}
    },delay);
    delay+=420;
  });
  setTimeout(()=>{renderBoard();displayResults(results);},delay);
}

function displayResults(results){
  const sec=document.getElementById('resultsSection');
  sec.classList.add('visible','pop');setTimeout(()=>sec.classList.remove('pop'),400);

  const best=results[0];

  // 최적 순서 표시 (특수 효과 포함)
  document.getElementById('bestCoin').textContent=(best.coins>=0?'+':'')+best.coins.toLocaleString()+' 코인';
  document.getElementById('bestOrder').innerHTML=best.order.map((d,j)=>{
    const eff=best.effects&&best.effects[j]?SPECIAL_EFFECTS.find(e=>e.id===best.effects[j]):null;
    const steps=best.pathDetails[j].actualSteps;
    const effTag=eff?`<span style="font-size:8px;color:${eff.color};border:1px solid ${eff.color}44;border-radius:3px;padding:0 2px;margin-left:1px;">${eff.label}</span>`:'';
    const stepTag=eff?`<span style="font-size:8px;color:var(--text3);">(${steps}칸)</span>`:'';
    return `<span style="display:inline-flex;align-items:center;vertical-align:middle;color:var(--gold)">${diceSvg(d,16)}</span>${effTag}${stepTag}${j<best.order.length-1?'<span style="font-size:10px;color:var(--text3);margin:0 1px">→</span>':''}`;
  }).join('');
  document.getElementById('bestPos').textContent=best.pos+'번 칸';
  document.getElementById('totalCases').textContent=results.length+'가지';

  const list=document.getElementById('resultList');list.innerHTML='';
  results.forEach((r,i)=>{
    const item=document.createElement('div');item.className='ri';
    const rc=['r1','r2','r3'][i]||'rn';
    const pathStr=r.pathDetails.map((d,di)=>{
      const eff=r.effects&&r.effects[di]?SPECIAL_EFFECTS.find(e=>e.id===r.effects[di]):null;
      const effLabel=eff?`[✦${eff.label}→${d.actualSteps}칸]`:'';
      let s='';
      if(d.moveBlocked) s=`${d.dest}번(🔒+${d.isFert?200:100})`;
      else if(d.teleFrom!==null){const sp=getSpecial(d.teleFrom);const sign=sp.moveVal>=0?'+':'';s=`${d.teleFrom}번(${sign}${sp.moveVal}칸)→${d.dest}번(+${d.isFert?(coinVals[d.dest]||0)*2:(coinVals[d.dest]||0)})${d.isFert?'×2':''}`;} 
      else{const sp=getSpecial(d.dest);s=sp&&sp.type==='mystery'?`${d.dest}번(?)`:`${d.dest}번(+${d.isFert?(coinVals[d.dest]||0)*2:(coinVals[d.dest]||0)})${d.isFert?'×2':''}`;}
      if(d.passBonus>0)s+=`[★+${d.passBonus}]`;
      return effLabel+s;
    }).join(' → ');

    item.innerHTML=`
      <div class="rb ${rc}">${i+1}</div>
      <div class="rbody">
        <div class="rorder">
          ${r.order.map((d,j)=>{
            const eff=r.effects&&r.effects[j]?SPECIAL_EFFECTS.find(e=>e.id===r.effects[j]):null;
            const effTag=eff?`<span style="font-size:8px;color:${eff.color};border:1px solid ${eff.color}55;border-radius:3px;padding:0 2px;">${eff.label}</span>`:'';
            return `<span style="display:inline-flex;align-items:center;vertical-align:middle;color:var(--gold)">${diceSvg(d,16)}</span>${effTag}${j<r.order.length-1?'<span class="rarr">▶</span>':''}`;
          }).join('')}
          <span style="font-size:9px;color:var(--text3);margin-left:3px">(${r.order.join('-')})</span>
        </div>
        <div class="rpath">${pathStr}</div>
      </div>
      <div class="rcoin ${r.coins<0?'neg':''}">${r.coins>=0?'+':''}${r.coins.toLocaleString()}</div>`;
    list.appendChild(item);
  });
  sec.scrollIntoView({behavior:'smooth',block:'start'});
}

renderBoard();renderDice();
