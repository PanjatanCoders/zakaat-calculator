# 🕌 Zakat Calculator with Payment Tracking

A beautiful, Material Design-based Islamic Zakat calculator with payment tracking dashboard following the methodology of Ahle Sunnat wal Jamat (Barelvi).

## ✨ Features

### 📊 Dashboard & Tracking
- **Real-time Dashboard** - View total Zakat due, paid, and remaining
- **Payment Progress** - Visual progress bar showing payment completion
- **Payment History** - Track all Zakat payments with dates and notes
- **Local Storage** - All data stored securely in browser (client-side only)

### 💰 Comprehensive Calculation
- **Multiple Asset Categories**
  - Cash & Bank Accounts
  - Gold & Silver
  - Investments & Stocks
  - Business Assets & Inventory
  - Investment Property
  - Money Owed to You (Receivables)
  - Other Assets

### 🌍 Multi-Currency Support
USD, EUR, GBP, INR, PKR, SAR, AED, MYR

### 🎨 Material Design UI
- Beautiful, modern interface with smooth animations
- Responsive design (works on all devices)
- Islamic-inspired color scheme
- Professional typography (Poppins + Playfair Display)

### 📝 Calculation Method (Ahle Sunnat wal Jamat - Barelvi)
- ✅ Nisab: 52.5 tola (612.36g) silver for mixed assets
- ✅ Zakat = 2.5% of total net wealth
- ✅ All debts deducted before calculation
- ✅ Lunar year requirement highlighted

### 🔐 Privacy-First
- **100% Client-Side** - All data stored in your browser
- **No Backend** - No server, no database, no tracking
- **Completely Private** - Your financial data never leaves your device

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. **Using Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Using Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository or drag & drop files
   - Deploy instantly!

### Option 2: Deploy to Netlify

1. **Drag & Drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the project folder to Netlify
   - Done!

2. **Using Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

### Option 3: Deploy to GitHub Pages

1. Create a new repository
2. Push files to repository
3. Settings → Pages → Select branch
4. Live at `https://yourusername.github.io/repo-name`

### Option 4: Run Locally

Simply open `index.html` in any modern web browser. No installation required!

## 📱 How to Use

### 1. Calculate Zakat
- Select your currency
- Enter current silver price per gram
- Add all your assets (one by one)
- Add all your debts/loans
- See instant Zakat calculation

### 2. Track Payments
- Go to Dashboard tab
- Click "Record Payment"
- Enter payment amount, date, and notes
- Track your progress

### 3. View History
- See all your payment history
- View saved calculations
- Delete old records

## 💾 Data Storage

All your data is stored locally in your browser using `localStorage`:

- **Zakat Calculations** - Last 20 calculations saved
- **Payment Records** - All payments tracked indefinitely
- **Privacy** - Data never sent to any server

To backup your data:
1. Use browser's export/import bookmarks feature
2. Or manually export localStorage data

To clear all data:
- Delete browser cache/cookies for the site

## 🎯 Nisab Calculation

### Gold Only
7.5 tola (87.48g)

### Silver Only
52.5 tola (612.36g)

### Mixed Assets
Always use silver threshold (612.36g equivalent)

## 📖 Calculation Logic

```
1. Sum all assets
2. Subtract all debts/loans
3. Net Wealth = Assets - Debts
4. If Net Wealth ≥ Nisab Threshold:
   Zakat = Net Wealth × 2.5%
5. Else:
   No Zakat due
```

**Important:** User must possess wealth for complete lunar year (354 days)

## 🌐 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

## 📄 Files Included

- `index.html` - Complete application (single file)
- `vercel.json` - Vercel deployment config
- `netlify.toml` - Netlify deployment config
- `README.md` - This file

## 🎨 Design Features

- **Material Design** - Google's Material Design principles
- **Material Icons** - Beautiful icon set
- **Custom Fonts** - Poppins (body) + Playfair Display (headings)
- **Islamic Colors** - Teal/Green theme inspired by Islamic art
- **Smooth Animations** - Fade-ins, slide-ups, hover effects
- **Responsive** - Works perfectly on mobile and desktop

## 🔧 Customization

You can easily customize:

### Colors
Edit CSS variables at the top of the file:
```css
:root {
    --primary-color: #00695c;
    --secondary-color: #ffa726;
    /* ... */
}
```

### Fonts
Change Google Fonts import and CSS:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
```

### Currency
Add more currencies in the currency grid section

## ⚠️ Important Notes

1. **Lunar Year Requirement**: You must possess the wealth for a complete lunar year (354 days) for Zakat to be obligatory
2. **Consult Scholars**: This calculator is a tool. Always consult qualified Islamic scholars for specific cases
3. **Personal Residence**: Your personal home is NOT included in Zakat calculation
4. **Worn Jewelry**: Some scholars exempt jewelry worn regularly. Consult your local scholar

## 📞 Support

For questions about:
- **Islamic Rulings**: Consult qualified Islamic scholars
- **Technical Issues**: Check browser console for errors
- **Deployment**: Refer to Vercel/Netlify documentation

## 📜 License

Free to use for the Muslim community. May Allah accept it as sadaqah jariyah.

## 🤲 Dua

*May Allah accept your Zakat and make it a source of purification and blessings for you. Ameen.*

---

**Methodology**: Ahle Sunnat wal Jamat (Barelvi)  
**Version**: 2.0 with Payment Tracking  
**Last Updated**: 2025
