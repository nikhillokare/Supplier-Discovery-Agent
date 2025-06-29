import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google SERP API configuration
const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_BASE_URL = 'https://serpapi.com/search.json';

export async function POST(request) {
  try {
    const { category } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting real-time supplier discovery for: ${category}`);

    // Step 1: Get supplier names using Google SERP API
    const supplierNames = await getSupplierNamesFromGoogle(category);
    
    if (!supplierNames || supplierNames.length === 0) {
      return NextResponse.json(
        { error: 'No suppliers found for this category' },
        { status: 404 }
      );
    }

    console.log(`📋 Found ${supplierNames.length} supplier names`);

    // Step 2: Get detailed information for each supplier using OpenAI
    const suppliers = await getDetailedSupplierInfo(supplierNames, category);

    console.log(`✅ Successfully processed ${suppliers.length} suppliers`);

    // Step 3: Add taxonomy codes
    const taxonomyCodes = getTaxonomyCodes(category);

    return NextResponse.json({
      suppliers,
      taxonomyCodes,
      category,
      totalSuppliers: suppliers.length,
      generatedAt: new Date().toISOString(),
      dataSource: 'Real-time Google SERP + OpenAI'
    });

  } catch (error) {
    console.error('Error discovering suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to discover suppliers', details: error.message },
      { status: 500 }
    );
  }
}

async function getSupplierNamesFromGoogle(category) {
  try {
    console.log(`🔎 Searching Google for ${category} suppliers with geographic diversity...`);

    // Enhanced search queries with geographic focus
    const searchQueries = [
      // Global searches
      `top ${category} manufacturers companies worldwide`,
      `largest ${category} suppliers global`,
      `best ${category} producers companies international`,
      
      // Indian companies focus
      `top ${category} manufacturers companies India`,
      `largest ${category} suppliers India`,
      `${category} industry leaders India`,
      `Indian ${category} manufacturers companies`,
      
      // US companies
      `top ${category} manufacturers companies USA`,
      `largest ${category} suppliers United States`,
      `${category} industry leaders USA`,
      
      // Chinese companies
      `top ${category} manufacturers companies China`,
      `largest ${category} suppliers China`,
      `${category} industry leaders China`,
      
      // European companies
      `top ${category} manufacturers companies Europe`,
      `largest ${category} suppliers Europe`,
      
      // Other regions
      `top ${category} manufacturers companies Asia Pacific`,
      `${category} suppliers Middle East`,
      `${category} manufacturers Africa`
    ];

    let allSupplierNames = new Set();
    let indianCompanies = new Set();
    let usCompanies = new Set();
    let chineseCompanies = new Set();
    let otherCompanies = new Set();

    for (const query of searchQueries) {
      try {
        const response = await axios.get(SERP_BASE_URL, {
          params: {
            q: query,
            api_key: SERP_API_KEY,
            num: 15, // Get 15 results per query
            gl: 'us', // Global search
            hl: 'en', // English results
            safe: 'active'
          }
        });

        if (response.data && response.data.organic_results) {
          const results = response.data.organic_results;
          
          // Extract company names from search results
          for (const result of results) {
            const companyName = extractCompanyName(result.title, result.snippet);
            if (companyName && isValidCompanyName(companyName)) {
              // Categorize companies based on search query
              if (query.toLowerCase().includes('india') || query.toLowerCase().includes('indian')) {
                indianCompanies.add(companyName);
              } else if (query.toLowerCase().includes('usa') || query.toLowerCase().includes('united states')) {
                usCompanies.add(companyName);
              } else if (query.toLowerCase().includes('china') || query.toLowerCase().includes('chinese')) {
                chineseCompanies.add(companyName);
              } else {
                otherCompanies.add(companyName);
              }
              allSupplierNames.add(companyName);
            }
          }
        }

        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.warn(`Warning: Failed to search for query "${query}":`, error.message);
        continue;
      }
    }

    // Create a balanced list with geographic diversity
    const balancedSupplierNames = createBalancedSupplierList(
      Array.from(indianCompanies),
      Array.from(usCompanies),
      Array.from(chineseCompanies),
      Array.from(otherCompanies)
    );
    
    console.log(`📊 Extracted ${balancedSupplierNames.length} suppliers with geographic diversity`);
    console.log(`🇳 Indian companies: ${indianCompanies.size}`);
    console.log(`🇺🇸 US companies: ${usCompanies.size}`);
    console.log(`🇨🇳 Chinese companies: ${chineseCompanies.size}`);
    console.log(`🌍 Other companies: ${otherCompanies.size}`);
    
    return balancedSupplierNames;

  } catch (error) {
    console.error('Error getting supplier names from Google:', error);
    
    // Fallback: Use AI to generate supplier names with geographic diversity
    console.log('🔄 Falling back to AI-generated supplier names with geographic diversity...');
    return await generateSupplierNamesWithAI(category);
  }
}

function createBalancedSupplierList(indianCompanies, usCompanies, chineseCompanies, otherCompanies) {
  const targetTotal = 3;
  const targetIndian = Math.ceil(targetTotal * 0.35); // 35% Indian companies (1 company)
  const targetUS = Math.ceil(targetTotal * 0.25);     // 25% US companies (1 company)
  const targetChinese = Math.ceil(targetTotal * 0.20); // 20% Chinese companies (1 company)
  const targetOther = targetTotal - targetIndian - targetUS - targetChinese; // 20% other (0 companies)

  const balancedList = [];
  
  // Add Indian companies (prioritized)
  balancedList.push(...indianCompanies.slice(0, targetIndian));
  
  // Add US companies
  balancedList.push(...usCompanies.slice(0, targetUS));
  
  // Add Chinese companies
  balancedList.push(...chineseCompanies.slice(0, targetChinese));
  
  // Add other companies
  balancedList.push(...otherCompanies.slice(0, targetOther));
  
  // If we don't have enough from any category, fill with others
  const remaining = targetTotal - balancedList.length;
  if (remaining > 0) {
    const allRemaining = [
      ...indianCompanies.slice(targetIndian),
      ...usCompanies.slice(targetUS),
      ...chineseCompanies.slice(targetChinese),
      ...otherCompanies.slice(targetOther)
    ];
    balancedList.push(...allRemaining.slice(0, remaining));
  }
  
  return balancedList.slice(0, targetTotal);
}

function extractCompanyName(title, snippet) {
  try {
    // Common patterns for company names in search results
    const patterns = [
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // First word capitalized
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc|Corp|Ltd|LLC|Company|Manufacturing|Industries)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Group|Holdings|International|Global)/i
    ];

    const text = `${title} ${snippet}`;
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 50) {
          return name;
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

function isValidCompanyName(name) {
  if (!name || name.length < 2 || name.length > 50) return false;
  
  // Filter out common non-company terms
  const invalidTerms = [
    'wikipedia', 'linkedin', 'facebook', 'twitter', 'youtube', 'google',
    'amazon', 'ebay', 'alibaba', 'search', 'results', 'news', 'article',
    'blog', 'forum', 'directory', 'list', 'top', 'best', 'largest'
  ];

  const lowerName = name.toLowerCase();
  return !invalidTerms.some(term => lowerName.includes(term));
}

async function generateSupplierNamesWithAI(category) {
  try {
    const prompt = `
    Generate a list of 3 real, major companies that are suppliers/manufacturers in the ${category} industry.
    
    Return only the company names as a JSON array, like this:
    ["Company Name 1", "Company Name 2", "Company Name 3"]
    
    IMPORTANT: Ensure geographic diversity with the following distribution:
    - 1 Indian company - Focus on major Indian manufacturers like Tata, Reliance, Mahindra, etc.
    - 1 US company - Major US manufacturers
    - 1 Other country company - Companies from Europe, Japan, South Korea, etc.
    
    Focus on:
    - Large, well-known companies that actually exist
    - Global manufacturers and suppliers in ${category}
    - Mix of public and private companies
    - Companies with significant market presence
    - Real companies with verifiable operations in ${category}
    
    Examples of Indian companies to consider: Tata Steel, Reliance Industries, Mahindra & Mahindra, Larsen & Toubro, Bharat Forge, etc.
    
    Return only valid JSON array without any additional text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a procurement research expert. Generate only real company names with geographic diversity, focusing on Indian companies. Return only JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    const supplierNames = JSON.parse(response);
    
    return supplierNames.slice(0, 3); // Changed from 20 to 3

  } catch (error) {
    console.error('Error generating supplier names with AI:', error);
    return [];
  }
}

