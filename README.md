
![Logo](https://imgs.search.brave.com/bzLPj0806jU0FiVTtOFp8M66LE5deJ_AY-zDUYAiTr0/rs:fit:1024:269:1/g:ce/aHR0cHM6Ly93d3cu/ZzRmLXByb2QuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDE3/LzAxL3NvbGlkYW5p/bS0xMDI0eDI2OS5q/cGc)


# Télécommande Plateau

Projet regroupant tous les éléments en lien avec le développement d'une application de lancement synchronisé d'outils de Motion Capture.
Fonctionnant initialement sur RapsberryPi à base de scripts Python, il convient d'effectuer la migration du projet vers une WebApp tournant en local sur n'importe quelle machine windows. 

# User Guide
Guide d'utilisation etape par etape de la telecommande MoCap.
## Installation
 *Si vous souhaitez garder d'autres versions de Python sur votre machine, il vous suffit de sauter l'etape 2 et de placer le chemin de Python 2.7.10 au-dessus de celui des autres versions de Python dans la variable PATH*

 1. Dézipper l'archive a l'emplacement de votre choix
 2. Désinstaller toutes les versions de python présentes sur l'ordinateur (Si la version active est déjà 2.7.10, passer a l'étape 4)
 3. Installer Python 2.7.10 a l'aide de l'installeur dans le dossier, **en faisant bien attention a cocher "Add python.exe to PATH"**
 4. Installer la télécommande a l'aide du fichier webapp2Setup

## Utilisation

 1. Lancer l'exécutable **webApp2Server.exe** et attendre que l'invite de commande affiche 'OK". Vous pouvez maintenant réduire cette fenêtre.
 2. Lancer l'application **webappv2** *(raccourci présent dans le menu démarrer)*
 3. **MoCapez!**

## LiveLinkFace
Si vous souhaitez utiliser le script LiveLinkFace, il faut cocher les iPhones que vous souhaitez utiliser dans la carte iPhones. **ATTENTION, ILS NE SONT PAS COCHÉS DE BASE**
Vous pouvez a tout moment ajouter, retirer ou modifier des adresses d'iPhones dans le menu de modification du script LiveLinkFace. *Dans le cas ou les modifications n'apparaitraient pas directement, il suffit de rafraichir la page*


## Contributions

Les contributions sont soumises à une norme.

Toutes les explications pour faire des commit répondant à cette norme sont indiquées dans le fichier `contributing.md`.




## Utilisé par

Ce projet est utilisé par les compagnies suivantes:

- Solidanim Angoulême




## Auteurs

- [@eljanvier2](https://www.github.com/eljanvier2)
- [@lebonvieuxgui](https://wwww.github.com/lebonvieuxgui)

