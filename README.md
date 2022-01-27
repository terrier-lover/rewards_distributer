# Rewards Distributer
This software provides a functionality to distribute tokens as rewards to target users. The distribution is based on Merkle Tree algorithm. Admins of the contract can specify any tokens to distribute to their users.

Technical stacks are as follows:
- Solidity
- Hardhat
- Typescript
- React (React Query)

Solidity source codes use following techniques or algorithms:
- OpenZeppelin
  - [Merkle Proof](https://docs.openzeppelin.com/contracts/4.x/api/utils#MerkleProof)
  - [Reentrancy Guard](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard)
  - [Access Control](https://docs.openzeppelin.com/contracts/4.x/api/access)
  - [Hardhat Upgrades API](https://docs.openzeppelin.com/upgrades-plugins/1.x/api-hardhat-upgrades)

# How to install
- git clone https://github.com/terrier-lover/rewards_distributer.git

## Hardhat
- cd hardhat 
- npm install

If you want to use localnet, do followings:
- npx hardhat node
- npx hardhat compile
- npx hardhat run scripts/deploy.ts --network localhost
- npx hardhat run scripts/helper/runSendETHToContract.ts --network localhost * # Change hardcoded variable of address in runSendETHToContract.ts *

Whenever hardhat compiles and produces new typechains (this is exported under ./hardhat/typechain), copy typechains in hardhat/typechain/ to /frontend/src/typechain/ so that frontend code can use latest definitions. In addition, change the front-end codebase accordingly.

## Frontend
- cd frontend
- npm install
- npm start

# How to test

# Demo
See [this demo page](https://github.com/terrier-lover/rewards_distributer/blob/main/demo/README.md)

## References
- [Uniswap Merkle Distributer implementation](https://github.com/Uniswap/merkle-distributor)
- [Open Zeppelin - Merkle Tree impelemntation of NFT airdrop](https://blog.openzeppelin.com/workshop-recap-building-an-nft-merkle-drop/ )
- [Merkle airdrop starter](https://github.com/Anish-Agnihotri/merkle-airdrop-starter)

## License - MIT License

Copyright 2022 TerrierLover

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
