// Retro Stock Dashboard with AnimeJS
// Note: anime.js and Chart.js are loaded via CDN in HTML

// Configuration
const CONFIG = {
  stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC', 'ORCL', 'IBM'],
  newsApiKey: 'demo', // Use demo key for university project
  updateInterval: 30000, // 30 seconds
};

// State
const state = {
  stockData: {},
  charts: {},
  news: [],
  marketStatusInterval: null
};

// Typewriter effect for boot screen
async function typeText(element, text, speed = 50) {
  const textSpan = element.querySelector('.boot-text');
  const cursorSpan = element.querySelector('.boot-cursor');
  
  if (!textSpan) return;
  
  // Make line visible
  element.style.opacity = '1';
  
  // Type each character
  for (let i = 0; i < text.length; i++) {
    textSpan.textContent = text.substring(0, i + 1);
    
    // Add slight random delay for more realistic typing
    const delay = speed + Math.random() * 20;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Hide cursor after typing is complete
  if (cursorSpan) {
    cursorSpan.style.opacity = '0';
  }
}

// Boot Screen Animation with Typewriter Effect
async function animateBootScreen() {
  const bootLines = document.querySelectorAll('.boot-line');
  
  // Hide all lines initially
  bootLines.forEach(line => {
    line.style.opacity = '0';
  });
  
  // Type out each line sequentially
  for (let i = 0; i < bootLines.length; i++) {
    const line = bootLines[i];
    const text = line.getAttribute('data-text') || '';
    
    // Small delay between lines
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Type the line
    await typeText(line, text, 40 + Math.random() * 20);
    
    // Pause after each line
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Wait a bit, then fade out
  setTimeout(() => {
    fadeOutBootScreen();
  }, 1500);
}

function fadeOutBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  const main = document.getElementById('main');
  const navbar = document.getElementById('navbar');
  const footer = document.getElementById('footer');
  
  anime({
    targets: bootScreen,
    opacity: [1, 0],
    duration: 800,
    easing: 'easeInQuad',
    complete: function() {
      bootScreen.classList.add('hidden');
      navbar.classList.add('visible');
      footer.classList.add('visible');
      main.classList.add('visible');
      initializeDashboard();
    }
  });
}

// Fetch Stock Data (Using Alpha Vantage Free API)
async function fetchStockData(symbol) {
  try {
    // Using Alpha Vantage demo API key for university project
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low'])
      };
    }
    
    // Fallback to mock data if API fails
    return generateMockStockData(symbol);
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return generateMockStockData(symbol);
  }
}

// Generate mock stock data for demo
function generateMockStockData(symbol) {
  const basePrice = Math.random() * 200 + 50;
  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol: symbol,
    price: basePrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    volume: Math.floor(Math.random() * 10000000),
    high: (basePrice + Math.random() * 5).toFixed(2),
    low: (basePrice - Math.random() * 5).toFixed(2)
  };
}

// Fetch Stock News
async function fetchStockNews() {
  try {
    // Using NewsAPI or alternative - for demo, using mock data
    // In a real project, you'd use: https://newsapi.org/v2/everything?q=stock+market&apiKey=YOUR_KEY
    return generateMockNews();
  } catch (error) {
    console.error('Error fetching news:', error);
    return generateMockNews();
  }
}

function generateMockNews() {
  return [
    {
      title: "Tech Stocks Surge Amid AI Investment Boom",
      source: "Financial Times",
      date: new Date().toLocaleDateString(),
      url: "#"
    },
    {
      title: "Federal Reserve Holds Interest Rates Steady",
      source: "Wall Street Journal",
      date: new Date().toLocaleDateString(),
      url: "#"
    },
    {
      title: "Electric Vehicle Market Sees Record Growth",
      source: "Bloomberg",
      date: new Date().toLocaleDateString(),
      url: "#"
    },
    {
      title: "Cloud Computing Revenue Exceeds Expectations",
      source: "TechCrunch",
      date: new Date().toLocaleDateString(),
      url: "#"
    },
    {
      title: "Global Markets React to Economic Indicators",
      source: "Reuters",
      date: new Date().toLocaleDateString(),
      url: "#"
    }
  ];
}

// Create Stock Card
function createStockCard(stock) {
  const isPositive = stock.change >= 0;
  const changeSign = isPositive ? '+' : '';
  
  return `
    <div class="stock-card" data-symbol="${stock.symbol}">
      <div class="stock-header">
        <div class="stock-symbol">${stock.symbol}</div>
        <div class="stock-price">$${parseFloat(stock.price).toFixed(2)}</div>
      </div>
      <div class="stock-change ${isPositive ? 'positive' : 'negative'}">
        ${changeSign}${parseFloat(stock.change).toFixed(2)} (${changeSign}${parseFloat(stock.changePercent).toFixed(2)}%)
      </div>
      <div class="stock-info">
        <div>High: $${parseFloat(stock.high).toFixed(2)}</div>
        <div>Low: $${parseFloat(stock.low).toFixed(2)}</div>
        <div>Volume: ${stock.volume.toLocaleString()}</div>
      </div>
      <div class="stock-chart">
        <canvas id="chart-${stock.symbol}"></canvas>
      </div>
    </div>
  `;
}