async function getDetailedSupplierInfo(supplierNames, category) {
  try {
    const suppliers = [];
    for (let i = 0; i < supplierNames.length; i++) {
      const companyName = supplierNames[i];
      try {
        const supplierInfo = await getSingleSupplierInfo(companyName, category);
        suppliers.push({
          ...supplierInfo,
          id: `${category.toLowerCase()}-${i + 1}`
        });
      } catch (error) {
        console.warn(`Warning: Failed to get info for ${companyName}:`, error.message);
        // Optionally, push a placeholder or skip
      }
      // Optional: Add a delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(`✅ Successfully processed ${suppliers.length} suppliers`);
    return suppliers;
  } catch (error) {
    console.error('Error getting detailed supplier info:', error);
    return [];
  }
}

async function getSingleSupplierInfo(companyName, category) {
  try {
    const prompt = `
    Generate detailed information for the company "${companyName}" in the ${category} industry.
    
    Provide the following information in JSON format:
    {
      "companyName": "${companyName}",
      "companyType": "Public/Private/Subsidiary/Joint Venture",
      "website": "Company website URL",
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
      ]
    }
    
    Important:
    - Use realistic, accurate data based on what you know about this company
    - If you don't know specific details, use reasonable estimates or "N/A"
    - Ensure all numeric values are actual numbers, not strings
    - Make sure the JSON is valid and complete
    - Focus on ${category} industry relevance
    - For Indian companies, include relevant Indian market context and operations
    - For companies from different countries, include their regional market presence
    
    Return only valid JSON without any additional text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a procurement research expert. Generate accurate, realistic company data in JSON format with geographic context."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000
    });

    const response = completion.choices[0].message.content;
    const supplierInfo = JSON.parse(response);
    
    return supplierInfo;

  } catch (error) {
    console.error(`Error getting info for ${companyName}:`, error);
    
    // Return basic info if AI fails
    return {
      companyName,
      companyType: 'Unknown',
      website: 'N/A',
      employees: 0,
      revenue: 0,
      companyBrief: `Information about ${companyName} in the ${category} industry`,
      yearFounded: 0,
      headquartersAddress: 'N/A',
      headquartersCity: 'N/A',
      headquartersCountry: 'N/A',
      latitude: 0,
      longitude: 0,
      subsidiaries: [],
      productionCapacity: 'N/A',
      contactEmail: 'N/A',
      parentCompany: null,
      ceo: 'N/A',
      certifications: [],
      awards: [],
      diversity: 'N/A',
      esgStatus: 'N/A',
      cybersecurityUpdates: 'N/A',
      industriesServed: [category],
      netProfitMargin: 'N/A',
      strengths: [],
      weaknesses: [],
      supplyChainDisruptions: 'N/A',
      productOfferings: {},
      valueAddedServices: [],
      geographicCoverage: [],
      plantShutdowns: 'N/A',
      recentNews: []
    };
  }
}

function getTaxonomyCodes(category) {
  const taxonomyMap = {
    'Aluminium': {
      HS: ['7601', '7602', '7603', '7604', '7605', '7606', '7607', '7608', '7609'],
      SIC: ['3334', '3353', '3354', '3355', '3356'],
      UNSPSC: ['111015', '111016', '111017', '111018'],
      NAICS: ['331312', '331313', '331314', '331315', '331316']
    },
    'Steel': {
      HS: ['7201', '7202', '7203', '7204', '7205', '7206', '7207', '7208', '7209'],
      SIC: ['3312', '3313', '3315', '3316', '3317'],
      UNSPSC: ['111015', '111016', '111017'],
      NAICS: ['331111', '331112', '331210', '331221', '331222']
    },
    'Electronics': {
      HS: ['8471', '8473', '8474', '8517', '8528', '8532', '8533', '8534'],
      SIC: ['3571', '3572', '3573', '3574', '3575', '3576', '3577'],
      UNSPSC: ['411000', '411100', '411200', '411300'],
      NAICS: ['334111', '334112', '334113', '334119', '334210', '334220']
    },
    'Automotive': {
      HS: ['8701', '8702', '8703', '8704', '8705', '8706', '8707', '8708'],
      SIC: ['3711', '3713', '3714', '3715', '3716'],
      UNSPSC: ['251000', '251100', '251200', '251300'],
      NAICS: ['336111', '336112', '336120', '336211', '336212']
    },
    'Pharmaceuticals': {
      HS: ['3001', '3002', '3003', '3004', '3005', '3006'],
      SIC: ['2833', '2834', '2835', '2836'],
      UNSPSC: ['511000', '511100', '511200', '511300'],
      NAICS: ['325412', '325413', '325414', '325415']
    },
    'Chemicals': {
      HS: ['2801', '2802', '2803', '2804', '2805', '2806', '2807', '2808', '2809'],
      SIC: ['2812', '2813', '2816', '2819', '2821', '2822', '2823', '2824'],
      UNSPSC: ['121000', '121100', '121200', '121300'],
      NAICS: ['325110', '325120', '325130', '325180', '325190', '325200']
    }
  };

  return taxonomyMap[category] || {
    HS: ['Generic category codes'],
    SIC: ['Generic category codes'],
    UNSPSC: ['Generic category codes'],
    NAICS: ['Generic category codes']
  };
} 