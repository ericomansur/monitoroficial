document.addEventListener("DOMContentLoaded", function () {
    const backendUrl = "https://monitoroficialback.onrender.com"; // Atualize com a URL real do backend

    const currencySymbols = {
        BRL: 'R$', USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹',
        AUD: 'A$', CAD: 'C$', MXN: '$'
    };

    let previousRate = null;

    async function fetchExchangeRate(currency = 'BRL') {
        try {
            console.log(`Buscando a cotação para: ${currency}`);
            const response = await fetch(`${backendUrl}/api/getRate?currency=${currency}`);
            if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);

            const data = await response.json();
            console.log('Resposta recebida do backend:', data);
            
            const rate = data.rate || 0;
            const symbol = currencySymbols[currency] || '';
            
            const formattedRate = rate.toFixed(6);
            const currentTime = new Date().toLocaleTimeString('pt-BR');
            
            const historyItem = document.createElement('li');
            historyItem.classList.add('list-group-item');
            historyItem.textContent = `${currentTime} ${currency}: ${symbol} ${formattedRate}`;
            document.getElementById('historyList').appendChild(historyItem);
            
            const currentRateValue = document.getElementById('currentRateValue');
            currentRateValue.textContent = `${symbol} ${formattedRate}`;

            if (previousRate !== null) {
                if (rate > previousRate) {
                    currentRateValue.style.color = 'green';
                } else if (rate < previousRate) {
                    currentRateValue.style.color = 'red';
                }
            }
            previousRate = rate;
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro ao buscar a cotação");
        }
    }

    async function updateBrasiliaTime() {
        try {
            const response = await fetch("http://worldtimeapi.org/api/timezone/America/Sao_Paulo");
            if (!response.ok) throw new Error('Erro ao buscar o horário de Brasília');
            
            const data = await response.json();
            const datetime = new Date(data.datetime);
            const time = datetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            document.getElementById('brasiliaTime').textContent = `Horário Brasília: ${time}`;
        } catch (error) {
            console.error("Erro ao buscar o horário de Brasília:", error);
            document.getElementById('brasiliaTime').textContent = "Erro ao buscar o horário de Brasília";
        }
    }

    async function fetchUSTreasuryRates() {
        try {
            const response = await fetch(`${backendUrl}/api/getUSTreasuryRates`);
            if (!response.ok) throw new Error('Erro ao buscar as taxas dos títulos');
            
            const data = await response.json();
            Object.keys(data).forEach(key => {
                const rate = data[key].rate;
                const title = data[key].title;
                
                const elementId = document.getElementById(key);
                if (elementId) {
                    const rateElement = elementId.querySelector('h4');
                    rateElement.textContent = `${title}: ${rate}%`;
                }
            });
        } catch (error) {
            console.error("Erro ao buscar taxas dos títulos dos EUA:", error);
            alert("Erro ao buscar as taxas dos títulos dos EUA");
        }
    }

    fetchExchangeRate();
    updateBrasiliaTime();
    fetchUSTreasuryRates();

    document.getElementById('currencySelect').addEventListener('change', function () {
        fetchExchangeRate(this.value);
    });

    setInterval(() => {
        fetchExchangeRate();
        fetchUSTreasuryRates();
        updateBrasiliaTime();
    }, 300000);
});
