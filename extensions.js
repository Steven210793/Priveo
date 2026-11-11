'use strict';
const oldRender=render;
render=function(){oldRender();if(!key){if(secret?.biometric)document.querySelector('#authform')?.insertAdjacentHTML('beforeend','<p><button type="button" class="btn ghost" data-action="bio-unlock">Déverrouiller avec Android</button></p>');return}
if(tab==='files')document.querySelector('.toolbar')?.insertAdjacentHTML('beforeend','<button class="btn ghost" data-action="scan">Scanner en PDF</button>');
if(tab==='settings')document.querySelector('h2')?.insertAdjacentHTML('afterend','<div class="card"><h3>Passkey Android</h3><p class="muted small">Empreinte ou code Android selon le téléphone. Nécessite la prise en charge de WebAuthn PRF. Conserve ton mot de passe pour les sauvegardes.</p><button class="btn" data-action="bio-setup">Activer ou modifier</button> <button class="btn ghost" data-action="bio-remove">Désactiver</button></div>');
};
async function setupBiometry(){
if(!window.PublicKeyCredential||!navigator.credentials||!isSecureContext){toast('Passkeys non disponibles');return}
let pass=prompt('Mot de passe actuel du coffre :');if(!pass)return;
try{await decrypt(secret.box,await derive(pass,b64ToBytes(secret.salt)))}catch(e){toast('Mot de passe incorrect');return}
try{
const salt=crypto.getRandomValues(new Uint8Array(32));
const cred=await navigator.credentials.create({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:'Priveo'},user:{id:crypto.getRandomValues(new Uint8Array(16)),name:'priveo-owner',displayName:'Propriétaire'},pubKeyCredParams:[{type:'public-key',alg:-7}],authenticatorSelection:{residentKey:'preferred',userVerification:'required'},extensions:{prf:{eval:{first:salt}}},attestation:'none',timeout:60000}});
let raw=cred.getClientExtensionResults()?.prf?.results?.first;
if(!raw){const confirmation=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{id:cred.rawId,type:'public-key'}],userVerification:'required',extensions:{prf:{eval:{first:salt}}},timeout:60000}});raw=confirmation?.getClientExtensionResults()?.prf?.results?.first}
if(!raw)throw Error('Ce téléphone ne prend pas en charge la clé sécurisée PRF');
const wrap=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt']);
secret.biometric={id:bytesToB64(new Uint8Array(cred.rawId)),salt:bytesToB64(salt),box:await encrypt({password:pass},wrap)};
await setVault(secret);render();toast('Passkey Android activée');
}catch(e){toast('Activation impossible : '+e.message)}
}
async function unlockBiometry(){
try{const b=secret.biometric;const cred=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{id:b64ToBytes(b.id),type:'public-key'}],userVerification:'required',extensions:{prf:{eval:{first:b64ToBytes(b.salt)}}},timeout:60000}});const raw=cred?.getClientExtensionResults()?.prf?.results?.first;if(!raw)throw Error('PRF indisponible');const wrap=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);const v=await decrypt(b.box,wrap);await auth(v.password)}catch(e){toast('Déverrouillage Android impossible : '+e.message)}
}
function imagePdf(jpeg,w,h){
const chunks=[];let n=0,offsets=[0];function txt(s){let b=encoder.encode(s);chunks.push(b);n+=b.length}function bin(b){chunks.push(b);n+=b.length}
function obj(i,s){offsets[i]=n;txt(i+' 0 obj\n'+s+'\nendobj\n')}
const pw=595,ph=Math.max(1,Math.round(595*h/w)),content='q\n'+pw+' 0 0 '+ph+' 0 0 cm\n/Im0 Do\nQ\n';
txt('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pw+' '+ph+'] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
offsets[4]=n;txt('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+w+' /Height '+h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n');bin(jpeg);txt('\nendstream\nendobj\n');
obj(5,'<< /Length '+encoder.encode(content).length+' >>\nstream\n'+content+'endstream');
let start=n;txt('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)txt(String(offsets[i]).padStart(10,'0')+' 00000 n \n');txt('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF');
let out=new Uint8Array(n),pos=0;for(let c of chunks){out.set(c,pos);pos+=c.length}return out;
}
function scan(){
const m=modal('Scanner en PDF','<p class="muted small">Photographie ou sélectionne une image, puis ajuste son recadrage.</p><input id="scanfile" class="field" type="file" accept="image/*" capture="environment"><canvas id="scanCanvas" style="width:100%;max-height:48dvh;object-fit:contain;background:#102139"></canvas><div class="toolbar"><button type="button" class="btn ghost" id="rotateLeft">↶ 90° gauche</button><button type="button" class="btn ghost" id="rotateRight">↷ 90° droite</button></div><div class="grid"><label>Gauche<input class="field crop" id="cL" type="range" min="0" max="40" value="0"></label><label>Droite<input class="field crop" id="cR" type="range" min="0" max="40" value="0"></label><label>Haut<input class="field crop" id="cT" type="range" min="0" max="40" value="0"></label><label>Bas<input class="field crop" id="cB" type="range" min="0" max="40" value="0"></label></div><label>Nom du fichier</label><input class="field" id="scanname" value="Document-scanné.pdf"><button id="scanSave" class="btn" disabled>Créer le PDF</button>');
const canvas=m.querySelector('#scanCanvas'),ctx=canvas.getContext('2d');let img,rotation=0;
function draw(){if(!img)return;const v=s=>Number(m.querySelector('#c'+s).value)/100,l=v('L'),r=v('R'),t=v('T'),b=v('B'),w=img.width*(1-l-r),h=img.height*(1-t-b),scale=Math.min(1,1800/Math.max(w,h)),rw=Math.max(1,Math.round(w*scale)),rh=Math.max(1,Math.round(h*scale));const sideways=rotation%180!==0;canvas.width=sideways?rh:rw;canvas.height=sideways?rw:rh;ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rotation*Math.PI/180);ctx.drawImage(img,img.width*l,img.height*t,w,h,-rw/2,-rh/2,rw,rh);ctx.restore()}
m.querySelector('#rotateLeft').onclick=()=>{rotation=(rotation+270)%360;draw()};
m.querySelector('#rotateRight').onclick=()=>{rotation=(rotation+90)%360;draw()};
m.querySelector('#scanfile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);img=new Image();img.onload=()=>{draw();m.querySelector('#scanSave').disabled=false;URL.revokeObjectURL(url)};img.onerror=()=>{toast('Image illisible');URL.revokeObjectURL(url)};img.src=url};
m.querySelectorAll('.crop').forEach(e=>e.oninput=draw);
m.querySelector('#scanSave').onclick=async()=>{try{const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Conversion impossible')),'image/jpeg',.85));const raw=imagePdf(new Uint8Array(await blob.arrayBuffer()),canvas.width,canvas.height),name=(m.querySelector('#scanname').value.trim()||'Document-scanné').replace(/\.pdf$/i,'')+'.pdf';store.files.push({id:id(),name,mime:'application/pdf',data:bytesToB64(raw),folder,created:new Date().toISOString(),notes:'',tags:'',expiry:'',deletedAt:null});await save();m.remove();render();toast('Scan PDF enregistré et chiffré')}catch(e){toast(e.message)}};
}
const oldChange=change;
change=async function(action,ident){
if(action==='scan'){scan();return}
if(action==='delete-file'){
  const f=store.files.find(x=>x.id===ident&&!x.deletedAt);
  if(!f)return;
  if(!confirm('Mettre « '+f.name+' » dans la corbeille ?'))return;
  f.deletedAt=today();
  await save();render();toast('Document déplacé dans la corbeille');return;
}
if(action==='bio-setup'){await setupBiometry();return}
if(action==='bio-unlock'){await unlockBiometry();return}
if(action==='bio-remove'){if(confirm('Désactiver la passkey ?')){delete secret.biometric;await setVault(secret);render()}return}
if(action==='folder-menu'){let f=store.folders.find(x=>x.id===ident);let opt=prompt('1 Renommer, 2 Déplacer, 3 Corbeille','1');if(opt==='1'){let n=prompt('Nouveau nom',f.name);if(n?.trim())f.name=n.trim()}if(opt==='2'){let name=prompt('Nom du dossier parent (vide pour racine)','');if(name!==null){let dest=store.folders.find(x=>x.name===name&&!x.deletedAt);if(!name)f.parent=null;else if(dest&&!allChildren(f.id).has(dest.id))f.parent=dest.id;else toast('Déplacement impossible')}}if(opt==='3'&&confirm('Mettre ce dossier et son contenu dans la corbeille ?')){let descendants=allChildren(f.id);store.folders.forEach(x=>{if(descendants.has(x.id))x.deletedAt=today()});store.files.forEach(x=>{if(descendants.has(x.folder))x.deletedAt=today()});folder=null}await save();render();return}
if(action==='trash'){showTrash();return}
return oldChange(action,ident);
};
const oldFilesPage=filesPage;
filesPage=function(){const original=store.folders;store.folders=original.filter(x=>!x.deletedAt);try{return oldFilesPage()}finally{store.folders=original}};
function showTrash(){
const fs=store.files.filter(x=>x.deletedAt),ds=store.folders.filter(x=>x.deletedAt&&(!x.parent||!store.folders.some(p=>p.id===x.parent&&p.deletedAt)));
const html=ds.map(x=>row('📁',x.name,'Dossier supprimé '+datefmt(x.deletedAt),act('Restaurer','restore-folder',x.id)+act('Effacer','erase-folder',x.id,'warn'))).join('')+fs.filter(x=>!ds.some(d=>allChildren(d.id).has(x.folder))).map(x=>row('▤',x.name,'Fichier supprimé '+datefmt(x.deletedAt),act('Restaurer','restore-file',x.id)+act('Effacer','erase-file',x.id,'warn'))).join('');
const m=modal('Corbeille — 30 jours',html||'<p>Corbeille vide.</p>');
m.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,fid=b.dataset.id;
if(a==='restore-folder'){let group=allChildren(fid);store.folders.forEach(x=>{if(group.has(x.id))x.deletedAt=null});store.files.forEach(x=>{if(group.has(x.folder))x.deletedAt=null})}
if(a==='erase-folder'&&confirm('Supprimer définitivement ?')){let group=allChildren(fid);store.folders=store.folders.filter(x=>!group.has(x.id));store.files=store.files.filter(x=>!group.has(x.folder))}
if(a==='restore-file'){let f=store.files.find(x=>x.id===fid);f.deletedAt=null;if(f.folder&&!store.folders.some(x=>x.id===f.folder&&!x.deletedAt))f.folder=null}
if(a==='erase-file'&&confirm('Supprimer définitivement ?'))store.files=store.files.filter(x=>x.id!==fid);
await save();m.remove();render();showTrash()});
}
const oldSave=save;
save=async function(){if(store){const cutoff=Date.now()-30*86400000,expired=new Set(store.folders.filter(x=>x.deletedAt&&new Date(x.deletedAt+'T00:00:00').getTime()<cutoff).map(x=>x.id));for(let changed=true;changed;){changed=false;for(let f of store.folders)if(expired.has(f.parent)&&!expired.has(f.id)){expired.add(f.id);changed=true}}store.folders=store.folders.filter(x=>!expired.has(x.id));store.files=store.files.filter(x=>!expired.has(x.folder)&&(!x.deletedAt||new Date(x.deletedAt+'T00:00:00').getTime()>=cutoff))}await oldSave()};

const renderBeforeAlerts=render;
render=function(){
renderBeforeAlerts();
if(!key||tab!=='home')return;
const notices=[];
for(const s of store.subscriptions){
 if(!s.next)continue;
 const d=daydiff(s.next),thresholds=String(s.alerts||'30,7').split(',').map(Number).filter(Number.isFinite);
 if(d<=Math.max(0,...thresholds))notices.push({name:s.name,days:d,kind:'Abonnement'});
}
for(const f of store.files){
 if(f.deletedAt||!f.expiry)continue;const d=daydiff(f.expiry);if(d<=30)notices.push({name:f.name,days:d,kind:'Document'});
}
if(!notices.length)return;
notices.sort((a,b)=>a.days-b.days);
const panel=document.createElement('section');panel.className='card';panel.innerHTML='<h3>Alertes à traiter</h3>'+notices.slice(0,8).map(x=>'<div class="item"><div class="main"><strong>'+escapeHTML(x.name)+'</strong><div class="sub">'+escapeHTML(x.kind)+'</div></div><span class="pill">'+(x.days<0?'En retard de '+Math.abs(x.days)+' j':x.days===0?"Aujourd'hui":'Dans '+x.days+' j')+'</span></div>').join('');
const title=document.querySelector('h2');title?.insertAdjacentElement('afterend',panel);
};