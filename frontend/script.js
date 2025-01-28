document.addEventListener("DOMContentLoaded", function () {
    // Mapeamento de símbolos das moedas
    const currencySymbols = {
        BRL: 'R$',  // Real
        USD: '$',   // Dólar
        EUR: '€',   // Euro
        GBP: '£',   // Libra
        JPY: '¥',   // Iene
        INR: '₹',   // Rúpia Indiana
        AUD: 'A$',  // Dólar Australiano
        CAD: 'C$',  // Dólar Canadense
        MXN: '$',   // Peso Mexicano
    };

    let previousRate = null;  // Variável para armazenar o valor anterior da cotação

    // Função para atualizar a cotação do Dólar ou qualquer moeda
    async function fetchExchangeRate(currency = 'BRL') {
        try {
            console.log(`Buscando a cotação para: ${currency}`);
    
            const response = await fetch(`http://localhost:3001/api/getRate?currency=${currency}`);
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
    
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
    
            // Atualiza a cor do valor da cotação
            if (previousRate !== null) {
                if (rate > previousRate) {
                    currentRateValue.style.color = 'green';
                    currentRateValue.classList.add('up');
                    currentRateValue.classList.remove('down');
                } else if (rate < previousRate) {
                    currentRateValue.style.color = 'red';
                    currentRateValue.classList.add('down');
                    currentRateValue.classList.remove('up');
                }
            }
    
            previousRate = rate;
    
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro ao buscar a cotação");
        }
    }

    // Função para atualizar o horário de Brasília
    async function updateBrasiliaTime() {
        try {
            const response = await fetch("http://worldtimeapi.org/api/timezone/America/Sao_Paulo");
            if (!response.ok) {
                throw new Error('Erro ao buscar o horário de Brasília');
            }
            const data = await response.json();
            const datetime = new Date(data.datetime);
            const time = datetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            document.getElementById('brasiliaTime').textContent = `Horário Brasília: ${time}`;
        } catch (error) {
            console.error("Erro ao buscar o horário de Brasília:", error);
            document.getElementById('brasiliaTime').textContent = "Erro ao buscar o horário de Brasília";
        }
    }

    // Função para buscar taxas dos títulos públicos dos EUA
    async function fetchUSTreasuryRates() {
        try {
            const response = await fetch("http://localhost:3001/api/getUSTreasuryRates");
            if (!response.ok) {
                throw new Error('Erro ao buscar as taxas dos títulos');
            }
            const data = await response.json();

            // Atualiza as taxas dos títulos públicos dos EUA
            Object.keys(data).forEach(key => {
                const rate = data[key].rate;
                const title = data[key].title;

                const elementId = document.getElementById(key);
                if (elementId) {
                    const rateElement = elementId.querySelector('h4');
                    rateElement.textContent = `${title}: ${rate}%`;
                    if (rate === 'N/A') {
                        rateElement.classList.add('empty');
                    } else {
                        rateElement.classList.remove('empty');
                    }
                } else {
                    console.error(`Elemento com ID ${key} não encontrado no HTML.`);
                }
            });
        } catch (error) {
            console.error("Erro ao buscar taxas dos títulos dos EUA:", error);
            alert("Erro ao buscar as taxas dos títulos dos EUA");
        }
    }

    // Atualizar a cotação inicial do Dólar, o horário de Brasília e as taxas dos títulos
    fetchExchangeRate(); // Atualiza a cotação inicial
    updateBrasiliaTime(); // Atualiza o horário de Brasília
    fetchUSTreasuryRates(); // Atualiza as taxas dos títulos públicos dos EUA

    // Atualizar a cotação automaticamente quando a moeda for alterada no dropdown
    const currencySelect = document.getElementById('currencySelect');
    currencySelect.addEventListener('change', function () {
        const selectedCurrency = currencySelect.value;
        fetchExchangeRate(selectedCurrency); // Chama a função para atualizar a cotação da moeda
    });

    // Função de atualização automática da cotação a cada 5 minutos
    const updateInterval = 300000; // 300000 ms = 5 minutos
    setInterval(() => {
        fetchExchangeRate(); // Atualiza a cotação
        fetchUSTreasuryRates(); // Atualiza as taxas dos títulos
        updateBrasiliaTime(); // Atualiza o horário de Brasília
    }, updateInterval);
});
