# Guide de Déploiement sur Base Sepolia

## Prérequis

1. **Base Sepolia ETH** : Obtenez des ETH de test sur https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. **LINK tokens** : Pour Chainlink VRF (obtenez-les sur https://faucets.chain.link/base-sepolia)
3. **Compte Basescan** : Pour la vérification des contrats (https://basescan.org/register)

## Étapes de Déploiement

### 1. Configuration de l'environnement

```bash
cd contracts
cp .env.base .env
# Éditez .env et ajoutez votre PRIVATE_KEY
```

### 2. Créer une subscription VRF

1. Allez sur https://vrf.chain.link/base-sepolia
2. Connectez votre wallet
3. Créez une nouvelle subscription
4. Notez l'ID de subscription
5. Mettez à jour `VRF_SUBSCRIPTION_ID` dans le script

### 3. Déployer les contrats

```bash
# Assurez-vous d'avoir des Base Sepolia ETH
forge script script/DeployBase.s.sol:DeployBaseScript \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  --account Dev
```

### 4. Après le déploiement

1. **Ajouter les consumers VRF** :
   - Retournez sur https://vrf.chain.link/base-sepolia
   - Ajoutez les adresses des contrats (Blackjack, Roulette, Slots) comme consumers
   - Financez la subscription avec des LINK tokens

2. **Mettre à jour le frontend** :
   - Copiez les adresses déployées
   - Mettez à jour `src/config/networks.js` avec les nouvelles adresses
   - Changez `DEFAULT_NETWORK` à 'base-sepolia'

## Avantages de Base Sepolia

✅ **Transactions Gasless** : Coinbase sponsorise automatiquement les transactions
✅ **Meilleure UX** : Les utilisateurs n'ont pas besoin d'ETH pour jouer
✅ **Performance** : Réseau plus rapide et moins congestionné
✅ **Support Coinbase** : Intégration native avec Coinbase Smart Wallet

## Test des Transactions Gasless

1. Connectez-vous avec Coinbase Smart Wallet
2. Assurez-vous d'être sur Base Sepolia
3. Les transactions seront automatiquement sponsorisées
4. Vérifiez dans l'explorateur : pas de gas payé par l'utilisateur

## Commandes Utiles

```bash
# Vérifier le solde
cast balance $YOUR_ADDRESS --rpc-url base-sepolia

# Vérifier un contrat
cast code $CONTRACT_ADDRESS --rpc-url base-sepolia

# Appeler une fonction view
cast call $CONTRACT_ADDRESS "balanceOf(address)" $USER_ADDRESS --rpc-url base-sepolia
```