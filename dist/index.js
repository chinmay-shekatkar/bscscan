var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dotenv from 'dotenv';
import axios from 'axios';
import { ethers } from "ethers";
dotenv.config();
const apiKey = process.env.API_KEY; //bscscan API key added in /dist/.env file
let map = {};
/**
 * Converts UNIX Timestamp to Local time
 * @param - UNIX Timestap
 * @return - Formatted Local time
 */
function timeConverter(UNIX_timestamp) {
    var convertedDate = new Date(UNIX_timestamp * 1000);
    var year = convertedDate.getFullYear();
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthName = month[convertedDate.getMonth()];
    var date = convertedDate.getDate();
    var hours = convertedDate.getHours();
    var minutes = "0" + convertedDate.getMinutes();
    var seconds = "0" + convertedDate.getSeconds();
    var formattedTime = date + ' ' + monthName + ' ' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}
/**
 * Gets Token transactions and wallet balance
 */
function getData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const walletAddress = process.argv.slice(2); //provided wallet address in CLI argument
            //checks if provided CLI argument wallet address is correct using Ethers library 
            const index = walletAddress.findIndex(item => ethers.utils.isAddress(item) ?
                console.log("Getting data for following wallet: ", item)
                : console.log("Invalid Address"));
            //API request to bscscan with cli argument passed in
            const response = yield axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&address=${process.argv.slice(2)}&startblock=0&endblock=999999999&sort=asc&apikey=${apiKey}`);
            console.log();
            console.log("Token Transactions");
            response.data.result.forEach(function (element) {
                console.log("------------------------------------------------------------------------------");
                console.log("Transaction ID: ", element.hash);
                console.log("Date & Time: ", timeConverter(element.timeStamp)); //convert Unix time to readable format
                console.log("Token Symbol: ", element.tokenSymbol);
                console.log("Amount: ", ethers.utils.formatEther(element.value)); //format token to 18 decimals using Ethers library
                map[element.tokenSymbol] = element.contractAddress; //using hashmap to get all tokens list
                console.log("------------------------------------------------------------------------------", "\n");
            });
            console.log("BEP20 Assets and their contract addresses", map);
            console.log();
            //Get user balance for each of the above tokens by calling bscscan API
            for (let key in map) {
                console.log(`User balance for the ${key} Token`);
                console.log("----------------------------------------");
                const response = yield axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${map[key]}&address=${process.argv.slice(2)}&tag=latest&apikey=${apiKey}`);
                let balance = response.data.result;
                const tokenValue = ethers.utils.formatEther(balance);
                console.log(tokenValue);
                console.log("----------------------------------------", "\n");
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
getData();
//# sourceMappingURL=index.js.map