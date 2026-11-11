/* Priveo v10 — catalogue de 14 modèles validés. Les noms de documents sont des suggestions, jamais des fichiers fictifs. */
'use strict';
const PRV_MODELS = [
 {name:"Identité et état civil",sections:[
 ["Pièces d'identité",["Carte nationale d'identité","Passeport","Permis de conduire"]],
 ["État civil",["Acte de naissance","Livret de famille","Acte de mariage","Acte de décès"]],
 ["Nationalité et résidence",["Certificat de nationalité","Justificatif de domicile","Titre de séjour"]],
 ["Autres documents",["Attestations administratives","Documents divers"]]]},
 {name:"Véhicules",prompt:"Nom du véhicule",example:"BMW 330e",sections:[
 ["Documents administratifs",["Certificat d'immatriculation (carte grise)","Certificat de cession","Certificat de situation administrative","Facture ou contrat d'achat"]],
 ["Assurance",["Contrat d'assurance","Attestation d'assurance","Constats et sinistres"]],
 ["Entretien et réparations",["Carnet d'entretien","Factures d'entretien","Factures de réparations"]],
 ["Contrôle technique",["Procès-verbaux de contrôle technique","Contre-visites éventuelles"]],
 ["Garanties et financement",["Garantie constructeur ou vendeur","Contrat de crédit ou leasing","Extension de garantie"]]]},
 {name:"Logement",prompt:"Nom du logement",example:"Résidence principale",sections:[
 ["Propriété ou location",["Acte de propriété ou bail","État des lieux","Dépôt de garantie","Diagnostics immobiliers"]],
 ["Assurance habitation",["Contrat d'assurance","Attestations d'assurance","Déclarations de sinistre"]],
 ["Charges et copropriété",["Appels de charges","Règlement de copropriété","Procès-verbaux d'assemblée générale","Régularisations de charges"]],
 ["Travaux et entretien",["Devis de travaux","Factures de travaux","Contrats d'entretien","Certificats et attestations de conformité"]],
 ["Taxes et financement",["Taxe foncière","Taxe d'habitation, si applicable","Contrat de prêt immobilier","Tableau d'amortissement"]]]},
 {name:"Banques et comptes",prompt:"Nom de la banque",example:"BoursoBank",sections:[
 ["Comptes bancaires",["Convention d'ouverture de compte","Relevé d'identité bancaire (RIB)","Relevés de compte","Attestations bancaires"]],
 ["Cartes bancaires",["Contrat de carte bancaire","Conditions tarifaires","Garanties et assurances de la carte"]],
 ["Crédits et emprunts",["Contrat de prêt","Tableau d'amortissement","Attestation de remboursement","Documents de garantie du prêt"]],
 ["Épargne bancaire",["Contrats de livrets d'épargne","Relevés d'épargne","Attestations et justificatifs"]],
 ["Correspondances et démarches",["Courriers de la banque","Réclamations","Attestations de clôture de compte"]]]},
 {name:"Assurances",sections:[
 ["Assurance automobile",["Contrat d'assurance","Attestations et justificatifs","Avis d'échéance et cotisations","Sinistres et indemnisations"]],
 ["Assurance habitation",["Contrat d'assurance","Attestations d'assurance","Avis d'échéance et cotisations","Déclarations de sinistre"]],
 ["Assurance santé et prévoyance",["Contrat de mutuelle","Tableau des garanties","Attestations de couverture","Contrats de prévoyance"]],
 ["Assurance emprunteur",["Contrat d'assurance de prêt","Garanties et exclusions","Cotisations","Modifications du contrat"]],
 ["Responsabilité civile et autres",["Responsabilité civile","Protection juridique","Assurance loisirs et voyages","Autres contrats"]]]},
 {name:"Santé",prompt:"Nom de la personne",example:"Mon dossier santé",sections:[
 ["Sécurité sociale et mutuelle",["Attestation de droits à l'Assurance Maladie","Attestation de mutuelle","Carte de tiers payant","Décomptes de remboursement"]],
 ["Consultations médicales",["Comptes rendus de consultation","Certificats médicaux","Courriers de spécialistes"]],
 ["Analyses et examens",["Analyses sanguines","Résultats d'imagerie médicale","Comptes rendus d'examens"]],
 ["Ordonnances et traitements",["Ordonnances médicales","Prescriptions de soins","Justificatifs de traitement"]],
 ["Hospitalisations et interventions",["Comptes rendus opératoires","Comptes rendus d'hospitalisation","Documents de sortie"]],
 ["Vaccinations et prévention",["Carnet de vaccination","Attestations de vaccination","Bilans de prévention"]]]},
 {name:"Travail et carrière",prompt:"Nom de l'employeur",example:"Mon employeur",sections:[
 ["Contrats de travail",["Contrat de travail","Avenants au contrat","Fiche de poste","Attestations de l'employeur"]],
 ["Salaires et rémunération",["Bulletins de salaire","Primes et gratifications","Attestations de salaire","Documents d'intéressement et participation"]],
 ["Congés et absences",["Congés payés","Arrêts de travail","Autorisations d'absence","Compte épargne-temps"]],
 ["Entretiens et évolution professionnelle",["Entretiens annuels","Évaluations professionnelles","Promotions et changements de poste"]],
 ["Médecine du travail",["Attestations de suivi médical","Avis d'aptitude ou d'inaptitude","Documents de prévention"]],
 ["Fin de contrat",["Certificat de travail","Solde de tout compte","Attestation France Travail","Documents de rupture du contrat"]]]},
 {name:"Impôts et fiscalité",sections:[
 ["Impôt sur le revenu",["Déclarations de revenus","Avis d'imposition","Avis de situation déclarative","Justificatifs de revenus"]],
 ["Impôts immobiliers",["Avis de taxe foncière","Avis de taxe d'habitation, si applicable","Déclarations de biens immobiliers"]],
 ["Réductions et crédits d'impôt",["Dons aux associations","Emploi à domicile","Frais de garde d'enfants","Travaux ouvrant droit à un avantage fiscal"]],
 ["Prélèvements et paiements",["Échéanciers de prélèvement","Justificatifs de paiement","Régularisations et remboursements"]],
 ["Correspondances fiscales",["Courriers de l'administration fiscale","Demandes de renseignements","Réclamations et réponses","Documents de contrôle fiscal"]]]},
 {name:"Abonnements",sections:[
 ["Télévision et streaming",["Contrats d'abonnement","Factures et paiements","Conditions de résiliation"]],
 ["Musique et services numériques",["Contrats d'abonnement","Factures et paiements","Conditions de renouvellement"]],
 ["Téléphone et Internet",["Contrats opérateurs","Factures","Engagements et résiliations"]],
 ["Sport et loisirs",["Contrats d'adhésion","Justificatifs de paiement","Conditions de résiliation"]],
 ["Autres abonnements",["Contrats","Factures","Courriers et résiliations"]]]},
 {name:"Factures et garanties",sections:[
 ["Électroménager",["Factures d'achat","Certificats de garantie","Notices et manuels","Réparations et SAV"]],
 ["Informatique et téléphonie",["Factures d'achat","Garanties","Réparations","Notices"]],
 ["Mobilier et équipement maison",["Factures d'achat","Garanties","Notices de montage","Service après-vente"]],
 ["Outillage et bricolage",["Factures d'achat","Garanties","Notices d'utilisation","Réparations"]],
 ["Autres achats",["Factures","Garanties","Retours et remboursements","Réclamations"]]]},
 {name:"Énergie et services",sections:[
 ["Électricité",["Contrats d'abonnement","Factures d'électricité","Échéanciers et paiements","Relevés de compteur","Résiliations et changements de fournisseur"]],
 ["Gaz",["Contrats de fourniture","Factures de gaz","Échéanciers et paiements","Relevés de compteur","Attestations et résiliations"]],
 ["Eau et assainissement",["Contrats de fourniture d'eau","Factures d'eau","Relevés de compteur","Régularisations","Documents d'assainissement"]],
 ["Chauffage et entretien",["Contrats d'entretien de chaudière","Attestations d'entretien","Factures de maintenance","Interventions et réparations"]],
 ["Autres services du logement",["Collecte des déchets et redevances","Entretien des équipements","Contrats de services","Factures et justificatifs"]]]},
 {name:"Téléphonie et informatique",sections:[
 ["Téléphones et tablettes",["Factures d'achat","Garanties","Réparations et SAV","Notices et documentations"]],
 ["Ordinateurs et périphériques",["Factures d'achat","Garanties","Notices et manuels","Réparations et entretien"]],
 ["Forfaits mobiles",["Contrats opérateurs","Factures","Conditions d'engagement","Résiliations et portabilité"]],
 ["Internet et box",["Contrats Internet","Factures et paiements","Documents d'installation","Résiliations et retours de matériel"]],
 ["Logiciels et licences",["Factures de logiciels","Licences d'utilisation","Contrats de maintenance","Dates de renouvellement"]],
 ["Services numériques et cloud",["Contrats de services","Factures","Conditions d'abonnement","Documents de résiliation"]]]},
 {name:"Formations et diplômes",sections:[
 ["Diplômes scolaires et universitaires",["Diplômes obtenus","Relevés de notes","Attestations de réussite","Certificats de scolarité"]],
 ["Formations professionnelles",["Conventions de formation","Attestations de formation","Certificats de réussite","Supports et documents de formation"]],
 ["Habilitations et certifications",["Certificats d'habilitation","Autorisations et agréments","Attestations de recyclage","Documents de renouvellement"]],
 ["Permis et qualifications",["Permis professionnels","Certificats de qualification","Attestations d'aptitude","Justificatifs de compétences"]],
 ["Formation continue et CPF",["Inscriptions aux formations","Attestations de participation","Justificatifs de financement CPF","Factures de formation"]]]},
 {name:"Juridique et notaire",sections:[
 ["Actes notariés",["Actes authentiques","Actes de donation","Procurations notariées","Attestations et copies d'actes"]],
 ["Successions et héritages",["Testaments","Actes de notoriété","Déclarations de succession","Documents de partage et d'héritage"]],
 ["Contrats et engagements",["Contrats privés","Reconnaissances de dette","Conventions et accords","Avenants et résiliations"]],
 ["Procédures et litiges",["Courriers d'avocats","Mises en demeure","Décisions de justice","Pièces et justificatifs de procédure"]],
 ["Famille et patrimoine",["Contrats de mariage","Conventions de PACS","Jugements de divorce","Documents de partage patrimonial"]],
 ["Correspondances et honoraires",["Courriers du notaire","Courriers d'avocat","Devis et conventions d'honoraires","Factures et justificatifs de paiement"]]]}
];
function prvTemplatePicker(){
 if(!key||!store)return;
 const html='<p class="muted small">Choisis un modèle. Les dossiers sont créés uniquement après confirmation. Les documents affichés en aperçu sont des suggestions, pas des fichiers.</p>'+
 '<label for="prvModelSelect">Choisir le thème</label><select class="field" id="prvModelSelect">'+PRV_MODELS.map((m,i)=>'<option value="'+i+'">'+(i+1)+'. '+escapeHTML(m.name)+'</option>').join('')+'</select><div id="prvModelPreview"></div>';
 const dialog=modal('Modèles de dossiers',html);
 const sel=dialog.querySelector('#prvModelSelect'),preview=dialog.querySelector('#prvModelPreview');
 const redraw=()=>{
  const m=PRV_MODELS[Number(sel.value)];
  preview.innerHTML='<p class="muted small">Ce modèle contient '+m.sections.length+' sous-dossiers.</p>'+
  (m.prompt?'<label for="prvModelName">'+escapeHTML(m.prompt)+'</label><input class="field" id="prvModelName" maxlength="120" placeholder="'+escapeHTML(m.example||'Nom')+'" required>':'')+
  '<details style="margin:12px 0"><summary style="cursor:pointer">Voir les dossiers et documents suggérés</summary>'+
  m.sections.map(s=>'<div style="margin:10px 0"><strong>📁 '+escapeHTML(s[0])+'</strong><div class="muted small" style="padding-left:15px">'+s[1].map(escapeHTML).join(' · ')+'</div></div>').join('')+'</details>'+
  '<p class="muted small">Emplacement : '+escapeHTML(folder?(store.folders.find(f=>f.id===folder)?.name||'Dossier actuel'):'Racine des dossiers')+'</p>'+
  '<button class="btn" type="button" id="prvCreateModel">Créer ce modèle</button>';
  preview.querySelector('#prvCreateModel').onclick=async()=>{
   if(!key||!store){dialog.remove();return}
   const label=m.prompt?preview.querySelector('#prvModelName').value.trim():'';
   if(m.prompt&&!label){toast('Indique '+m.prompt.toLocaleLowerCase('fr'));preview.querySelector('#prvModelName').focus();return}
   const parent=folder, oldLength=store.folders.length;
   const rootName=m.name;
   try{
    let root=store.folders.find(f=>!f.deletedAt&&f.parent===parent&&f.name===rootName);
    // Un modèle du même thème enrichit son dossier existant, sans dupliquer les noms.
    if(!root){root={id:id(),name:rootName,parent,created:today(),deletedAt:null};store.folders.push(root)}
    let target=root;
    if(m.prompt){
     target=store.folders.find(f=>!f.deletedAt&&f.parent===root.id&&f.name===label);
     if(!target){target={id:id(),name:label,parent:root.id,created:today(),deletedAt:null};store.folders.push(target)}
    }
    for(const section of m.sections){
     if(!store.folders.some(f=>!f.deletedAt&&f.parent===target.id&&f.name===section[0]))
      store.folders.push({id:id(),name:section[0],parent:target.id,created:today(),deletedAt:null});
    }
    await save();
    dialog.remove();tab='files';folder=target.id;filter='';render();
    toast('Modèle '+m.name+' créé : '+m.sections.length+' dossiers');
   }catch(err){
    // Ne pas laisser des modifications partiellement enregistrées en mémoire.
    try{const current=await getVault();if(current?.box)store=await decrypt(current.box,key)}catch(e){}
    toast('Création impossible : '+err.message);
   }
  };
 };
 sel.addEventListener('change',redraw);redraw();
}
// Capture le bouton Modèles avant l'ancien menu à 3 choix.
document.addEventListener('click',e=>{
 const b=e.target.closest('button[data-action="template"]');
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 prvTemplatePicker();
},true);
