import express, { Request, Response } from 'express';
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';
import { Reclaim } from '@reclaimprotocol/js-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the ReclaimClient with the app id and app secret (you can get these from the Reclaim dashboard - https://dev.reclaimprotocol.org/) 
const reclaimClient = new ReclaimClient(process.env.APP_ID!, process.env.APP_SECRET!);
const app = express();


app.get('/', (_: Request, res: Response) => {
    res.send('gm gm! api is running');
});

app.get('/generateProof', async (_: Request, res: Response) => {
    try{
        // URL to fetch the data from - in this case, the price of Ethereum in USD from the CoinGecko API
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
        /* 
        * Fetch the data from the API and generate a proof for the response. 
        * The proof will contain the USD price of Ethereum. 
        */ 
        const proof = await reclaimClient.zkFetch(url, {
          // public options for the fetch request 
          method: 'GET',
        }, {
          // options for the proof generation
          responseMatches: [
            /* 
            * The proof will match the response body with the regex pattern (search for the price of ethereum in the response body 
            the regex will capture the price in the named group 'price').
            * to extract the price of Ethereum in USD. (e.g. {"ethereum":{"usd":3000}}) 
            */ 
            {
                "type": "regex",
                "value": "\\{\"ethereum\":\\{\"usd\":(?<price>[\\d\\.]+)\\}\\}"
            }
          ],
        });
      
        if(!proof) {
          return res.status(400).send('Failed to generate proof');
        }
        // Verify the proof
        const isValid = await Reclaim.verifySignedProof(proof);
        if(!isValid) {
          return res.status(400).send('Proof is invalid');
        }
        // Transform the proof data to be used on-chain (for the contract)
         const proofData = await Reclaim.transformForOnchain(proof);
        return res.status(200).json({ transformedProof: proofData, proof });
    }
    catch(e){
        console.log(e);
        return res.status(500).send(e);
    }
})



const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});