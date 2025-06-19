# Guide de Déploiement Base Sepolia

## Prérequis

1. **Base Sepolia ETH** : Obtenez des ETH de test sur https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. **LINK tokens** : Pour Chainlink VRF sur https://faucets.chain.link/base-sepolia
3. **Compte Cast** : Votre wallet doit être configuré avec `cast wallet import`

## Déploiement avec Prédiction d'Adresses

Le nouveau script utilise la prédiction d'adresses pour éviter les problèmes de dépendance circulaire entre CasinoBank et CasinoChip.

### 1. Déployer les Contrats

```bash
cd contracts
forge script script/DeployBasePredicted.s.sol:DeployBasePredictedScript \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  --account Dev
```

### 2. Ajouter les Consumers VRF

Après le déploiement :
1. Allez sur https://vrf.chain.link/base-sepolia
2. Trouvez votre subscription ID : `33044594880601817352894325160789429723471484151736253683391306672267394653937`
3. Ajoutez ces contrats comme consumers :
   - Blackjack
   - Roulette
   - Slots

### 3. Mettre à Jour le Frontend

Copiez les adresses déployées dans `src/config/contracts.js` :

```javascript
'base-sepolia': {
  casinoChip: '0x...',  // Nouvelle adresse
  casinoBank: '0x...',  // Nouvelle adresse
  blackjack: '0x...',   // Nouvelle adresse
  dice: '0x...',        // Nouvelle adresse
  roulette: '0x...',    // Nouvelle adresse
  slots: '0x...',       // Nouvelle adresse
}
```

## Vérification des Contrats

Les contrats seront automatiquement vérifiés sur Basescan si vous utilisez `--verify`.

Les liens de vérification seront affichés dans la console :
- https://sepolia.basescan.org/address/[CONTRACT_ADDRESS]

## Architecture

Le script déploie dans cet ordre :
1. **CasinoChip** - avec l'adresse prédite de CasinoBank
2. **CasinoBank** - avec l'adresse de CasinoChip
3. **Games** - Blackjack, Dice, Roulette, Slots
4. **Configuration** - CASINO_ROLE et funding

Cette approche garantit que CasinoChip et CasinoBank se référencent correctement.