import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { websiteUrl, companyName } = await request.json();

    if (!websiteUrl && !companyName) {
      return NextResponse.json(
        { error: 'Website URL or Company Name is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting single company analysis for: ${websiteUrl || companyName}`);

    // Step 1: Extract company information from website or analyze company name
    const companyInfo = await analyzeSingleCompany(websiteUrl, companyName);

    if (!companyInfo) {
      return NextResponse.json(
        { error: 'Failed to analyze company information' },
        { status: 404 }
      );
    }

    console.log(`✅ Successfully analyzed company: ${companyInfo.companyName}`);

    return NextResponse.json({
      supplier: companyInfo,
      analyzedAt: new Date().toISOString(),
      dataSource: 'Website Analysis + OpenAI'
    });

  } catch (error) {
    console.error('Error analyzing company:', error);
    return NextResponse.json(
      { error: 'Failed to analyze company', details: error.message },
      { status: 500 }
    );
  }
}

async function analyzeSingleCompany(websiteUrl, companyName) {
  try {
    console.log(`�� Analyzing company: ${websiteUrl || companyName}`);

    let extractedData = {};
    
    // If website URL is provided, try to extract data from it
    if (websiteUrl) {
      extractedData = await extractDataFromWebsite(websiteUrl);
    }

    // Use OpenAI to analyze and enhance the company information
    const enhancedInfo = await enhanceCompanyInfoWithAI(websiteUrl, companyName, extractedData);

    return enhancedInfo;

  } catch (error) {
    console.error('Error analyzing single company:', error);
    return null;
  }
}

async function extractDataFromWebsite(websiteUrl) {
  try {
    console.log(`🌐 Extracting data from website: ${websiteUrl}`);
    
    // Basic web scraping to get company information
    const response = await axios.get(websiteUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const htmlContent = response.data;
    
    // Extract basic information from HTML
    const extractedData = {
      title: extractTitle(htmlContent),
      description: extractDescription(htmlContent),
      contactInfo: extractContactInfo(htmlContent),
      companyType: extractCompanyType(htmlContent),
      location: extractLocation(htmlContent)
    };

    console.log(`📊 Extracted basic data from website`);
    return extractedData;

  } catch (error) {
    console.warn(`Warning: Failed to extract data from website: ${error.message}`);
    return {};
  }
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

function extractDescription(html) {
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  return descMatch ? descMatch[1].trim() : '';
}

function extractContactInfo(html) {
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  const phoneMatch = html.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
  
  return {
    emails: emailMatch || [],
    phones: phoneMatch || []
  };
}

function extractCompanyType(html) {
  const companyTypePatterns = [
    /(inc|corp|corporation|company|ltd|limited|llc|group|holdings|international|global)/gi
  ];
  
  for (const pattern of companyTypePatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0].toUpperCase();
    }
  }
  
  return 'Unknown';
}

function extractLocation(html) {
  const addressPatterns = [
    /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Place|Pl|Court|Ct|Way|Terrace|Ter|Circle|Cir|Square|Sq)[,\s]+[A-Za-z\s]+(?:,\s*)?[A-Z]{2}\s*\d{5}(?:-\d{4})?)/gi,
    /([A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Place|Pl|Court|Ct|Way|Terrace|Ter|Circle|Cir|Square|Sq)[,\s]+[A-Za-z\s]+(?:,\s*)?[A-Z]{2}\s*\d{5}(?:-\d{4})?)/gi
  ];
  
  for (const pattern of addressPatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return '';
}