// Create Stock Chart
function createStockChart(symbol, data) {
  const canvas = document.getElementById(`chart-${symbol}`);
  if (!canvas || typeof Chart === 'undefined') return;
  
  const ctx = canvas.getContext('2d');
  
  // Generate realistic chart data points with trend
  const basePrice = parseFloat(data.price);
  const trend = data.change >= 0 ? 1 : -1;
  const chartData = Array.from({ length: 20 }, (_, i) => {
    const position = i / 20;
    const trendValue = trend * position * 2;
    const volatility = (Math.random() - 0.5) * 3;
    return basePrice + trendValue + volatility;
  });
  
  // Destroy existing chart if it exists
  if (state.charts[symbol]) {
    state.charts[symbol].destroy();
  }
  
  const isPositive = data.change >= 0;
  const chartColor = isPositive ? '#00ff41' : '#ff0040';
  
  state.charts[symbol] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: symbol,
        data: chartData,
        borderColor: chartColor,
        backgroundColor: chartColor + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

// Render Stock Cards
async function renderStocks() {
  const stockContainer = document.getElementById('stocks');
  stockContainer.innerHTML = '<div class="loading">Loading stock data</div>';
  
  // Fetch all stock data
  const stockPromises = CONFIG.stocks.map(symbol => fetchStockData(symbol));
  const stocks = await Promise.all(stockPromises);
  
  // Store stock data
  stocks.forEach(stock => {
    state.stockData[stock.symbol] = stock;
  });
  
  // Render cards
  stockContainer.innerHTML = stocks.map(stock => createStockCard(stock)).join('');
  
  // Animate cards appearance with AnimeJS
  anime({
    targets: '.stock-card',
    opacity: [0, 1],
    translateY: [50, 0],
    scale: [0.9, 1],
    rotateY: [15, 0],
    delay: anime.stagger(80, {start: 100}),
    duration: 800,
    easing: 'easeOutElastic(1, .6)'
  });
  
  // Create charts after a short delay to ensure Chart.js is ready
  setTimeout(() => {
    if (typeof Chart !== 'undefined') {
      stocks.forEach(stock => {
        createStockChart(stock.symbol, stock);
      });
    }
  }, 1000);
}

// Render News
async function renderNews() {
  const newsContainer = document.getElementById('news');
  const news = await fetchStockNews();
  state.news = news;
  
  let newsHTML = '<div class="news-title">📰 MARKET NEWS</div><div class="news-list">';
  
  news.forEach((article, index) => {
    newsHTML += `
      <div class="news-item" style="opacity: 0;">
        <div class="news-title-text">${article.title}</div>
        <div>
          <span class="news-source">${article.source}</span>
          <span class="news-date">${article.date}</span>
        </div>
      </div>
    `;
  });
  
  newsHTML += '</div>';
  newsContainer.innerHTML = newsHTML;
  
  // Animate news items
  anime({
    targets: '.news-item',
    opacity: [0, 1],
    translateX: [-30, 0],
    delay: anime.stagger(150),
    duration: 500,
    easing: 'easeOutQuad'
  });
}

// Update Stock Prices
async function updateStocks() {
  const stockPromises = CONFIG.stocks.map(symbol => fetchStockData(symbol));
  const stocks = await Promise.all(stockPromises);
  
  stocks.forEach(stock => {
    const card = document.querySelector(`[data-symbol="${stock.symbol}"]`);
    if (!card) return;
    
    const priceElement = card.querySelector('.stock-price');
    const changeElement = card.querySelector('.stock-change');
    
    // Animate price change
    if (priceElement) {
      const oldPrice = parseFloat(priceElement.textContent.replace('$', ''));
      const newPrice = parseFloat(stock.price);
      
      anime({
        targets: priceElement,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
      
      priceElement.textContent = `$${newPrice.toFixed(2)}`;
      
      // Update change
      const isPositive = stock.change >= 0;
      const changeSign = isPositive ? '+' : '';
      changeElement.className = `stock-change ${isPositive ? 'positive' : 'negative'}`;
      changeElement.textContent = 
        `${changeSign}${parseFloat(stock.change).toFixed(2)} (${changeSign}${parseFloat(stock.changePercent).toFixed(2)}%)`;
      
      // Update chart
      createStockChart(stock.symbol, stock);
    }
    
    // Update state
    state.stockData[stock.symbol] = stock;
  });
}

// Terminal Search Functionality
function initializeTerminalSearch() {
  const searchInput = document.getElementById('stock-search');
  const terminalOutput = document.getElementById('terminal-output');
  const stockCards = document.querySelectorAll('.stock-card');
  
  if (!searchInput) return;
  
  // Add terminal output message
  function addTerminalMessage(message, type = 'info') {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    const prompt = document.createElement('span');
    prompt.className = 'terminal-prompt';
    prompt.textContent = 'stockos@market:~$';
    
    const text = document.createElement('span');
    text.className = 'terminal-text';
    text.textContent = ` ${message}`;
    
    if (type === 'success') {
      text.style.color = '#00ff41';
    } else if (type === 'error') {
      text.style.color = '#ff0040';
    } else if (type === 'command') {
      text.textContent = ` ${message}`;
      text.style.color = '#00ccff';
    }
    
    line.appendChild(prompt);
    line.appendChild(text);
    terminalOutput.appendChild(line);
    
    // Auto-scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    
    // Limit output lines (keep last 10)
    const lines = terminalOutput.querySelectorAll('.terminal-line');
    if (lines.length > 10) {
      lines[0].remove();
    }
  }
  
  // Filter stocks based on search
  function filterStocks(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      // Show all stocks
      document.querySelectorAll('.stock-card').forEach(card => {
        card.classList.remove('hidden');
        anime({
          targets: card,
          opacity: [0, 1],
          scale: [0.95, 1],
          duration: 300,
          easing: 'easeOutQuad'
        });
      });
      return;
    }
    
    // Check for command pattern: "search SYMBOL"
    if (term.startsWith('search ')) {
      const symbol = term.substring(7).toUpperCase().trim();
      searchSpecificStock(symbol);
      return;
    }
    
    // Filter stocks by symbol or partial match
    let matchCount = 0;
    document.querySelectorAll('.stock-card').forEach(card => {
      const symbol = card.getAttribute('data-symbol') || '';
      const symbolLower = symbol.toLowerCase();
      
      if (symbolLower.includes(term)) {
        card.classList.remove('hidden');
        matchCount++;
        anime({
          targets: card,
          opacity: [0, 1],
          scale: [0.95, 1],
          duration: 300,
          easing: 'easeOutQuad'
        });
      } else {
        card.classList.add('hidden');
      }
    });
    
    if (matchCount === 0) {
      addTerminalMessage(`No stocks found matching "${searchTerm}"`, 'error');
    } else {
      addTerminalMessage(`Found ${matchCount} stock(s) matching "${searchTerm}"`, 'success');
    }
  }
  
  // Search for specific stock
  async function searchSpecificStock(symbol) {
    addTerminalMessage(`searching ${symbol}...`, 'command');
    
    try {
      const stock = await fetchStockData(symbol);
      
      // Hide all stocks first
      document.querySelectorAll('.stock-card').forEach(card => {
        card.classList.add('hidden');
      });
      
      // Find and show the matching stock
      const matchingCard = document.querySelector(`[data-symbol="${symbol}"]`);
      if (matchingCard) {
        matchingCard.classList.remove('hidden');
        anime({
          targets: matchingCard,
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 400,
          easing: 'easeOutQuad'
        });
        addTerminalMessage(`${symbol}: $${parseFloat(stock.price).toFixed(2)} (${stock.change >= 0 ? '+' : ''}${parseFloat(stock.changePercent).toFixed(2)}%)`, 'success');
      } else {
        // Create a new stock card if symbol exists in our list
        if (CONFIG.stocks.includes(symbol)) {
          addTerminalMessage(`Loading ${symbol} data...`, 'info');
          // Stock will appear when data loads
        } else {
          addTerminalMessage(`Stock "${symbol}" not available. Available: ${CONFIG.stocks.join(', ')}`, 'error');
        }
      }
    } catch (error) {
      addTerminalMessage(`Error searching for ${symbol}`, 'error');
    }
  }
  
  // Handle input events
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const value = e.target.value;
    
    searchTimeout = setTimeout(() => {
      if (value.trim()) {
        filterStocks(value);
      } else {
        // Clear search - show all stocks
        document.querySelectorAll('.stock-card').forEach(card => {
          card.classList.remove('hidden');
          anime({
            targets: card,
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 300,
            easing: 'easeOutQuad'
          });
        });
      }
    }, 300);
  });
  
  // Handle terminal commands
  function executeCommand(command) {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'help' || cmd === 'h') {
      addTerminalMessage('Available commands:', 'info');
      addTerminalMessage('  search [SYMBOL] - Search for specific stock (e.g., search AAPL)', 'command');
      addTerminalMessage('  clear - Clear terminal output', 'command');
      addTerminalMessage('  list - Show all available stocks', 'command');
      addTerminalMessage('  [SYMBOL] - Filter stocks by symbol (e.g., AAPL, TSLA)', 'command');
      addTerminalMessage('  ESC - Clear search and show all stocks', 'command');
      return true;
    } else if (cmd === 'clear' || cmd === 'cls') {
      terminalOutput.innerHTML = '';
      const initialLine = document.createElement('div');
      initialLine.className = 'terminal-line';
      initialLine.innerHTML = '<span class="terminal-prompt">stockos@market:~$</span> <span class="terminal-text">Terminal cleared. Ready for commands...</span>';
      terminalOutput.appendChild(initialLine);
      return true;
    } else if (cmd === 'list') {
      addTerminalMessage(`Available stocks: ${CONFIG.stocks.join(', ')}`, 'info');
      return true;
    }
    return false;
  }
  
  // Handle Enter key for commands
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = e.target.value.trim();
      if (value) {
        // Check for commands first
        if (executeCommand(value)) {
          searchInput.value = '';
          return;
        }
        
        // Check for search command
        if (value.toLowerCase().startsWith('search ')) {
          const symbol = value.substring(7).toUpperCase().trim();
          addTerminalMessage(`search ${symbol}`, 'command');
          searchSpecificStock(symbol);
          searchInput.value = '';
        } else {
          // Filter stocks
          filterStocks(value);
        }
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      searchInput.value = '';
      filterStocks('');
      addTerminalMessage('Search cleared. Showing all stocks.', 'info');
    }
  });
  
  // Focus effect with typing animation
  searchInput.addEventListener('focus', () => {
    const cursor = document.getElementById('terminal-cursor');
    if (cursor) {
      cursor.style.animation = 'blink 1s infinite';
    }
  });
  
  // Add typing indicator animation
  searchInput.addEventListener('input', () => {
    const cursor = document.getElementById('terminal-cursor');
    if (cursor) {
      cursor.style.animation = 'none';
      setTimeout(() => {
        cursor.style.animation = 'blink 1s infinite';
      }, 50);
    }
  });
}

