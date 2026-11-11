'use strict';
/* Corrective patch: explicit deletion and rotation of an already saved scan. */
const priveoPriorChange=change;
const asciiBytes=s=>encoder.encode(s);
function matchBytes(hay,needle,start=0){outer:for(let i=start;i<=hay.length-needle.length;i++){for(let j=0;j<needle.length;j++)if(hay[i+j]!==needle[j])continue outer;return i}return -1}
function getScanJpeg(raw){
  const page=asciiBytes('/Subtype /Image');
  const p=matchBytes(raw,page);
  if(p<0)throw Error('Ce PDF n’est pas un scan créé dans Priveo');
  const stream=asciiBytes('stream\n'),pos=matchBytes(raw,stream,p);
  if(pos<0)throw Error('Image du scan introuvable');
  const header=decoder.decode(raw.slice(p,pos));
  const width=Number(header.match(/\/Width\s+(\d+)/)?.[1]);
  const height=Number(header.match(/\/Height\s+(\d+)/)?.[1]);
  const length=Number(header.match(/\/Length\s+(\d+)/)?.[1]);
  if(!width||!height||!length||length>raw.length)throw Error('Format du scan non reconnu');
  const offset=pos+stream.length;
  if(offset+length>raw.length)throw Error('Scan incomplet');
  return {data:raw.slice(offset,offset+length),width,height};
}
async function rotateSavedImage(file,degrees){
  const source=new Uint8Array(b64ToBytes(file.data));
  let jpg,outputMime;
  if(file.mime==='application/pdf'){
    jpg=getScanJpeg(source).data;
    outputMime='application/pdf';
  }else if(file.mime?.startsWith('image/')){
    jpg=source;outputMime=file.mime;
  }else throw Error('Rotation réservée aux scans PDF et aux photos');
  const url=URL.createObjectURL(new Blob([jpg],{type:outputMime==='application/pdf'?'image/jpeg':file.mime}));
  let image;
  try{
    image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Image illisible'));img.src=url});
    const canvas=document.createElement('canvas');
    const quarter=Math.abs(degrees)===90;
    canvas.width=quarter?image.naturalHeight:image.naturalWidth;
    canvas.height=quarter?image.naturalWidth:image.naturalHeight;
    if(canvas.width*canvas.height>24000000)throw Error('Image trop grande pour la rotation sur ce téléphone');
    const ctx=canvas.getContext('2d');
    if(!ctx)throw Error('Rotation non prise en charge');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.translate(canvas.width/2,canvas.height/2);
    ctx.rotate(degrees*Math.PI/180);
    ctx.drawImage(image,-image.naturalWidth/2,-image.naturalHeight/2);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Image non convertie')),'image/jpeg',.9));
    const buffer=new Uint8Array(await blob.arrayBuffer());
    const result=outputMime==='application/pdf'?imagePdf(buffer,canvas.width,canvas.height):buffer;
    return {data:bytesToB64(result),mime:outputMime==='application/pdf'?'application/pdf':'image/jpeg'};
  }finally{URL.revokeObjectURL(url)}
}
function showDeleteConfirmation(file){
  const dialog=modal('Supprimer un document','<p>Déplacer <strong>'+escapeHTML(file.name)+'</strong> dans la corbeille ?</p><p class="muted small">Tu pourras le restaurer pendant 30 jours dans Réglages → Corbeille.</p><div class="toolbar"><button class="btn warn" id="deleteConfirm">Supprimer le document</button><button class="btn ghost" data-close>Annuler</button></div>');
  dialog.querySelector('#deleteConfirm').addEventListener('click',async()=>{
    try{
      const current=store?.files.find(x=>x.id===file.id&&!x.deletedAt);
      if(!current){dialog.remove();toast('Ce document n’existe plus');return}
      const original=current.deletedAt;
      current.deletedAt=today();
      try{await save()}catch(err){current.deletedAt=original;throw err}
      dialog.remove();render();toast('Document supprimé : disponible dans la corbeille');
    }catch(err){toast('Suppression non enregistrée : '+err.message)}
  });
}
change=async function(action,identifier){
 if(action==='file-menu'){
   const f=store?.files.find(x=>x.id===identifier&&!x.deletedAt);if(!f)return;
   const m=modal('Actions du document','<p class="muted small">'+escapeHTML(f.name)+'</p><div class="toolbar">'+
     act('Voir','view',f.id)+act('Renommer','rename-file',f.id)+act('Déplacer','move-file',f.id)+act('Infos','info-file',f.id)+act('Supprimer','delete-file',f.id,'warn')+'</div>');
   m.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();m.remove();change(b.dataset.action,b.dataset.id)}));
   return;
 }
 if(['rename-folder','move-folder','delete-folder','folder-menu'].includes(action)){
   const f=store?.folders.find(x=>x.id===identifier&&!x.deletedAt);if(!f){toast('Dossier introuvable');return}
   if(action==='folder-menu'){
     const m=modal('Actions du dossier','<p>'+escapeHTML(f.name)+'</p><div class="toolbar">'+
     act('Ouvrir','go-folder',f.id)+act('Renommer','rename-folder',f.id)+act('Déplacer','move-folder',f.id)+act('Supprimer','delete-folder',f.id,'warn')+'</div>');
     m.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();m.remove();change(b.dataset.action,b.dataset.id)}));return;
   }
   if(action==='rename-folder'){
     const m=modal('Renommer le dossier','<form><label>Nouveau nom</label><input class="field" name="name" maxlength="200" required value="'+escapeHTML(f.name)+'"><button class="btn" type="submit">Enregistrer</button></form>');
     m.querySelector('form').onsubmit=async e=>{e.preventDefault();const v=new FormData(e.target).get('name').trim();if(!v)return;const prev=f.name;f.name=v;try{await save();m.remove();render();toast('Dossier renommé')}catch(err){f.name=prev;toast('Erreur : '+err.message)}};return;
   }
   if(action==='move-folder'){
     const blocked=allChildren(f.id);const possible=store.folders.filter(x=>!x.deletedAt&&!blocked.has(x.id));
     const opts=[{id:'',name:'Racine — Mes dossiers'},...possible.map(x=>({id:x.id,name:x.name}))];
     const sel=opts.map(x=>'<option value="'+escapeHTML(x.id)+'" '+((f.parent||'')===x.id?'selected':'')+'>'+escapeHTML(x.name)+'</option>').join('');
     const m=modal('Déplacer le dossier','<form><label>Dossier de destination</label><select class="field" name="destination">'+sel+'</select><button class="btn">Déplacer ici</button></form>');
     m.querySelector('form').onsubmit=async e=>{e.preventDefault();const v=new FormData(e.target).get('destination');if(v&&!possible.some(x=>x.id===v))return toast('Destination invalide');const prev=f.parent;f.parent=v||null;try{await save();m.remove();render();toast('Dossier déplacé')}catch(err){f.parent=prev;toast('Erreur : '+err.message)}};return;
   }
   if(action==='delete-folder'){
     const m=modal('Supprimer le dossier','<p>Mettre <strong>'+escapeHTML(f.name)+'</strong> et son contenu dans la corbeille ?</p><div class="toolbar"><button class="btn warn" id="confirmDeleteFolder">Supprimer</button><button class="btn ghost" data-close>Annuler</button></div>');
     m.querySelector('#confirmDeleteFolder').onclick=async()=>{const group=allChildren(f.id),backupF=store.folders.map(x=>({id:x.id,deletedAt:x.deletedAt})),backupFiles=store.files.map(x=>({id:x.id,deletedAt:x.deletedAt}));for(const x of store.folders)if(group.has(x.id))x.deletedAt=today();for(const x of store.files)if(group.has(x.folder))x.deletedAt=today();try{await save();folder=null;m.remove();render();toast('Dossier déplacé dans la corbeille')}catch(err){for(const x of store.folders){const prev=backupF.find(y=>y.id===x.id);if(prev)x.deletedAt=prev.deletedAt}for(const x of store.files){const prev=backupFiles.find(y=>y.id===x.id);if(prev)x.deletedAt=prev.deletedAt}toast('Erreur : '+err.message)}};return;
   }
 }
 if(['rename-file','move-file','info-file'].includes(action)){
   const file=store?.files.find(x=>x.id===identifier&&!x.deletedAt);
   if(!file){toast('Document introuvable');return}
   if(action==='rename-file'){
     const box=modal('Renommer le document','<form id="renameDocumentForm"><label>Nouveau nom</label><input name="name" class="field" required maxlength="250" value="'+escapeHTML(file.name)+'"><button class="btn" type="submit">Enregistrer</button></form>');
     box.querySelector('form').onsubmit=async ev=>{ev.preventDefault();let name=new FormData(ev.target).get('name').trim();if(!name)return;const before=file.name;file.name=name;try{await save();box.remove();render();toast('Document renommé')}catch(err){file.name=before;toast('Erreur : '+err.message)}};return;
   }
   if(action==='move-file'){
     const active=store.folders.filter(x=>!x.deletedAt);
     const opts=[{id:'',name:'Racine — Mes documents'},...active.map(x=>({id:x.id,name:x.name}))];
     const select=opts.map(x=>'<option value="'+escapeHTML(x.id)+'" '+((file.folder||'')===x.id?'selected':'')+'>'+escapeHTML(x.name)+'</option>').join('');
     const box=modal('Déplacer le document','<form id="moveDocumentForm"><p class="muted small">'+escapeHTML(file.name)+'</p><label>Dossier de destination</label><select name="destination" class="field">'+select+'</select><button class="btn" type="submit">Déplacer ici</button></form>');
     box.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const dest=new FormData(ev.target).get('destination');if(dest&&!active.some(x=>x.id===dest)){toast('Dossier introuvable');return}const before=file.folder;file.folder=dest||null;try{await save();box.remove();render();toast('Document déplacé')}catch(err){file.folder=before;toast('Erreur : '+err.message)}};return;
   }
   if(action==='info-file'){
     const box=modal('Informations du document','<form id="infoDocumentForm"><p class="muted small">'+escapeHTML(file.name)+'</p><label>Notes</label><textarea name="notes" class="field" rows="3">'+escapeHTML(file.notes||'')+'</textarea><label>Étiquettes (séparées par des virgules)</label><input class="field" name="tags" value="'+escapeHTML(file.tags||'')+'"><label>Date d’expiration</label><input class="field" type="date" name="expiry" value="'+escapeHTML(file.expiry||'')+'"><button class="btn" type="submit">Enregistrer</button></form>');
     box.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const data=Object.fromEntries(new FormData(ev.target));const old={notes:file.notes,tags:file.tags,expiry:file.expiry};Object.assign(file,data);try{await save();box.remove();render();toast('Informations enregistrées')}catch(err){Object.assign(file,old);toast('Erreur : '+err.message)}};return;
   }
 }
 if(action==='delete-file'){
   const doc=store?.files.find(x=>x.id===identifier&&!x.deletedAt);
   if(!doc){toast('Document introuvable');return}
   showDeleteConfirmation(doc);return;
 }
 if(action==='rotate-saved'){
   const doc=store?.files.find(x=>x.id===identifier&&!x.deletedAt);
   if(!doc){toast('Document introuvable');return}
   const button=document.querySelector('.modal [data-action="rotate-saved"][data-id="'+identifier+'"]');
   if(button)button.disabled=true;
   try{
     const oldData=doc.data,oldMime=doc.mime;
     const updated=await rotateSavedImage(doc,90);
     doc.data=updated.data;doc.mime=updated.mime;
     try{await save()}catch(err){doc.data=oldData;doc.mime=oldMime;throw err}
     document.querySelector('.modalbg')?.remove();
     if(previewURL){URL.revokeObjectURL(previewURL);previewURL=null}
     await priveoPriorChange('view',identifier);
     addPostSaveRotate(identifier);
     toast('Rotation de 90° enregistrée');
   }catch(err){toast('Rotation impossible : '+err.message);if(button)button.disabled=false}
   return;
 }
 await priveoPriorChange(action,identifier);
 if(action==='view')addPostSaveRotate(identifier);
};
function addPostSaveRotate(identifier){
 const file=store?.files.find(x=>x.id===identifier&&!x.deletedAt);
 if(!file||!(file.mime==='application/pdf'||file.mime?.startsWith('image/')))return;
 const modalEl=document.querySelector('.modal');
 if(!modalEl)return;
 const toolbar=modalEl.querySelector('.toolbar:last-child');
 const container=document.createElement('div');
 container.className='toolbar';
 const button=document.createElement('button');
 button.type='button';button.className='btn ghost';
 button.textContent='↷ Tourner de 90° et enregistrer';
 button.dataset.action='rotate-saved';
 button.dataset.id=identifier;
 container.appendChild(button);
 (toolbar||modalEl).appendChild(container);
}
/* Capture on the actual controls, avoiding collisions with older event handlers. */
document.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action="delete-file"],button[data-action="rotate-saved"]');
 if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 change(button.dataset.action,button.dataset.id).catch(e=>toast('Action impossible : '+e.message));
},true);