async function enhanceCompanyInfoWithAI(websiteUrl, companyName, extractedData) {
  try {
    const prompt = `
    Analyze and provide comprehensive information for the company "${companyName || 'from website'}" ${websiteUrl ? `(Website: ${websiteUrl})` : ''}.
    
    Extracted website data:
    - Title: ${extractedData.title || 'N/A'}
    - Description: ${extractedData.description || 'N/A'}
    - Contact: ${JSON.stringify(extractedData.contactInfo || {})}
    - Company Type: ${extractedData.companyType || 'N/A'}
    - Location: ${extractedData.location || 'N/A'}
    
    Provide the following information in JSON format:
    {
      "companyName": "Full company name",
      "companyType": "Public/Private/Subsidiary/Joint Venture",
      "website": "${websiteUrl || 'N/A'}",
      "employees": "Number of employees (numeric)",
      "revenue": "Annual revenue in USD (numeric)",
      "companyBrief": "3-line summary of core business and industry position",
      "yearFounded": "Year the company was founded",
      "headquartersAddress": "Full address",
      "headquartersCity": "City",
      "headquartersCountry": "Country",
      "latitude": "Geographic latitude (numeric)",
      "longitude": "Geographic longitude (numeric)",
      "subsidiaries": ["Subsidiary 1", "Subsidiary 2"],
      "productionCapacity": "Production capacity description",
      "contactEmail": "Contact email",
      "parentCompany": "Parent company name if applicable",
      "ceo": "CEO name",
      "certifications": ["ISO 9001", "Other certifications"],
      "awards": ["Award 1", "Award 2"],
      "diversity": "Diversity and inclusion information",
      "esgStatus": "ESG status and commitments",
      "cybersecurityUpdates": "Cybersecurity information",
      "industriesServed": ["Industry 1", "Industry 2"],
      "netProfitMargin": "Net profit margin percentage",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "supplyChainDisruptions": "Any reported disruptions",
      "productOfferings": {"Product 1": "Yes", "Product 2": "No"},
      "valueAddedServices": ["Service 1", "Service 2"],
      "geographicCoverage": ["Country 1", "Country 2"],
      "plantShutdowns": "Recent or upcoming plant shutdowns",
      "recentNews": [
        {
          "type": "positive/negative/neutral",
          "title": "News title",
          "date": "2024-01-15",
          "description": "News description",
          "source": "News source",
          "impact": "Impact assessment"
        }
      ],
      "websiteAnalysis": {
        "websiteQuality": "High/Medium/Low",
        "digitalPresence": "Strong/Moderate/Weak",
        "onlineReputation": "Positive/Neutral/Negative",
        "socialMediaPresence": ["Platform 1", "Platform 2"],
        "websiteFeatures": ["Feature 1", "Feature 2"]
      }
    }
    
    Important:
    - Use the extracted website data to enhance accuracy
    - If website data is available, use it to validate and improve the analysis
    - Use realistic, accurate data based on what you know about this company
    - If you don't know specific details, use reasonable estimates or "N/A"
    - Ensure all numeric values are actual numbers, not strings
    - Make sure the JSON is valid and complete
    - Include website-specific analysis if URL is provided
    
    Return only valid JSON without any additional text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a procurement research expert specializing in company analysis. Generate accurate, realistic company data based on website analysis and known information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000
    });

    const response = completion.choices[0].message.content;
    const companyInfo = JSON.parse(response);
    
    // Add an ID for consistency
    companyInfo.id = `single-${Date.now()}`;
    
    return companyInfo;

  } catch (error) {
    console.error('Error enhancing company info with AI:', error);
    
    // Return basic info if AI fails
    return {
      companyName: companyName || 'Unknown Company',
      companyType: 'Unknown',
      website: websiteUrl || 'N/A',
      employees: 0,
      revenue: 0,
      companyBrief: `Analysis of ${companyName || 'company'} from website data`,
      yearFounded: 0,
      headquartersAddress: extractedData.location || 'N/A',
      headquartersCity: 'N/A',
      headquartersCountry: 'N/A',
      latitude: 0,
      longitude: 0,
      subsidiaries: [],
      productionCapacity: 'N/A',
      contactEmail: extractedData.contactInfo?.emails?.[0] || 'N/A',
      parentCompany: null,
      ceo: 'N/A',
      certifications: [],
      awards: [],
      diversity: 'N/A',
      esgStatus: 'N/A',
      cybersecurityUpdates: 'N/A',
      industriesServed: [],
      netProfitMargin: 'N/A',
      strengths: [],
      weaknesses: [],
      supplyChainDisruptions: 'N/A',
      productOfferings: {},
      valueAddedServices: [],
      geographicCoverage: [],
      plantShutdowns: 'N/A',
      recentNews: [],
      websiteAnalysis: {
        websiteQuality: 'Unknown',
        digitalPresence: 'Unknown',
        onlineReputation: 'Unknown',
        socialMediaPresence: [],
        websiteFeatures: []
      },
      id: `single-${Date.now()}`
    };
  }
} 