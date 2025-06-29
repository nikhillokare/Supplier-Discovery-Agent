# 🚀 Real-Time Supplier Discovery Agent - Setup Guide

## 📋 **Complete Implementation Overview**

This is a **real-time supplier discovery system** that uses:
- **Google SERP API** for live web scraping
- **OpenAI GPT-4** for intelligent data extraction
- **20 suppliers per industry** with comprehensive analysis

## 🔧 **Required API Keys**

### 1. **Google SERP API Key**
- Sign up at: https://serpapi.com/
- Get your API key from the dashboard
- Add to `.env.local`: `SERP_API_KEY=your_serp_api_key_here`

### 2. **OpenAI API Key**
- Sign up at: https://platform.openai.com/
- Get your API key from the API keys section
- Add to `.env.local`: `OPENAI_API_KEY=your_openai_api_key_here`

## 📁 **Environment Configuration**

Create `.env.local` file in the root directory:

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
SERP_API_KEY=your_serp_api_key_here

# Optional Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🛠️ **Installation Steps**

### 1. **Install Dependencies**
```bash
cd my-app
npm install --legacy-peer-deps
```

### 2. **Set Environment Variables**
```bash
# Create .env.local file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
echo "SERP_API_KEY=your_serp_api_key_here" >> .env.local
```

### 3. **Start Development Server**
```bash
npm run dev
```

### 4. **Test the Application**
- Open: http://localhost:3000
- Search for: "Aluminium", "Steel", "Electronics", etc.
- Watch real-time data extraction in action

## 🔍 **How It Works**

### **Step 1: Google SERP API Search**
```javascript
// Multiple search queries for comprehensive results
const searchQueries = [
  `top ${category} manufacturers companies`,
  `largest ${category} suppliers worldwide`,
  `best ${category} producers companies`,
  `${category} industry leaders manufacturers`,
  `global ${category} suppliers list`
];
```

### **Step 2: Company Name Extraction**
```javascript
// Extract company names from search results
const patterns = [
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc|Corp|Ltd|LLC)/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Group|Holdings|International)/i
];
```

### **Step 3: OpenAI GPT-4 Analysis**
```javascript
// Get detailed information for each supplier
const prompt = `
Generate detailed information for the company "${companyName}" in the ${category} industry.
Provide comprehensive data including revenue, employees, certifications, etc.
`;
```

### **Step 4: Real-time Results**
- **20 suppliers per category**
- **Comprehensive data fields**
- **Live geographic mapping**
- **TOPSIS ranking analysis**
- **Excel export capability**

## 📊 **Supported Categories**

The system supports **any procurement category** including:

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

## 🎯 **Key Features**

### **Real-time Data Extraction**
✅ **Google SERP API** - Live web search  
✅ **OpenAI GPT-4** - Intelligent analysis  
✅ **20 Suppliers** - Comprehensive coverage  
✅ **Live Progress** - Real-time status updates  

### **Comprehensive Analysis**
✅ **Basic Info** - Company details, revenue, employees  
✅ **Financial Data** - Revenue, profit margins, financial health  
✅ **Operational Details** - Production capacity, certifications  
✅ **Geographic Coverage** - Global presence and locations  
✅ **ESG & Compliance** - Environmental, social, governance metrics  
✅ **SWOT Analysis** - Strengths, weaknesses, opportunities, threats  

### **Advanced Analytics**
✅ **TOPSIS Ranking** - Multi-criteria decision analysis  
✅ **Comparison Matrix** - Side-by-side supplier comparison  
✅ **Geographic Mapping** - Interactive world map  
✅ **News Analysis** - Recent developments and trends  
✅ **Risk Assessment** - Supply chain disruption monitoring  

### **Export Capabilities**
✅ **Excel Reports** - 8 comprehensive sheets  
✅ **Structured Data** - Tabular format with all fields  
✅ **Custom Analysis** - Filtered and sorted data  
✅ **Professional Reports** - Ready for business use  

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

## 🧪 **Testing**

### **Test Categories**
```bash
# Test with these categories:
- "Aluminium"     # Manufacturing
- "Electronics"   # Technology
- "Automotive"    # Transportation
- "Pharmaceuticals" # Healthcare
- "Chemicals"     # Industrial
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

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **API Key Errors** - Check environment variables
2. **Rate Limiting** - Wait between searches
3. **No Results** - Try different category names
4. **Map Errors** - Check coordinate validation

### **Debug Mode**
Enable detailed logging by checking browser console and server logs.

---

## 🎉 **Ready to Use!**

Your real-time supplier discovery agent is now ready to:
- **Search any procurement category**
- **Extract 20 suppliers with live data**
- **Provide comprehensive analysis**
- **Generate professional reports**

**Start discovering suppliers now!** 🚀 