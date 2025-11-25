# StockOS - Retro Stock Market Dashboard

A nostalgic retro terminal-style stock market dashboard built with vanilla JavaScript, Chart.js, and AnimeJS.

## 🚀 Live Demo
Visit the live project: [Your GitHub Pages URL] (after deployment)

## ✨ Features
- **Real-time Stock Data** - Live stock prices and updates
- **Interactive Charts** - Candlestick and line charts with Chart.js
- **Market News** - Latest financial news feeds
- **Terminal UI** - Retro 80s-style interface
- **Search & Filter** - Find stocks with terminal commands
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Auto-Refresh** - Data updates every 30 seconds

## 🛠 Tech Stack
- HTML5
- CSS3 (with retro styling)
- Vanilla JavaScript
- Chart.js - Data visualization
- AnimeJS - Smooth animations
- Alpha Vantage API - Stock data (free tier)
- NewsAPI - Market news

## 📋 Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- (Optional) API keys from:
  - [Alpha Vantage](https://www.alphavantage.co/) - Free stock data
  - [NewsAPI](https://newsapi.org/) - Free news data

## 🏃 How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stock-website.git
cd stock-website
```

2. Open in your browser:
- Double-click `index.html`, or
- Use Live Server extension in VS Code, or
- Run: `python -m http.server 8000` then visit `http://localhost:8000`

## 🌐 Deploy to GitHub Pages

1. Push to GitHub (see instructions below)
2. Go to repository **Settings** → **Pages**
3. Set source to `main` branch / `root` folder
4. Your site will be live at: `https://yourusername.github.io/stock-website`

## 📝 Project Structure
```
stock-website/
├── index.html          # Main HTML structure
├── style.css           # Retro styling
├── script.js           # JavaScript logic
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## 🔧 How to Push to GitHub

### First time setup:
```bash
# Initialize git
git init

# Add files
git add .

# Create first commit
git commit -m "Initial commit: Retro stock dashboard"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/stock-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Subsequent updates:
```bash
git add .
git commit -m "Description of changes"
git push
```

## 📚 How to Present to Teacher

1. **Share GitHub Link**: Send repository URL
2. **Share Live Demo**: Send GitHub Pages URL
3. **Code Review**: Teacher can view all source code on GitHub
4. **Live Demo**: Show working website with real data
5. **Documentation**: README explains everything

## 🐛 Troubleshooting

**Data not loading?**
- Check browser console (F12) for errors
- Verify API keys are correct
- Check internet connection

**Charts not displaying?**
- Ensure Chart.js library is loaded
- Clear browser cache

**Mobile issues?**
- Check viewport meta tag in HTML
- Test in mobile browser

## 📄 License
This is a university project for educational purposes.

## 👨‍💻 Author
zubair  - [first year] University of uc 

---

**Note**: Stock data shown is for demonstration only. Do not use for actual trading decisions.

