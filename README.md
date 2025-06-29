# 🚀 Real-Time Supplier Discovery Agent

A comprehensive AI-powered supplier discovery and analysis platform that uses **Google SERP API** and **OpenAI GPT-4** to provide real-time supplier intelligence for any procurement category.

## 🌟 **Key Features**

### **Real-Time Data Extraction**
- 🔍 **Google SERP API** - Live web scraping for supplier discovery
- 🤖 **OpenAI GPT-4** - Intelligent data extraction and analysis
- 📊 **20 Suppliers per Category** - Comprehensive coverage
- ⚡ **Live Progress Tracking** - Real-time status updates

### **Comprehensive Analysis**
- 📈 **Financial Intelligence** - Revenue, profit margins, financial health
- 🌍 **Geographic Coverage** - Global presence and interactive mapping
- 🏆 **ESG & Compliance** - Environmental, social, governance metrics
- 📋 **SWOT Analysis** - Strengths, weaknesses, opportunities, threats
- 🔒 **Risk Assessment** - Supply chain disruption monitoring

### **Advanced Analytics**
- 🎯 **TOPSIS Ranking** - Multi-criteria decision analysis
- 📊 **Comparison Matrix** - Side-by-side supplier comparison
- 🗺️ **Interactive Maps** - Geographic visualization
- 📰 **News Analysis** - Recent developments and trends
- 📤 **Excel Export** - 8 comprehensive report sheets

## 🛠️ **Quick Setup**

### **1. Install Dependencies**
```bash
cd my-app
npm install --legacy-peer-deps
```

### **2. Get API Keys**

#### **OpenAI API Key**
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-`)

#### **Google SERP API Key**
1. Sign up at [SerpAPI](https://serpapi.com/)
2. Get your API key from the dashboard
3. Copy the key

### **3. Configure Environment**
Create `.env.local` file in the root directory:
```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
SERP_API_KEY=your_serp_api_key_here

# Optional Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Test the Application**
- Open: http://localhost:3000
- Search for: "Aluminium", "Steel", "Electronics", etc.
- Watch real-time data extraction in action!

## 🔍 **How It Works**

### **Step 1: Google SERP API Search**
The system performs multiple targeted searches:
```javascript
const searchQueries = [
  `top ${category} manufacturers companies`,
  `largest ${category} suppliers worldwide`,
  `best ${category} producers companies`,
  `${category} industry leaders manufacturers`,
  `global ${category} suppliers list`
];
```

### **Step 2: Company Name Extraction**
Intelligent pattern matching extracts company names:
```javascript
const patterns = [
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc|Corp|Ltd|LLC)/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Group|Holdings|International)/i
];
```

### **Step 3: OpenAI GPT-4 Analysis**
Comprehensive data extraction for each supplier:
```javascript
const prompt = `
Generate detailed information for the company "${companyName}" in the ${category} industry.
Provide comprehensive data including revenue, employees, certifications, etc.
`;
```

### **Step 4: Real-time Results**
- **20 suppliers** with complete data
- **Interactive visualizations**
- **Exportable reports**
- **Advanced analytics**

## 📊 **Supported Categories**

### **Manufacturing**
- Aluminium, Steel, Electronics, Automotive
- Pharmaceuticals, Chemicals, Textiles
- Machinery, Plastics, Construction Materials

### **Services**
- Software, Logistics Services
- Medical Devices, Renewable Energy
- Food & Beverage, Transportation

### **Custom Categories**
- Add any industry or product category
- System automatically adapts search queries
- Generates relevant taxonomy codes

## 🎯 **Data Fields Extracted**

### **Basic Information**
- Company name, type, website
- Year founded, headquarters location
- CEO, contact information
- Parent company, subsidiaries

### **Financial Data**
- Annual revenue, employee count
- Net profit margin
- Financial health indicators
- Market position

### **Operational Details**
- Production capacity
- Certifications (ISO, ASI, etc.)
- Awards and recognitions
- Industries served

### **Geographic & ESG**
- Global coverage countries
- ESG status and commitments
- Diversity and inclusion
- Cybersecurity updates

