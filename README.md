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

4. Download the zk-circuits:

    ```bash
    npm run download:zk-circuits
    ```

5. Copy the `.env.example` file to `.env`: 

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
    "claimInfo": {
      "context": "{\"extractedParameters\":{\"price\":\"3631.24\"},\"providerHash\":\"0xf24d5fcf27bb451191f7995e51c600440144d5d590ddf0daed50389498855189\"}",
      "parameters": "{\"body\":\"\",\"method\":\"GET\",\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\\{\\\"ethereum\\\":\\\\{\\\"usd\\\":(?\u003Cprice\u003E[\\\\d\\\\.]+)\\\\}\\\\}\"}],\"responseRedactions\":[{\"regex\":\"\\\\{\\\"ethereum\\\":\\\\{\\\"usd\\\":(?\u003Cprice\u003E[\\\\d\\\\.]+)\\\\}\\\\}\"}],\"url\":\"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd\"}",
      "provider": "http"
    },
    "signedClaim": {
      "claim": {
        "epoch": 1,
        "identifier": "0x2938ad9627cb3f7c75cb3c53d96c34fea0bdff32834c447d71660fa48fab4b7e",
        "owner": "0x60c0460147eb204e505c1142bd3a8e7028137466",
        "timestampS": 1735996331
      },
      "signatures": [
        "0xac961a2d1d169f2f5838d6caf650a6aff7dd764b7c71bdf2c66518231392a11f4ea1917190c0d9579bd6180f8b04fd2a42c1d8a78abbb711cf47fdf6466ad0e31b"
      ]
    }
  },
  "proof": {
    "claimData": {
      "provider": "http",
      "parameters": "{\"body\":\"\",\"method\":\"GET\",\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\\{\\\"ethereum\\\":\\\\{\\\"usd\\\":(?\u003Cprice\u003E[\\\\d\\\\.]+)\\\\}\\\\}\"}],\"responseRedactions\":[{\"regex\":\"\\\\{\\\"ethereum\\\":\\\\{\\\"usd\\\":(?\u003Cprice\u003E[\\\\d\\\\.]+)\\\\}\\\\}\"}],\"url\":\"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd\"}",
      "owner": "0x60c0460147eb204e505c1142bd3a8e7028137466",
      "timestampS": 1735996331,
      "context": "{\"extractedParameters\":{\"price\":\"3631.24\"},\"providerHash\":\"0xf24d5fcf27bb451191f7995e51c600440144d5d590ddf0daed50389498855189\"}",
      "identifier": "0x2938ad9627cb3f7c75cb3c53d96c34fea0bdff32834c447d71660fa48fab4b7e",
      "epoch": 1
    },
    "identifier": "0x2938ad9627cb3f7c75cb3c53d96c34fea0bdff32834c447d71660fa48fab4b7e",
    "signatures": [
      "0xac961a2d1d169f2f5838d6caf650a6aff7dd764b7c71bdf2c66518231392a11f4ea1917190c0d9579bd6180f8b04fd2a42c1d8a78abbb711cf47fdf6466ad0e31b"
    ],
    "extractedParameterValues": {
      "price": "3631.24"
    },
    "witnesses": [
      {
        "id": "0x244897572368eadf65bfbc5aec98d8e5443a9072",
        "url": "wss://attestor.reclaimprotocol.org/ws"
      }
    ]
  }
}
```
