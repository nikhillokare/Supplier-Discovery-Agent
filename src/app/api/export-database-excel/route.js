import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const { databaseData, databaseType, databaseUrl } = await request.json();

    if (!databaseData || !databaseData.tables) {
      return NextResponse.json(
        { error: 'Invalid database data' },
        { status: 400 }
      );
    }

    console.log(`📊 Creating Excel export for ${databaseType} database with ${Object.keys(databaseData.tables).length} tables`);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Database Overview
    const overview = {
      'Database Type': databaseType || 'Unknown',
      'Connection URL': databaseUrl || 'N/A',
      'Total Tables': databaseData.metadata?.totalTables || Object.keys(databaseData.tables).length,
      'Extraction Date': new Date().toISOString(),
      'Database Name': databaseData.metadata?.databaseName || 'N/A'
    };

    const overviewData = Object.entries(overview).map(([key, value]) => ({
      'Property': key,
      'Value': value
    }));

    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Database Overview');

    // Sheet 2: Tables Summary
    const tablesSummary = Object.entries(databaseData.tables).map(([tableName, tableData]) => ({
      'Table Name': tableName,
      'Total Rows': tableData.totalRows || tableData.rows?.length || 0,
      'Total Columns': tableData.totalColumns || tableData.columns?.length || 0,
      'Has Error': tableData.error ? 'Yes' : 'No',
      'Error Message': tableData.error || 'None',
      'Sample Data Available': tableData.rows && tableData.rows.length > 0 ? 'Yes' : 'No'
    }));

    const summarySheet = XLSX.utils.json_to_sheet(tablesSummary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tables Summary');

    // Sheet 3: Column Schema (for SQL databases)
    const columnSchema = [];
    Object.entries(databaseData.tables).forEach(([tableName, tableData]) => {
      if (tableData.schema && Array.isArray(tableData.schema)) {
        // SQL database schema
        tableData.schema.forEach(column => {
          columnSchema.push({
            'Table Name': tableName,
            'Column Name': column.Field || column.column_name || column.name,
            'Data Type': column.Type || column.data_type || column.type,
            'Nullable': column.Null || column.is_nullable || 'Unknown',
            'Key': column.Key || column.constraint_type || 'None',
            'Default': column.Default || column.column_default || 'None',
            'Extra': column.Extra || 'None'
          });
        });
      } else if (tableData.columns) {
        // For databases without detailed schema info
        tableData.columns.forEach(columnName => {
          columnSchema.push({
            'Table Name': tableName,
            'Column Name': columnName,
            'Data Type': 'Unknown',
            'Nullable': 'Unknown',
            'Key': 'None',
            'Default': 'None',
            'Extra': 'None'
          });
        });
      }
    });

    if (columnSchema.length > 0) {
      const schemaSheet = XLSX.utils.json_to_sheet(columnSchema);
      XLSX.utils.book_append_sheet(workbook, schemaSheet, 'Column Schema');
    }

    // Individual sheets for each table data (limit to first 50 tables to avoid Excel limits)
    const tableNames = Object.keys(databaseData.tables).slice(0, 50);
    
    for (const tableName of tableNames) {
      const tableData = databaseData.tables[tableName];
      
      if (tableData.error) {
        // Create error sheet
        const errorData = [{
          'Table Name': tableName,
          'Error': tableData.error,
          'Status': 'Failed to extract data'
        }];
        const errorSheet = XLSX.utils.json_to_sheet(errorData);
        XLSX.utils.book_append_sheet(workbook, errorSheet, `Error_${sanitizeSheetName(tableName)}`);
        continue;
      }

      if (!tableData.rows || tableData.rows.length === 0) {
        // Create empty table sheet
        const emptyData = [{
          'Table Name': tableName,
          'Status': 'No data found',
          'Columns': tableData.columns?.join(', ') || 'Unknown'
        }];
        const emptySheet = XLSX.utils.json_to_sheet(emptyData);
        XLSX.utils.book_append_sheet(workbook, emptySheet, `Empty_${sanitizeSheetName(tableName)}`);
        continue;
      }

      // Create data sheet for table (limit to first 10000 rows for performance)
      const limitedRows = tableData.rows.slice(0, 10000);
      
      // Clean data for Excel export
      const cleanedRows = limitedRows.map(row => {
        const cleanedRow = {};
        Object.entries(row).forEach(([key, value]) => {
          // Handle various data types for Excel compatibility
          if (value === null || value === undefined) {
            cleanedRow[key] = '';
          } else if (typeof value === 'object') {
            cleanedRow[key] = JSON.stringify(value);
          } else if (typeof value === 'boolean') {
            cleanedRow[key] = value ? 'TRUE' : 'FALSE';
          } else {
            cleanedRow[key] = String(value);
          }
        });
        return cleanedRow;
      });

      if (cleanedRows.length > 0) {
        const dataSheet = XLSX.utils.json_to_sheet(cleanedRows);
        
        // Add metadata to sheet
        const sheetName = sanitizeSheetName(tableName);
        XLSX.utils.book_append_sheet(workbook, dataSheet, sheetName);
        
        // Add note if data was truncated
        if (tableData.rows.length > 10000) {
          const noteData = [{
            'Note': `Data truncated - showing first 10,000 rows of ${tableData.rows.length} total rows`
          }];
          const noteSheet = XLSX.utils.json_to_sheet(noteData);
          XLSX.utils.book_append_sheet(workbook, noteSheet, `Note_${sheetName}`);
        }
      }
    }

    // If there are more than 50 tables, add a note
    if (Object.keys(databaseData.tables).length > 50) {
      const limitNoteData = [{
        'Note': `Export limited to first 50 tables out of ${Object.keys(databaseData.tables).length} total tables`,
        'Reason': 'Excel workbook size limitations',
        'All Tables': Object.keys(databaseData.tables).join(', ')
      }];
      const limitNoteSheet = XLSX.utils.json_to_sheet(limitNoteData);
      XLSX.utils.book_append_sheet(workbook, limitNoteSheet, 'Export Limitations');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create response with Excel file
    const fileName = `${databaseType || 'database'}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

    console.log(`✅ Excel export created successfully: ${fileName}`);
    return response;

  } catch (error) {
    console.error('Error exporting database to Excel:', error);
    return NextResponse.json(
      { error: 'Failed to export database to Excel', details: error.message },
      { status: 500 }
    );
  }
}

function sanitizeSheetName(name) {
  // Excel sheet names have limitations
  return name
    .replace(/[\\\/\?\*\[\]]/g, '_') // Replace invalid characters
    .substring(0, 31) // Max 31 characters
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}