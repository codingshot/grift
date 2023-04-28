async function createDAODrop() {
    const path = require("path");
const homedir = require("os").homedir();
const { KeyPair, keyStores, connect, Account } = require("near-api-js");
var assert = require('assert');
require('dotenv').config();
let telegram_public_bot = process.env.TELEGRAM_KEYBOT;

const keypom = require("keypom-js");
// const { DEV_CONTRACT } = require("./configurations");
// const TESTNET_DAO_CONTRACT = "onboard.sputnikv2.testnet";
const DAO_CONTRACT = "onboarddao.sputnik-dao.near";
// let griftChatID = process.env.griftChatID;
let griftChatID = "-1001902204231";
// qr code generator
// const QRCode = require('qrcode-generator');

// const url = 'https://example.com';
// const qr = QRCode(0, 'M');
// qr.addData(url);
// qr.make();
// const qrCodeSvg = qr.createSvgTag(4);

// Do something with the generated QR code SVG string
// add number of drops to CLI
// Retrieve the command-line arguments using the process.argv array
const args = process.argv.slice(2);

// Check if the argument was passed
if (args.length === 0) {
  console.error('Please provide a number as an argument.');
  process.exit(1);
}

// Get the argument value and convert it to a number
const numberOfKeys = parseInt(args[0], 10);
if (isNaN(numberOfKeys)) {
  console.error('Invalid number provided as an argument.');
  process.exit(1);
}
// Use the number in your script
console.log(`The number of keys to generate is: ${numberOfKeys}.`);
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(telegram_public_bot, { polling: false });


const {
	initKeypom,
	getEnv,
	createDrop,
    parseNearAmount,
    createNFTSeries,
    formatLinkdropUrl
} = keypom

// Change this to your account ID
const FUNDER_ACCOUNT_ID = "onboarder.near";
const NETWORK_ID = "mainnet";
const roleName = "Grifters";
const CREDENTIALS_DIR = ".near-credentials";     // Initiate connection to the NEAR blockchain.
const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
const numberOfKeys1 = 1; // basically number of links to generate // change back
let keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);  

let nearConfig = {
    networkId: NETWORK_ID,
    keyStore: keyStore,
    nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
    walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
    helperUrl: `https://helper.${NETWORK_ID}.near.org`,
    explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
};  

    
let near = await connect(nearConfig);
const fundingAccount = new Account(near.connection, FUNDER_ACCOUNT_ID)
// If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
// Here we are connecting to the testnet network
await initKeypom({
    near,
    network: NETWORK_ID,
});

// Create drop with 10 keys and 2 key uses each
let {keys, dropId} = await createDrop({
    account: fundingAccount,
    numKeys: numberOfKeys,
    config: {
        usesPerKey: 1
    },
            depositPerUseNEAR: "0.01",

    fcData: {
        methods: [
            [
                {
                    receiverId: DAO_CONTRACT,
                    methodName: "add_proposal",
                    args: JSON.stringify(
                        {
                            "proposal": {
                            "description": "Welcome to Onboard DAO, you GRIFTER! 👅🎭💰 powered by Keypom",
                            "kind": {
                                "AddMemberToRole": {
                                "role": roleName

                                }
                            }
                            }
                        }
                    ),
                    accountIdField: "proposal.kind.AddMemberToRole.member_id",
                    funderIdField: "funder",
                    attachedDeposit: parseNearAmount("0.01")
                }
                // {
                //     receiverId: DAO_CONTRACT,
                //     methodName: "add_proposal",
                //     args: JSON.stringify(
                //         {
                //           "proposal": {
                //             "description": "Give new member some NEAR",
                //             "kind": {
                //               "Transfer": {
                //                 "token_id": "",
                //                 "amount": "100000000000000000000000"

                //               }
                //             }
                //           }
                //         }
                //     ),
                //     accountIdField: "proposal.kind.Transfer.receiver_id",
                //     funderIdField: "funder",
                //     attachedDeposit: parseNearAmount("0.1") // maybe change because deposit
                // }
                // {
                //     receiverId: SOCIAL_CONTRACT,
                //     methodName: "set",
                //     args: JSON.stringify(
                //         {
                //           "data": {
                //                 "onboarding.testnet": {
                //                   "profile": {
                //                     "name": "ONBOARD DAO GOT ME HERE",
                //                     "image": {},
                //                     "linktree": {}
                //                   }
                //               }

                //           }
                //         }
                //     ),
                //     accountIdField: "set.data.receiver_id",
                //     funderIdField: "funder",
                //     attachedDeposit: parseNearAmount("0.1") // maybe change because deposit
                // },

            ],
        ] 
            
    }   
})

    const {contractId: KEYPOM_CONTRACT} = getEnv()
    let membership = formatLinkdropUrl({
        customURL: "https://wallet.near.org/linkdrop/CONTRACT_ID/SECRET_KEY",
        secretKeys: keys.secretKeys,
        contractId: KEYPOM_CONTRACT,
    })
    console.log(`
    
    For NEW Grifter Members: 
    
    ${membership}
    

    `)
    let output = "Met a grifter? Want to onboard a new user to NEAR but mark that address as a Grifter?"+ JSON.stringify(membership);

      bot.sendMessage(griftChatID, output);



    return keys
}

createDAODrop()

module.exports = {
    createDAODrop
}