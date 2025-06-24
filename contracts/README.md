# Fernbet Casino Smart Contracts

Smart contracts for the Fernbet decentralized casino platform on Base.

## Overview

Fernbet is a decentralized casino platform built on Base. Players can:
- Claim free CHIP tokens to start playing
- Deposit ETH to receive CHIP tokens (1 ETH = 1000 CHIP)
- Play various casino games using CHIP tokens
- Withdraw their CHIP tokens back to ETH

## Deployed Contracts (Base Sepolia)

### Core Contracts
- **CasinoChip**: `0x38969f932c5830787B68676Edd6105534c3e60e0`
- **CasinoBank**: `0x540A3e89E545C799976B0BC2e251f86CF74635c5`

### Game Contracts (Simplified - No VRF)
- **BlackjackSimple**: `0xC3E8f630dE5dC659d309b60D622EF40d02EAf00F`
- **DiceSimple**: `0xe569a589eB273B2d307aBE6A46E9DC01977B4270`
- **RouletteSimple**: `0x54e2a796aE8e431F171353CbF4f421304A0bB898`
- **SlotsSimple**: `0xfcfEb9E4fa07395171e281381e49aa75CCcb91e1`

## Architecture

### Core Contracts
- **CasinoChip.sol**: ERC20 token used as the casino's currency
- **CasinoBank.sol**: Handles ETH ↔ CHIP conversions, free claims, and treasury

### Game Contracts (Simplified)
All games use a simplified architecture optimized for Base and smart wallets:
- **BlackjackSimple.sol**: Classic 21 card game
- **DiceSimple.sol**: Roll over/under betting
- **RouletteSimple.sol**: European roulette with red/black/number betting
- **SlotsSimple.sol**: 3x3 slot machine with 5 paylines

### Key Features
- Immediate result generation (no VRF callbacks)
- Two-step process: Place bet → Claim winnings
- Optimized for Coinbase Smart Wallet
- Lower gas costs
- Better UX with results shown before claiming

## Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 16+

### Setup
```bash
# Install dependencies
forge install

# Copy environment variables
cp .env.example .env

# Run tests
forge test
```

### Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

Quick deploy all games:
```bash
forge script script/DeploySimpleGames.s.sol:DeploySimpleGames --rpc-url base-sepolia --broadcast --verify --account YOUR_ACCOUNT
```

### Testing
```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/CasinoBank.t.sol

# Run with gas reporting
forge test --gas-report
```

## Security

- Simplified randomness using block data (suitable for small bets)
- Reentrancy guards on all state-changing functions
- Role-based access control for admin functions
- Comprehensive test coverage

## Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `CONTRACTS_ORGANIZATION.md` - Contract structure overview
- `README_SCRIPTS.md` - Deployment scripts documentation

## License

MIT