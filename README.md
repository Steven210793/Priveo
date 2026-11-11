# Priveo

Application web installable (PWA) pour les documents personnels et échéances.

## Sécurité

Les données et fichiers sont conservés dans IndexedDB **sous forme chiffrée AES-GCM 256 bits**, avec clé dérivée du mot de passe par PBKDF2-SHA-256 (310 000 itérations). Les données ne sont jamais placées dans le dépôt GitHub.

**Important :** version initiale expérimentale, non auditée. L’authentification WebAuthn/PRF est proposée lorsque le téléphone la prend en charge, avec mot de passe en solution de secours ; cette fonction n’a pas encore été validée par un test sur le téléphone. Utiliser un mot de passe long et unique. La perte du mot de passe rend les données illisibles. Faire une sauvegarde chiffrée externe avant toute utilisation importante.

## Fonctions livrées

- Création d'un coffre chiffré, verrouillage automatique.
- Dossiers et modèles, documents importés en local, renommage, notes et étiquettes.
- Recherche, aperçu des images et PDF, corbeille temporaire des fichiers.
- Abonnements et échéances, suivi du coût mensuel, confirmation de renouvellement.
- Export et restauration manuelle d'une sauvegarde chiffrée.
- Application hors ligne après installation et chargement initial.

## À compléter

- Authentification par passkey Android avec WebAuthn PRF implémentée si l'appareil le permet ; reste à valider en test réel sur Android. Le code de déverrouillage de l'appareil peut se substituer à l'empreinte.
- Scanner PDF sur une page avec photo et réglages de recadrage désormais disponible ; à tester sur Android.
- Notifications système hors application (pas garanties avec une application locale pure).
- Corbeille chiffrée des dossiers et fichiers avec restauration, purge à 30 jours ; à tester sur Android.
- Tests Android, quota de stockage et audit de sécurité.

## Déploiement

Dans les paramètres du dépôt GitHub : **Settings → Pages → Deploy from a branch → main → / (root)**. L'adresse habituelle est `https://steven210793.github.io/Priveo/` après activation.

Ne jamais placer de fichiers privés dans le dépôt public.
