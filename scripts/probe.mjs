import {writeFile,rename} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';

export const targets = [
  {id:'mdb',name:'entraCRM · MDB',href:'https://app.entracrm.de/mdb/dashboard',health:'https://app.entracrm.de/mdb/api/health'},
  {id:'klimafaktur',name:'entraCRM · Klimafaktur',href:'https://admin.klimafaktur.de/klimafaktur/dashboard',health:'https://admin.klimafaktur.de/klimafaktur/api/health'}
];
export async function probe(target, request=fetch, now=()=>new Date()) {
  let state='unknown';
  try {
    const response=await request(target.health,{
      redirect:'error',credentials:'omit',headers:{Accept:'application/json'},signal:AbortSignal.timeout(10_000)
    });
    if(!response.ok) state='unavailable';
    else if((await response.json())?.status==='ok') state='reachable';
  } catch { /* No internal errors, response bodies, or credentials are published. */ }
  return {id:target.id,state,checkedAt:now().toISOString()};
}
export async function updateStatus() {
  const services=await Promise.all(targets.map(target=>probe(target)));
  const output={version:1,generatedAt:new Date().toISOString(),scope:'public-web-reachability',services};
  const directory=fileURLToPath(new URL('../docs/',import.meta.url));
  const temporary=path.join(directory,'status.json.tmp');
  await writeFile(temporary,JSON.stringify(output,null,2)+'\n');
  await rename(temporary,path.join(directory,'status.json'));
  console.log(JSON.stringify(output));
}
if(process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) await updateStatus();
