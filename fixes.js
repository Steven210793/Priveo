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