/* v9 — render file rows independently of legacy compact .item layout */
filesPage=function(){
  let crumbs=[],cur=folder;
  while(cur){const f=store.folders.find(x=>x.id===cur&&!x.deletedAt);if(!f)break;crumbs.unshift(f);cur=f.parent}
  let folders=store.folders.filter(x=>!x.deletedAt&&x.parent===folder);
  let docs=store.files.filter(x=>!x.deletedAt&&x.folder===folder);
  if(filter){
    const q=filter.toLocaleLowerCase('fr');
    folders=store.folders.filter(x=>!x.deletedAt&&x.name.toLocaleLowerCase('fr').includes(q));
    docs=store.files.filter(x=>!x.deletedAt&&[x.name,x.notes,x.tags,x.expiry].some(v=>String(v||'').toLocaleLowerCase('fr').includes(q)));
  }
  const crumbsHtml='<div class="breadcrumb"><button data-action="root">Tous les dossiers</button>'+crumbs.map(x=>' › <button data-action="go-folder" data-id="'+escapeHTML(x.id)+'">'+escapeHTML(x.name)+'</button>').join('')+'</div>';
  const toolbar='<input id="search" class="field search" placeholder="Rechercher un document, une étiquette..." value="'+escapeHTML(filter)+'"><div class="toolbar"><button class="btn" data-action="create-folder">＋ Dossier</button><button class="btn ghost" data-action="upload">＋ Fichier / Scanner</button><button class="btn ghost" data-action="template">Modèles</button></div>';
  const folderHtml=folders.length?folders.map(x=>row('📁',x.name,'Dossier',act('Ouvrir','go-folder',x.id)+act('Renommer','rename-folder',x.id)+act('Déplacer','move-folder',x.id)+act('Supprimer','delete-folder',x.id,'warn'))).join(''):'<div class="empty">Aucun dossier ici.</div>';
  const documentHtml=docs.length?docs.map(x=>{
    const text=[x.mime||'',x.expiry?'Expire le '+datefmt(x.expiry):'',x.tags||''].filter(Boolean).join(' · ');
    const buttons=[['Voir','view'],['Renommer','rename-file'],['Déplacer','move-file'],['Infos','info-file'],['Supprimer','delete-file']].map(a=>
      '<button type="button" data-action="'+a[1]+'" data-id="'+escapeHTML(x.id)+'">'+a[0]+'</button>'
    ).join('');
    return '<article class="priveo-doc"><div class="priveo-doc-head"><span class="doc-icon" aria-hidden="true">▤</span><div class="priveo-doc-text"><span class="priveo-doc-title">'+escapeHTML(x.name)+'</span><span class="priveo-doc-desc">'+escapeHTML(text)+'</span></div></div><div class="priveo-doc-buttons">'+buttons+'</div></article>';
  }).join(''):'<div class="empty">Aucun document ici.</div>';
  return crumbsHtml+toolbar+'<h2>Dossiers</h2>'+folderHtml+'<h2>Documents</h2>'+documentHtml;
};
