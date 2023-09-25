# Transparent MultiSig Proxy

This project demonstrates a basic Transparent proxy with multisig implementation of ProxyAdmin contract

## Getting Started

Clone this project to pull down some basic starter code.
After that cd into the base directory of the project and run `npm install` to download all the project dependencies.

## 1. Add your deployer key and API to as an environment variable for the project

Create an empty `config.ts` file in the base directory of this project.
Add the following line to the `config.ts` file replacing `URL` with your api key:

URL =your network url;
ACCOUNT_DEPLOYER = your deployer private key;
export { ACCOUNT_DEPLOYER, API };

## 2. Edit owners.ts file
Add the following lines to the `owners.ts` file replacing `OWNERS` with your owners of your MultiSig wallet contract and `required`
with the required number of signatures to accept the transaction:
const OWNERS = [];
const required = ;

## 3. Compile the contract

To compile the contract run `npx hardhat compile` in your terminal. The compile task is one of the built-in tasks.


## 4 Deploy the contract to a live network

To deploy the contract run `npx hardhat run scripts/deploy.js --network <network-name>` in your terminal.

run
