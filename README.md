# zkfetch-express-example

This is an example project that demonstrates how to use zk-fetch on an Express.js server. The project is a simple API that fetches the current Ethereum price in USD from the CoinGecko API and generates a proof using zk-fetch.

- Fetch Ethereum price (USD) from the CoinGecko API.
- Generate a proof for the Ethereum price using zk-fetch.
- Transform the proof data to be used on-chain

## Installation

1. Clone the repository:

    ```bash
    git clone https://gitlab.reclaimprotocol.org/starterpacks/zkfetch-express-example
    ```

2. Navigate into the project directory:

    ```bash
    cd zkfetch-express-example
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Copy the `.env.example` file to `.env`: 

    ```bash
    APP_ID=your_app_id
    APP_SECRET=your_app_secret
    PORT=8080
    ```

    You can get your `APP_ID` and `APP_SECRET` from [Reclaim Protocol Developer Portal](https://dev.reclaimprotocol.org).
    - go to the [Reclaim Protocol Developer Portal](https://dev.reclaimprotocol.org)
    - create a new public data (zkfetch) application and get the `APP_ID` and `APP_SECRET` from the application

## Usage

To start the server, run:
    ```bash
    npm start
    ```

    The server will start running on `http://localhost:8080`.

## Endpoints


### GET /generateProof

- **Description**: Generates a proof of the current Ethereum price in USD from the CoinGecko API.
- **Response**: Returns both the raw proof and the transformed proof for on-chain use.

Example response:

```json
{
  "transformedProof": { 
   {
    "claimInfo": {
      "context": "{\"extractedParameters\":{\"price\":\"2448.87\"},\"providerHash\":\"0xf44817617d1dfa5219f6aaa0d4901f9b9b7a6845bbf7b639d9bffeacc934ff9a\"}",
      "parameters": "{\"body\":\"\",\"method\":\"GET\",\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\\{\\\"ethereum\\\":\\\\{\\\"usd\\\":(?\u003Cprice\u003E[\\\\d\\\\.]+)\\\\}\\\\}\"}],\"responseRedactions\":[],\"url\":\"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd\"}",
      "provider": "http"
    },
    "signedClaim": {
      "claim": {
        "epoch": 1,
        "identifier": "0xb4ea4cae93f42790e1035a343a4a964c951300c97a63a0e1c8ee8cc1e5b56fdb",
        "owner": "0xfdf550dc8274a85bff07e5fbdbbacfe76695654b",
        "timestampS": 1725260426
      },
      "signatures": [
        "0x02b6487c862b1e9d1023b2d5ab5da5bcfde109d4e2357dc344ba048ee1cd1edb7be1ed3737b3079c5d4782795f42ee78ab3a76211a6b8a8abbd2ff173c6ffdfe1b"
      ]
    }
  },
  },
  "proof": { 
    "request": {
        ....
    },
  }
}
```
