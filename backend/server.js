import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();

const port = process.env.PORT || 3001;


app.use(cors());
app.use(express.static('public')); 


const API_KEY = '18924cf02d693f50dc2b816aad4ede99'; 


app.get('/api/getRate', async (req, res) => {
    const currency = req.query.currency || 'BRL'; 
    const API_URL = `https://api.currencylayer.com/live?access_key=${API_KEY}&currencies=${currency}&source=USD&format=1`;

    console.log(`Buscando taxa para a moeda: ${currency}`);
    console.log(`Requisição para a URL: ${API_URL}`);

    try {
        const response = await fetch(API_URL);
        console.log('Resposta da API de Câmbio recebida', response.status);

        if (!response.ok) {
            console.error(`Erro na resposta da API de Câmbio: ${response.statusText}`);
            return res.status(500).json({ error: `Erro na requisição da API de Câmbio: ${response.statusText}` });
        }

        const data = await response.json();
        console.log('Dados recebidos da API de Câmbio:', data);

        if (data.success && data.quotes) {
            const quoteKey = `USD${currency}`; 
            const rate = data.quotes[quoteKey]; 

            if (rate) {
                res.json({ rate: rate });
            } else {
                console.error(`Taxa não encontrada para: ${quoteKey}`);
                res.status(400).json({ error: "Moeda não encontrada na resposta da API" });
            }
        } else {
            console.error('Resposta da API inválida ou incompleta:', data);
            res.status(500).json({ error: "Erro na resposta da API: dados inválidos" });
        }
    } catch (error) {
        console.error("Erro ao buscar a cotação:", error.message);
        res.status(500).json({ error: `Erro ao buscar a cotação: ${error.message}` });
    }
});


const FRED_API_KEY = '739a42f2e5865e0ced2706459ce56952'; 
const FRED_API_URL = 'https://api.stlouisfed.org/fred/series/observations?api_key=' + FRED_API_KEY + '&file_type=json';

app.get('/api/getUSTreasuryRates', async (req, res) => {
    console.log("Buscando taxas dos títulos do Tesouro dos EUA");

    const treasurySymbols = {
        'US30Y': '30 Year Treasury',
        'US20Y': '20 Year Treasury',
        'US10Y': '10 Year Treasury',
        'US02Y': '2 Year Treasury'
    };

    try {
        const urls = [
            `${FRED_API_URL}&series_id=GS30`,
            `${FRED_API_URL}&series_id=GS20`,
            `${FRED_API_URL}&series_id=GS10`,
            `${FRED_API_URL}&series_id=GS2`
        ];

        console.log('Buscando URLs para as taxas dos títulos:', urls);

        const responses = await Promise.all(urls.map(url => fetch(url)));
        console.log('Respostas das APIs de taxas de títulos recebidas:', responses);

        const data = await Promise.all(responses.map(response => response.json()));
        console.log('Dados das taxas dos títulos:', data);

        const treasuryRates = {};

        data.forEach((result, index) => {
            if (result && result.observations && result.observations.length > 0) {
                const latest = result.observations[result.observations.length - 1];
                treasuryRates[Object.keys(treasurySymbols)[index]] = {
                    title: Object.values(treasurySymbols)[index],
                    rate: latest.value || 'N/A'
                };
            }
        });

        console.log('Taxas dos títulos processadas:', treasuryRates);
        res.json(treasuryRates);
    } catch (error) {
        console.error("Erro ao buscar taxas dos títulos:", error.message);
        res.status(500).json({ error: "Erro ao buscar taxas dos títulos" });
    }
});


app.get('/', (req, res) => {
    res.send('Servidor funcionando corretamente!');
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