// Initialize Dashboard
async function initializeDashboard() {
  await renderStocks();
  await renderNews();
  
  // Initialize all AnimeJS animations
  setTimeout(() => {
    initializeAnimeAnimations();
  }, 300);
  
  // Initialize terminal search after stocks are loaded
  setTimeout(() => {
    initializeTerminalSearch();
  }, 500);
  
  // Set up auto-update
  setInterval(updateStocks, CONFIG.updateInterval);
  
  // Add refresh button functionality
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.classList.add('spinning');
      refreshBtn.disabled = true;
      
      await Promise.all([renderStocks(), renderNews()]);
      
      // Reinitialize terminal search after refresh
      setTimeout(() => {
        initializeTerminalSearch();
      }, 100);
      
      setTimeout(() => {
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
      }, 500);
    });
  }
  
  // Add smooth scroll effect
  anime({
    targets: 'body',
    opacity: [0, 1],
    duration: 1000,
    easing: 'easeInQuad'
  });
}

// Navigation Handler
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  // Handle navigation clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute('data-section');
      
      // Update active states
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Switch sections
      switchSection(targetSection);
      
      // Close mobile menu if open
      if (navMenu) {
        navMenu.classList.remove('active');
      }
    });
  });
  
  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      switchSection(targetId);
      
      // Update nav active state
      navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('data-section') === targetId) {
          l.classList.add('active');
        }
      });
    });
  });
}

function switchSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  const targetSection = document.getElementById(sectionId);
  
  if (!targetSection) {
    console.error('Section not found:', sectionId);
    return;
  }
  
  // Find currently active section
  let activeSection = null;
  sections.forEach(section => {
    if (section.classList.contains('active')) {
      activeSection = section;
    }
  });
  
  // If no active section or switching directly
  if (!activeSection || activeSection === targetSection) {
    sections.forEach(s => s.classList.remove('active'));
    targetSection.classList.add('active');
    
    // Load markets data if switching to markets section
    if (sectionId === 'markets') {
      setTimeout(() => renderMarketsSection(), 100);
    }
    return;
  }
  
  // Fade out current section
  anime({
    targets: activeSection,
    opacity: [1, 0],
    duration: 300,
    easing: 'easeInQuad',
    complete: function() {
      activeSection.classList.remove('active');
      // Fade in target section
      targetSection.classList.add('active');
      anime({
        targets: targetSection,
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuad'
      });
      
      // Load markets data if switching to markets section
      if (sectionId === 'markets') {
        setTimeout(() => renderMarketsSection(), 100);
      }
    }
  });
}

// Fetch historical stock data from free API
async function fetchHistoricalStockData(symbol, days = 30) {
  try {
    // Try using Yahoo Finance API via public proxy (no API key needed)
    // Using yahoo-finance-api or alternative free service
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${days}d`;
    
    try {
      const response = await fetch(`${proxyUrl}${encodeURIComponent(yahooUrl)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0];
          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];
          
          if (timestamps && quotes) {
            return timestamps.map((ts, i) => {
              const date = new Date(ts * 1000);
              return {
                x: date.getTime(),
                o: quotes.open[i] || 0,
                h: quotes.high[i] || 0,
                l: quotes.low[i] || 0,
                c: quotes.close[i] || 0,
                v: quotes.volume[i] || 0
              };
            }).filter(d => d.o > 0); // Filter out invalid data
          }
        }
      }
    } catch (proxyError) {
      console.log('Yahoo Finance proxy failed, trying alternative...');
    }
    
    // Fallback: Use Alpha Vantage if available
    try {
      const apiKey = 'demo';
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=compact`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data['Time Series (Daily)']) {
          const timeSeries = data['Time Series (Daily)'];
          const dates = Object.keys(timeSeries).sort().slice(-days);
          
          return dates.map(date => {
            const dayData = timeSeries[date];
            return {
              x: new Date(date).getTime(),
              o: parseFloat(dayData['1. open']),
              h: parseFloat(dayData['2. high']),
              l: parseFloat(dayData['3. low']),
              c: parseFloat(dayData['4. close']),
              v: parseInt(dayData['5. volume'])
            };
          });
        }
      }
    } catch (avError) {
      console.log('Alpha Vantage failed, using realistic mock data');
    }
    
    // Final fallback: Generate realistic data based on current price
    return generateRealisticCandlestickData(symbol, days);
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return generateRealisticCandlestickData(symbol, days);
  }
}

// Parse CSV stock data format
function parseStockCSVData(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 7) {
      const ticker = values[0].trim();
      const volume = parseInt(values[1].trim()) || 0;
      const open = parseFloat(values[2].trim()) || 0;
      const close = parseFloat(values[3].trim()) || 0;
      const high = parseFloat(values[4].trim()) || 0;
      const low = parseFloat(values[5].trim()) || 0;
      const windowStart = values[6].trim();
      const transactions = parseInt(values[7]?.trim()) || 0;
      
      // Convert window_start timestamp (nanoseconds) to milliseconds
      let timestamp;
      if (windowStart && windowStart.length > 13) {
        // It's in nanoseconds, convert to milliseconds
        timestamp = parseInt(windowStart) / 1000000;
      } else {
        // Try to parse as milliseconds or seconds
        timestamp = parseInt(windowStart) || Date.now();
        if (timestamp < 1000000000000) {
          timestamp = timestamp * 1000; // Convert seconds to milliseconds
        }
      }
      
      data.push({
        x: timestamp,
        o: open,
        h: high,
        l: low,
        c: close,
        v: volume,
        transactions: transactions,
        ticker: ticker
      });
    }
  }
  
  // Sort by timestamp
  return data.sort((a, b) => a.x - b.x);
}

// Sample CSV data provided by user
const SAMPLE_CSV_DATA = `ticker,volume,open,close,high,low,window_start,transactions
AAPL,4930,200.29,200.5,200.63,200.29,1744792500000000000,129
AAPL,1815,200.39,200.34,200.61,200.34,1744792560000000000,57
AAPL,1099,200.3,200.28,200.3,200.13,1744792620000000000,40
AAPL,3672,200.39,200.61,200.64,200.39,1744792680000000000,71
AAPL,4322,200.72,200.69,200.8,200.69,1744792740000000000,88
AAPL,3675,200.7,201.5,201.5,200.7,1744792800000000000,119
AAPL,12785,201.49,202.33,202.33,201.49,1744792860000000000,329
AAPL,11473,202.39,201.81,202.46,201.81,1744792920000000000,199
AAPL,3895,202.0,201.82,202.0,201.65,1744792980000000000,116
AAPL,4322,201.76,201.36,201.76,201.17,1744793040000000000,85
AAPL,2089,201.31,201.35,201.35,201.04,1744793100000000000,48
AAPL,7317,201.31,200.88,201.31,200.71,1744793160000000000,121`;

// Generate realistic OHLC data for candlestick charts
function generateRealisticCandlestickData(symbol, days = 30) {
  // First try to use sample CSV data if available
  if (SAMPLE_CSV_DATA) {
    try {
      const csvData = parseStockCSVData(SAMPLE_CSV_DATA);
      if (csvData.length > 0) {
        return csvData;
      }
    } catch (error) {
      console.log('Could not parse sample CSV data, generating realistic data');
    }
  }
  
  const data = [];
  // Get base price from current stock data if available
  const basePrice = state.stockData[symbol]?.price || 150;
  let currentPrice = basePrice;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const volatility = (Math.random() - 0.5) * 0.04;
    const open = currentPrice;
    const trend = Math.sin(i / 5) * 0.01; // Add some trend
    const close = open * (1 + volatility + trend);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    
    data.push({
      x: date.getTime(),
      o: open,
      h: high,
      l: low,
      c: close,
      v: Math.floor(Math.random() * 5000000 + 1000000)
    });
    
    currentPrice = close;
  }
  
  return data;
}

// Create Market Candlestick Chart with real API data
async function createMarketCandlestickChart(stocks) {
  console.log('createMarketCandlestickChart called');
  const chartContainer = document.querySelector('.candlestick-chart-wrapper');
  if (!chartContainer) {
    console.error('Chart container not found - checking DOM...');
    // Wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 500));
    const retryContainer = document.querySelector('.candlestick-chart-wrapper');
    if (!retryContainer) {
      console.error('Chart container still not found after retry');
      return;
    }
  }
  
  if (typeof Chart === 'undefined') {
    console.error('Chart.js not loaded');
    if (chartContainer) {
      chartContainer.innerHTML = '<div class="error">Chart library not loaded. Please refresh the page.</div>';
    }
    return;
  }
  
  // Show loading message
  if (chartContainer) {
    chartContainer.innerHTML = '<div class="loading" style="padding: 50px; text-align: center; color: #00ff41;">Loading market chart data...</div>';
  }
  
  try {
    // First, try to use the provided CSV data
    let candlestickData = [];
    
    try {
      const csvData = parseStockCSVData(SAMPLE_CSV_DATA);
      if (csvData && csvData.length > 0) {
        candlestickData = csvData;
        console.log(`Using provided CSV data with ${csvData.length} data points`);
      }
    } catch (csvError) {
      console.log('Could not parse CSV data:', csvError);
    }
    
    // If no CSV data, try fetching from API
    if (candlestickData.length === 0) {
      console.log('No CSV data, trying API...');
      // Fetch historical data for market index (using SPY as proxy or average of top stocks)
      // Using AAPL as main market indicator
      const mainSymbol = 'AAPL';
      candlestickData = await fetchHistoricalStockData(mainSymbol, 30);
    }
    
    if (!candlestickData || candlestickData.length === 0) {
      throw new Error('No chart data available');
    }
    
    console.log('Chart data ready:', candlestickData.length, 'points');
    
    // Ensure canvas exists - create it if needed
    let chartCanvas = document.getElementById('market-candlestick-chart');
    if (!chartCanvas) {
      if (chartContainer) {
        chartContainer.innerHTML = '<canvas id="market-candlestick-chart"></canvas>';
        chartCanvas = document.getElementById('market-candlestick-chart');
      }
    }
    
    if (!chartCanvas) {
      console.error('Could not create canvas element');
      if (chartContainer) {
        chartContainer.innerHTML = '<div class="error">Could not create chart canvas</div>';
      }
      return;
    }
    
    const ctx = chartCanvas.getContext('2d');
    
    // Wait for container to be visible and have dimensions
    if (chartContainer.offsetWidth === 0 || chartContainer.offsetHeight === 0) {
      console.log('Waiting for chart container to have dimensions...');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Destroy existing chart if it exists
    if (state.charts.marketCandlestick) {
      state.charts.marketCandlestick.destroy();
      state.charts.marketCandlestick = null;
    }
    
    // Create labels - format based on data frequency
    const labels = candlestickData.map(d => {
      const date = new Date(d.x);
      // If data points are less than 1 day apart, show time
      if (candlestickData.length > 0 && candlestickData.length < 24) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Prepare data for candlestick visualization
    const openPrices = candlestickData.map(d => d.o);
    const highPrices = candlestickData.map(d => d.h);
    const lowPrices = candlestickData.map(d => d.l);
    const closePrices = candlestickData.map(d => d.c);
    
    state.charts.marketCandlestick = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'High',
            data: highPrices,
            borderColor: 'rgba(0, 255, 65, 0.4)',
            backgroundColor: 'transparent',
            borderWidth: 1,
            pointRadius: 0,
            borderDash: [3, 3],
            tension: 0.1
          },
          {
            label: 'Low',
            data: lowPrices,
            borderColor: 'rgba(255, 0, 64, 0.4)',
            backgroundColor: 'transparent',
            borderWidth: 1,
            pointRadius: 0,
            borderDash: [3, 3],
            tension: 0.1
          },
          {
            label: 'Close Price',
            data: closePrices,
            borderColor: '#00ff41',
            backgroundColor: 'rgba(0, 255, 65, 0.15)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: '#00ff41',
            pointBorderColor: '#000'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#00ff41',
              font: {
                family: 'VT323',
                size: 16
              },
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderColor: '#00ff41',
            borderWidth: 2,
            titleColor: '#00ff41',
            bodyColor: '#00ff41',
            titleFont: {
              family: 'VT323',
              size: 14
            },
            bodyFont: {
              family: 'Share Tech Mono',
              size: 12
            },
            padding: 12,
            callbacks: {
              title: function(context) {
                const index = context[0].dataIndex;
                const date = new Date(candlestickData[index].x);
                return date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
              },
              label: function(context) {
                const index = context.dataIndex;
                const ohlc = candlestickData[index];
                if (context.datasetIndex === 2) { // Close price dataset
                  const labels = [
                    `Open: $${ohlc.o.toFixed(2)}`,
                    `High: $${ohlc.h.toFixed(2)}`,
                    `Low: $${ohlc.l.toFixed(2)}`,
                    `Close: $${ohlc.c.toFixed(2)}`,
                    `Volume: ${ohlc.v.toLocaleString()}`
                  ];
                  if (ohlc.transactions) {
                    labels.push(`Transactions: ${ohlc.transactions}`);
                  }
                  return labels.filter(l => l); // Remove empty strings
                }
                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(0, 255, 65, 0.15)',
              lineWidth: 1
            },
            ticks: {
              color: '#00ff41',
              maxTicksLimit: 12,
              font: {
                family: 'Share Tech Mono',
                size: 10
              }
            },
            border: {
              color: 'rgba(0, 255, 65, 0.3)'
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 255, 65, 0.15)',
              lineWidth: 1
            },
            ticks: {
              color: '#00ff41',
              font: {
                family: 'Share Tech Mono',
                size: 11
              },
              callback: function(value) {
                return '$' + value.toFixed(0);
              }
            },
            border: {
              color: 'rgba(0, 255, 65, 0.3)'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
    
    console.log('Market candlestick chart created successfully');
  } catch (error) {
    console.error('Error creating market chart:', error);
    if (chartContainer) {
      chartContainer.innerHTML = '<div class="error">Failed to load chart. Please refresh the page.</div>';
    }
  }
}

// Render Most Active Stocks
function renderMostActiveStocks(stocks) {
  const mostActiveList = document.getElementById('most-active-list');
  if (!mostActiveList) return;
  
  // Sort by volume (most active)
  const sortedStocks = [...stocks].sort((a, b) => b.volume - a.volume);
  const topActive = sortedStocks.slice(0, 6);
  
  const stockNames = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corp.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms',
    'NVDA': 'NVIDIA Corp.',
    'NFLX': 'Netflix Inc.',
    'AMD': 'Advanced Micro Devices',
    'INTC': 'Intel Corp.',
    'ORCL': 'Oracle Corp.',
    'IBM': 'IBM Corp.'
  };
  
  mostActiveList.innerHTML = topActive.map(stock => {
    const isPositive = stock.change >= 0;
    const changeSign = isPositive ? '+' : '';
    
    return `
      <div class="most-active-item">
        <div class="most-active-info">
          <div class="most-active-symbol">${stock.symbol}</div>
          <div class="most-active-name">${stockNames[stock.symbol] || stock.symbol}</div>
        </div>
        <div class="most-active-stats">
          <div class="most-active-volume">${(stock.volume / 1000000).toFixed(2)}M</div>
          <div class="most-active-change ${isPositive ? 'positive' : 'negative'}">
            ${changeSign}${parseFloat(stock.changePercent).toFixed(2)}%
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Animate most active items
  anime({
    targets: '.most-active-item',
    opacity: [0, 1],
    translateX: [-30, 0],
    delay: anime.stagger(100),
    duration: 500,
    easing: 'easeOutQuad'
  });
}