### **Risk & Analysis**
- Supply chain disruptions
- Plant shutdowns
- SWOT analysis
- Recent news and impact

## 📈 **Analytics Features**

### **TOPSIS Ranking**
Multi-criteria decision analysis considering:
- Financial stability
- Geographic coverage
- ESG performance
- Operational efficiency
- Risk factors

### **Comparison Matrix**
Side-by-side comparison of:
- Key metrics
- Product offerings
- Geographic presence
- Certifications
- Financial performance

### **Geographic Mapping**
Interactive world map showing:
- Supplier locations
- Global coverage
- Regional clusters
- Market presence

### **News Analysis**
Recent developments including:
- Positive/negative/neutral news
- Impact assessment
- Source credibility
- Timeline analysis

## 📤 **Export Capabilities**

### **Excel Reports (8 Sheets)**
1. **Overview** - Summary and key metrics
2. **Product Offerings** - Detailed product catalog
3. **Financials** - Revenue, profit, financial ratios
4. **SWOT Analysis** - Strengths, weaknesses, opportunities, threats
5. **News & Updates** - Recent developments
6. **Geographic Coverage** - Global presence
7. **Certifications** - Compliance and standards
8. **Operations** - Production capacity and facilities

## 🔧 **API Usage & Costs**

### **Google SERP API**
- **Cost**: ~$0.05 per search query
- **Usage**: 5 queries per category = $0.25 per search
- **Rate Limit**: 100 searches per month (free tier)

### **OpenAI GPT-4**
- **Cost**: ~$0.03 per 1K tokens
- **Usage**: ~20 suppliers × 3K tokens = $1.80 per category
- **Rate Limit**: Based on your OpenAI plan

### **Total Cost per Category**
- **SERP API**: $0.25
- **OpenAI GPT-4**: $1.80
- **Total**: ~$2.05 per category search

## 🚀 **Production Deployment**

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### **Environment Variables in Production**
```bash
OPENAI_API_KEY=your_production_openai_key
SERP_API_KEY=your_production_serp_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🧪 **Testing Guide**

### **Test Categories**
```bash
# Manufacturing
- "Aluminium"     # Metals industry
- "Steel"         # Heavy manufacturing
- "Electronics"   # Technology sector

# Services
- "Automotive"    # Transportation
- "Pharmaceuticals" # Healthcare
- "Chemicals"     # Industrial chemicals
```

### **Expected Results**
- **20 suppliers** per category
- **Real-time data** extraction
- **Comprehensive analysis** with all fields
- **Interactive visualizations** and maps
- **Exportable reports** in Excel format

## 🔒 **Security & Privacy**

- **No data storage** - All processing is real-time
- **API key security** - Stored in environment variables
- **Rate limiting** - Built-in delays to respect API limits
- **Error handling** - Graceful fallbacks for failed requests

## 📞 **Troubleshooting**

### **Common Issues**
1. **API Key Errors** - Check environment variables
2. **Rate Limiting** - Wait between searches
3. **No Results** - Try different category names
4. **Map Errors** - Check coordinate validation

### **Debug Mode**
Enable detailed logging by checking browser console and server logs.

## 🎉 **Ready to Use!**

Your real-time supplier discovery agent is now ready to:
- **Search any procurement category**
- **Extract 20 suppliers with live data**
- **Provide comprehensive analysis**
- **Generate professional reports**

**Start discovering suppliers now!** 🚀

---

## 📚 **Additional Resources**

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [API Documentation](https://serpapi.com/docs) - Google SERP API docs
- [OpenAI API Docs](https://platform.openai.com/docs) - OpenAI API reference
- [Next.js Documentation](https://nextjs.org/docs) - Framework docs

## 🤝 **Support**

For issues and questions:
1. Check the troubleshooting section
2. Review the setup guide
3. Check browser console for errors
4. Verify API keys are correct

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in the `.env` file:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SERP_API_KEY`: Your Google SERP API key

3. Never commit your `.env` file to version control!
