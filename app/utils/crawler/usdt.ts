import * as rp from 'request-promise';

async function fetchAmmPoolStates() {
    const data = await rp({
        method: 'GET',
        uri: 'https://remitano.com/api/v1/amm_pool_states',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36'
        }
    });
    return JSON.parse(data);
}

/** Main function */
export const crawlUSDTPrices = async (): Promise<{sellPrice: number, buyPrice: number}> => {
    const ammPoolStates = await fetchAmmPoolStates() as {amm_pool_states: Array<any>};

    const amm = Object.values(ammPoolStates['amm_pool_states']).find(amm => amm['token0'] === 'usdt' && amm['token1'] === 'vnd') as {fee: number};
    /** Calc sell price */
    const sellPrice = amm['price'] * (1 + amm['fee']);
    /** Calc sell price */
    const buyPrice = amm['price'] * (1 - amm['fee']);

    return ({
        sellPrice: Math.floor(sellPrice),
        buyPrice: Math.floor(buyPrice),
    });
};