// Update Market Status
function updateMarketStatus() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  // Market hours: 9:30 AM - 4:00 PM EST (14:30 - 21:00 UTC)
  const marketOpen = hours >= 9 && (hours < 16 || (hours === 9 && now.getMinutes() >= 30));
  
  const marketStatusText = document.getElementById('market-status-text');
  const marketIndicator = document.querySelector('.indicator-dot');
  const marketTime = document.getElementById('market-time');
  const tradingSession = document.getElementById('trading-session');
  
  if (marketStatusText) {
    marketStatusText.textContent = marketOpen ? 'MARKET OPEN' : 'MARKET CLOSED';
  }
  
  if (marketIndicator) {
    marketIndicator.style.background = marketOpen ? '#00ff41' : '#ff0040';
    marketIndicator.style.boxShadow = marketOpen ? '0 0 10px #00ff41' : '0 0 10px #ff0040';
  }
  
  if (marketTime) {
    marketTime.textContent = `${hours}:${minutes}:${seconds} EST`;
  }
  
  if (tradingSession) {
    tradingSession.textContent = marketOpen ? 'Regular Trading Hours' : 'After Hours / Pre-Market';
  }
}

// Render Markets Section
async function renderMarketsSection() {
  console.log('renderMarketsSection called');
  const marketsContainer = document.getElementById('markets-stocks');
  if (!marketsContainer) {
    console.error('markets-stocks container not found');
    return;
  }
  
  // Always show loading initially
  marketsContainer.innerHTML = '<div class="loading">Loading market data...</div>';
  
  try {
    const stocks = await Promise.all(
      CONFIG.stocks.map(symbol => fetchStockData(symbol))
    );
    
    console.log('Stocks loaded:', stocks.length);
    
    // Update market status
    updateMarketStatus();
    
    // Clear any existing interval
    if (state.marketStatusInterval) {
      clearInterval(state.marketStatusInterval);
    }
    state.marketStatusInterval = setInterval(updateMarketStatus, 1000);
    
    // Update market stats
    updateMarketStats(stocks);
    
    // Render most active stocks
    renderMostActiveStocks(stocks);
    
    // Store stocks in state
    stocks.forEach(stock => {
      state.stockData[stock.symbol] = stock;
    });
    
    // Ensure chart container exists
    const chartWrapper = document.querySelector('.candlestick-chart-wrapper');
    if (chartWrapper) {
      chartWrapper.innerHTML = '<canvas id="market-candlestick-chart"></canvas>';
    }
    
    // Create candlestick chart immediately
    try {
      await createMarketCandlestickChart(stocks);
      console.log('Candlestick chart created');
    } catch (chartError) {
      console.error('Error creating candlestick chart:', chartError);
    }
    
    // Render stock cards
    marketsContainer.innerHTML = stocks.map(stock => createStockCard(stock)).join('');
    
    // Animate cards
    anime({
      targets: '#markets-stocks .stock-card',
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(100),
      duration: 600,
      easing: 'easeOutQuad'
    });
    
    // Create individual stock charts
    setTimeout(() => {
      if (typeof Chart !== 'undefined') {
        stocks.forEach(stock => {
          createStockChart(stock.symbol, stock);
        });
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error in renderMarketsSection:', error);
    marketsContainer.innerHTML = '<div class="error">Failed to load market data. Please refresh the page.</div>';
  }
}

function updateMarketStats(stocks) {
  const totalVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);
  const totalVolumeEl = document.getElementById('total-volume');
  if (totalVolumeEl) {
    totalVolumeEl.textContent = (totalVolume / 1000000).toFixed(2) + 'M';
  }
  
  const activeStocksEl = document.getElementById('active-stocks');
  if (activeStocksEl) {
    activeStocksEl.textContent = stocks.length;
  }
  
  // Calculate market cap (simplified)
  const marketCap = stocks.reduce((sum, stock) => {
    return sum + (parseFloat(stock.price) * stock.volume / 10);
  }, 0);
  
  const marketCapEl = document.getElementById('market-cap');
  if (marketCapEl) {
    marketCapEl.textContent = (marketCap / 1000000000000).toFixed(2) + 'T';
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Chart.js and anime.js to be ready
  function startApp() {
    if (typeof Chart !== 'undefined' && typeof anime !== 'undefined') {
      initializeNavigation();
      animateBootScreen();
    } else {
      setTimeout(startApp, 100);
    }
  }
  
  startApp();
});

// Enhanced AnimeJS Animations

// Animate stock cards on hover with AnimeJS
document.addEventListener('mouseover', (e) => {
  if (e.target.closest('.stock-card')) {
    const card = e.target.closest('.stock-card');
    anime({
      targets: card,
      scale: 1.05,
      translateY: -8,
      boxShadow: '0 10px 30px rgba(0, 255, 65, 0.5)',
      duration: 300,
      easing: 'easeOutElastic(1, .6)'
    });
  }
  
  // Animate navigation links
  if (e.target.classList.contains('nav-link')) {
    anime({
      targets: e.target,
      scale: 1.1,
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
  
  // Animate buttons
  if (e.target.classList.contains('refresh-btn')) {
    anime({
      targets: e.target,
      scale: 1.05,
      rotate: 5,
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.closest('.stock-card')) {
    anime({
      targets: e.target.closest('.stock-card'),
      scale: 1,
      translateY: 0,
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
      duration: 300,
      easing: 'easeOutQuad'
    });
  }
  
  if (e.target.classList.contains('nav-link')) {
    anime({
      targets: e.target,
      scale: 1,
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
  
  if (e.target.classList.contains('refresh-btn')) {
    anime({
      targets: e.target,
      scale: 1,
      rotate: 0,
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
});

// Animate header on page load
function animateDashboardHeader() {
  const headerControls = document.querySelector('.header-controls');
  if (headerControls) {
    anime({
      targets: headerControls,
      opacity: [0, 1],
      translateY: [-30, 0],
      duration: 800,
      easing: 'easeOutElastic(1, .8)',
      delay: 300
    });
    
    anime({
      targets: headerControls.querySelector('h1'),
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .8)',
      delay: 500
    });
  }
}

// Animate section headers
function animateSectionHeaders() {
  const sectionHeaders = document.querySelectorAll('.section-header, .section-title, .section-subtitle');
  sectionHeaders.forEach((header, index) => {
    anime({
      targets: header,
      opacity: [0, 1],
      translateX: [-50, 0],
      duration: 600,
      easing: 'easeOutQuad',
      delay: index * 100
    });
  });
}

// Pulse animation for market status indicator
function animateMarketIndicator() {
  const indicator = document.querySelector('.indicator-dot');
  if (indicator) {
    anime({
      targets: indicator,
      scale: [1, 1.3, 1],
      opacity: [0.8, 1, 0.8],
      duration: 2000,
      easing: 'easeInOutQuad',
      loop: true
    });
  }
}

// Animate numbers counting up
function animateNumberCounter(element, start, end, duration = 1000) {
  const obj = { value: start };
  anime({
    targets: obj,
    value: end,
    duration: duration,
    easing: 'easeOutQuad',
    update: function() {
      element.textContent = Math.floor(obj.value);
    }
  });
}

// Add scroll animations for sections
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          easing: 'easeOutQuad'
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements for scroll animations
  document.querySelectorAll('.stock-card, .news-item, .stat-card, .feature-item, .about-card').forEach(el => {
    observer.observe(el);
  });
}

// Animate price changes
function animatePriceChange(element, isPositive) {
  anime({
    targets: element,
    scale: [1, 1.3, 1],
    color: isPositive ? '#00ff41' : '#ff0040',
    duration: 500,
    easing: 'easeOutElastic(1, .8)'
  });
}

// Initialize all animations when dashboard loads
function initializeAnimeAnimations() {
  animateDashboardHeader();
  animateSectionHeaders();
  animateMarketIndicator();
  initScrollAnimations();
  
  // Animate terminal window
  const terminalWindow = document.querySelector('.terminal-window');
  if (terminalWindow) {
    anime({
      targets: terminalWindow,
      opacity: [0, 1],
      scale: [0.95, 1],
      translateY: [20, 0],
      duration: 600,
      easing: 'easeOutElastic(1, .8)',
      delay: 400
    });
  }
}

