import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const { suppliers, category } = await request.json();

    if (!suppliers || !Array.isArray(suppliers)) {
      return NextResponse.json(
        { error: 'Invalid suppliers data' },
        { status: 400 }
      );
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Supplier Overview
    const overviewData = suppliers.map(supplier => ({
      'Company Name': supplier.companyName,
      'Company Type': supplier.companyType,
      'Website': supplier.website,
      'Employees': supplier.employees,
      'Revenue (USD)': supplier.revenue,
      'Year Founded': supplier.yearFounded,
      'Headquarters': `${supplier.headquartersCity}, ${supplier.headquartersCountry}`,
      'CEO': supplier.ceo,
      'Parent Company': supplier.parentCompany,
      'Net Profit Margin': supplier.netProfitMargin,
      'Production Capacity': supplier.productionCapacity,
      'Contact Email': supplier.contactEmail,
      'ESG Status': supplier.esgStatus,
      'Geographic Coverage': supplier.geographicCoverage?.join(', '),
      'Industries Served': supplier.industriesServed?.join(', '),
      'Certifications': supplier.certifications?.join(', '),
      'Awards': supplier.awards?.join(', '),
      'Company Brief': supplier.companyBrief
    }));

    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Supplier Overview');

    // Sheet 2: Product Offerings Matrix
    const productOfferingsData = [];
    const allProducts = new Set();
    
    suppliers.forEach(supplier => {
      if (supplier.productOfferings) {
        Object.keys(supplier.productOfferings).forEach(product => {
          allProducts.add(product);
        });
      }
    });

    const productArray = Array.from(allProducts);
    const header = ['Company Name', ...productArray];
    productOfferingsData.push(header);

    suppliers.forEach(supplier => {
      const row = [supplier.companyName];
      productArray.forEach(product => {
        row.push(supplier.productOfferings?.[product] || 'No');
      });
      productOfferingsData.push(row);
    });

    const productSheet = XLSX.utils.aoa_to_sheet(productOfferingsData);
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Product Offerings');

    // Sheet 3: Financial Analysis
    const financialData = suppliers.map(supplier => ({
      'Company Name': supplier.companyName,
      'Revenue (USD)': supplier.revenue,
      'Employees': supplier.employees,
      'Net Profit Margin': supplier.netProfitMargin,
      'Year Founded': supplier.yearFounded,
      'Company Type': supplier.companyType,
      'Geographic Coverage Count': supplier.geographicCoverage?.length || 0,
      'Certifications Count': supplier.certifications?.length || 0,
      'Industries Served Count': supplier.industriesServed?.length || 0
    }));

    const financialSheet = XLSX.utils.json_to_sheet(financialData);
    XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial Analysis');

    // Sheet 4: SWOT Analysis
    const swotData = [];
    suppliers.forEach(supplier => {
      // Strengths
      if (supplier.strengths && supplier.strengths.length > 0) {
        supplier.strengths.forEach(strength => {
          swotData.push({
            'Company Name': supplier.companyName,
            'Category': 'Strength',
            'Description': strength
          });
        });
      }
      
      // Weaknesses
      if (supplier.weaknesses && supplier.weaknesses.length > 0) {
        supplier.weaknesses.forEach(weakness => {
          swotData.push({
            'Company Name': supplier.companyName,
            'Category': 'Weakness',
            'Description': weakness
          });
        });
      }
    });

    const swotSheet = XLSX.utils.json_to_sheet(swotData);
    XLSX.utils.book_append_sheet(workbook, swotSheet, 'SWOT Analysis');

    // Sheet 5: Recent News
    const newsData = [];
    suppliers.forEach(supplier => {
      if (supplier.recentNews && supplier.recentNews.length > 0) {
        supplier.recentNews.forEach(news => {
          newsData.push({
            'Company Name': supplier.companyName,
            'News Type': news.type,
            'Title': news.title,
            'Date': news.date,
            'Description': news.description,
            'Source': news.source,
            'Impact': news.impact
          });
        });
      }
    });

    if (newsData.length > 0) {
      const newsSheet = XLSX.utils.json_to_sheet(newsData);
      XLSX.utils.book_append_sheet(workbook, newsSheet, 'Recent News');
    }

    // Sheet 6: Geographic Analysis
    const geoData = [];
    suppliers.forEach(supplier => {
      if (supplier.geographicCoverage && supplier.geographicCoverage.length > 0) {
        supplier.geographicCoverage.forEach(country => {
          geoData.push({
            'Company Name': supplier.companyName,
            'Country': country,
            'Headquarters Country': supplier.headquartersCountry,
            'Company Type': supplier.companyType
          });
        });
      }
    });

    if (geoData.length > 0) {
      const geoSheet = XLSX.utils.json_to_sheet(geoData);
      XLSX.utils.book_append_sheet(workbook, geoSheet, 'Geographic Coverage');
    }

    // Sheet 7: Certifications & Compliance
    const certData = [];
    suppliers.forEach(supplier => {
      if (supplier.certifications && supplier.certifications.length > 0) {
        supplier.certifications.forEach(cert => {
          certData.push({
            'Company Name': supplier.companyName,
            'Certification': cert,
            'ESG Status': supplier.esgStatus,
            'Diversity': supplier.diversity,
            'Cybersecurity Updates': supplier.cybersecurityUpdates
          });
        });
      }
    });

    if (certData.length > 0) {
      const certSheet = XLSX.utils.json_to_sheet(certData);
      XLSX.utils.book_append_sheet(workbook, certSheet, 'Certifications & Compliance');
    }

    // Sheet 8: Supply Chain & Operations
    const operationsData = suppliers.map(supplier => ({
      'Company Name': supplier.companyName,
      'Production Capacity': supplier.productionCapacity,
      'Supply Chain Disruptions': supplier.supplyChainDisruptions,
      'Plant Shutdowns': supplier.plantShutdowns,
      'Value Added Services': supplier.valueAddedServices?.join(', '),
      'Subsidiaries': supplier.subsidiaries?.join(', '),
      'Contact Email': supplier.contactEmail,
      'Website': supplier.website
    }));

    const operationsSheet = XLSX.utils.json_to_sheet(operationsData);
    XLSX.utils.book_append_sheet(workbook, operationsSheet, 'Supply Chain & Operations');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create response with Excel file
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${category}_supplier_analysis_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });

    return response;

  } catch (error) {
    console.error('Error exporting Excel:', error);
    return NextResponse.json(
      { error: 'Failed to export Excel file' },
      { status: 500 }
    );
  }
} 