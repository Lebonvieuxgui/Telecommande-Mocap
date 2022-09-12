# SolidMocapMaster

## Introduction

SolidMocapMaster est une application web permettant le contrôle de plusieurs casques de motion capture. Elle dispose de toutes les fonctionnalités disponibles sur l'application mono-casque SolidMocapHelmet et permet en plus d'utiliser d'autres appareils tels que des caméras Vicon ou un AJA Kipro.

## Matériel

### Raspberry Pi

L'application repose sur un serveur NodeJs lancé sur un Raspberry Pi 3. La version 2 du Raspberry Pi peut être utilisée, mais des problèmes de performance peuvent arriver.

## Installer le serveur sur un Raspberry Pi

La procédure d'installation du serveur est détaillée **ici**.

## Accéder à l'application

Pour accéder à l'application, connectez le Raspberry Pi sur le même réseau que votre ordinateur, puis ouvrez un navigateur web (Chrome, Firefox ou Safari) et entrez l'addresse IP du Raspberry Pi suivi de ":3000" dans l'url. (exemple: "192.168.1.200:3000")

Pour plus d'informations sur le fonctionnement de l'application, consultez cette **page**, ou ajoutez "/documentation" à la suite de l'URL. (exemple: "192.168.1.200/documentation")
