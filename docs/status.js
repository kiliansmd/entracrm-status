const names=['mdb','klimafaktur'];
const labels={reachable:'Webdienst erreichbar',unavailable:'Erreichbarkeit eingeschränkt',unknown:'Prüfung nicht möglich',stale:'Stand veraltet'};
const summary=document.getElementById('summary-label');
const updated=document.getElementById('updated');
const indicator=document.getElementById('summary-indicator');
const button=document.getElementById('refresh');
async function refresh(){
  button.disabled=true;
  try{
    const response=await fetch('./status.json',{cache:'no-store',signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('Unavailable');
    const data=await response.json();
    const checked=new Date(data.generatedAt);
    if(data.version!==1||!Array.isArray(data.services)||!Number.isFinite(checked.getTime()))throw new Error('Invalid');
    const age=Date.now()-checked.getTime();
    const stale=age>25*60_000||age< -60_000;
    const states=names.map(id=>{
      const record=data.services.find(item=>item.id===id);
      const state=stale?'stale':(['reachable','unavailable','unknown'].includes(record?.state)?record.state:'unknown');
      const badge=document.getElementById(`${id}-badge`);
      badge.textContent=labels[state];badge.className=`badge ${state}`;
      return state;
    });
    const state=stale?'stale':states.includes('unavailable')?'unavailable':states.every(value=>value==='reachable')?'reachable':'unknown';
    summary.textContent={reachable:'Webdienste erreichbar',unavailable:'Erreichbarkeit eingeschränkt',unknown:'Prüfung unvollständig',stale:'Der letzte Prüfstand ist veraltet'}[state];
    indicator.className=`indicator ${state}`;
    updated.textContent=`Stand: ${new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Berlin'}).format(checked)} · Aktualisierung etwa alle 10 Minuten`;
  }catch{
    summary.textContent='Status derzeit nicht abrufbar';indicator.className='indicator unknown';
    updated.textContent='Es liegt kein verlässlicher aktueller Prüfstand vor. Bitte später erneut versuchen.';
    for(const id of names){const badge=document.getElementById(`${id}-badge`);badge.textContent=labels.unknown;badge.className='badge unknown';}
  }finally{button.disabled=false;}
}
button.addEventListener('click',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});
setInterval(()=>{if(!document.hidden)void refresh();},60_000);
void refresh();
