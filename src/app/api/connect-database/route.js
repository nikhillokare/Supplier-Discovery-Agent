import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { databaseUrl, databaseType } = await request.json();

    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Database URL is required' },
        { status: 400 }
      );
    }

    console.log(`🔗 Connecting to ${databaseType || 'database'}: ${databaseUrl}`);

    let databaseData = {};
    
    // Detect database type from URL if not provided
    const detectedType = detectDatabaseType(databaseUrl);
    const dbType = databaseType || detectedType;

    console.log(`📊 Detected database type: ${dbType}`);

    switch (dbType.toLowerCase()) {
      case 'mysql':
        databaseData = await connectToMySQL(databaseUrl);
        break;
      case 'postgresql':
      case 'postgres':
        databaseData = await connectToPostgreSQL(databaseUrl);
        break;
      case 'mongodb':
        databaseData = await connectToMongoDB(databaseUrl);
        break;
      case 'sqlite':
        databaseData = await connectToSQLite(databaseUrl);
        break;
      case 'mssql':
      case 'sqlserver':
        databaseData = await connectToMSSQL(databaseUrl);
        break;
      case 'oracle':
        databaseData = await connectToOracle(databaseUrl);
        break;
      default:
        // Try generic SQL connection as fallback
        databaseData = await connectGenericSQL(databaseUrl);
    }

    console.log(`✅ Successfully extracted data from ${dbType} database`);
    console.log(`📋 Found ${Object.keys(databaseData.tables || {}).length} tables`);

    return NextResponse.json({
      success: true,
      databaseType: dbType,
      databaseUrl: maskUrl(databaseUrl),
      tables: databaseData.tables,
      metadata: databaseData.metadata,
      extractedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to database', details: error.message },
      { status: 500 }
    );
  }
}

function detectDatabaseType(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('mysql') || urlLower.startsWith('mysql://')) return 'mysql';
  if (urlLower.includes('postgresql') || urlLower.includes('postgres') || urlLower.startsWith('postgresql://') || urlLower.startsWith('postgres://')) return 'postgresql';
  if (urlLower.includes('mongodb') || urlLower.startsWith('mongodb://') || urlLower.startsWith('mongodb+srv://')) return 'mongodb';
  if (urlLower.includes('sqlite') || urlLower.endsWith('.db') || urlLower.endsWith('.sqlite')) return 'sqlite';
  if (urlLower.includes('sqlserver') || urlLower.includes('mssql') || urlLower.startsWith('mssql://')) return 'mssql';
  if (urlLower.includes('oracle')) return 'oracle';
  
  return 'generic';
}

function maskUrl(url) {
  // Mask sensitive information in URL for logging
  return url.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
}

async function connectToMySQL(url) {
  try {
    // Import mysql2 dynamically
    const mysql = await import('mysql2/promise');
    
    const connection = await mysql.createConnection(url);
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    const databaseTables = {};
    const metadata = {
      totalTables: tableNames.length,
      tableNames: tableNames
    };
    
    // Get data from each table
    for (const tableName of tableNames) {
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        const columnNames = columns.map(col => col.Field);
        
        // Get table data (limit to 1000 rows for performance)
        const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1000`);
        
        databaseTables[tableName] = {
          columns: columnNames,
          rows: rows,
          totalColumns: columnNames.length,
          totalRows: rows.length,
          schema: columns
        };
      } catch (tableError) {
        console.warn(`Warning: Could not fetch data from table ${tableName}:`, tableError.message);
        databaseTables[tableName] = {
          columns: [],
          rows: [],
          error: tableError.message
        };
      }
    }
    
    await connection.end();
    
    return {
      tables: databaseTables,
      metadata: metadata
    };
    
  } catch (error) {
    throw new Error(`MySQL connection failed: ${error.message}`);
  }
}

async function connectToPostgreSQL(url) {
  try {
    // Import pg dynamically
    const { Client } = await import('pg');
    
    const client = new Client({ connectionString: url });
    await client.connect();
    
    // Get all tables from public schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    
    const databaseTables = {};
    const metadata = {
      totalTables: tableNames.length,
      tableNames: tableNames
    };
    
    // Get data from each table
    for (const tableName of tableNames) {
      try {
        // Get table structure
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [tableName]);
        
        const columns = columnsResult.rows;
        const columnNames = columns.map(col => col.column_name);
        
        // Get table data (limit to 1000 rows)
        const dataResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 1000`);
        
        databaseTables[tableName] = {
          columns: columnNames,
          rows: dataResult.rows,
          totalColumns: columnNames.length,
          totalRows: dataResult.rows.length,
          schema: columns
        };
      } catch (tableError) {
        console.warn(`Warning: Could not fetch data from table ${tableName}:`, tableError.message);
        databaseTables[tableName] = {
          columns: [],
          rows: [],
          error: tableError.message
        };
      }
    }
    
    await client.end();
    
    return {
      tables: databaseTables,
      metadata: metadata
    };
    
  } catch (error) {
    throw new Error(`PostgreSQL connection failed: ${error.message}`);
  }
}

async function connectToMongoDB(url) {
  try {
    // Import mongodb dynamically
    const { MongoClient } = await import('mongodb');
    
    const client = new MongoClient(url);
    await client.connect();
    
    const db = client.db();
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    const databaseTables = {};
    const metadata = {
      totalTables: collectionNames.length,
      tableNames: collectionNames,
      databaseName: db.databaseName
    };
    
    // Get data from each collection
    for (const collectionName of collectionNames) {
      try {
        const collection = db.collection(collectionName);
        
        // Get sample documents to determine schema
        const sampleDocs = await collection.find({}).limit(1000).toArray();
        
        if (sampleDocs.length > 0) {
          // Extract all possible fields from sample documents
          const allFields = new Set();
          sampleDocs.forEach(doc => {
            Object.keys(doc).forEach(key => allFields.add(key));
          });
          
          const columns = Array.from(allFields);
          
          // Convert MongoDB documents to rows format
          const rows = sampleDocs.map(doc => {
            const row = {};
            columns.forEach(col => {
              row[col] = doc[col] !== undefined ? 
                (typeof doc[col] === 'object' ? JSON.stringify(doc[col]) : doc[col]) : 
                null;
            });
            return row;
          });
          
          databaseTables[collectionName] = {
            columns: columns,
            rows: rows,
            totalColumns: columns.length,
            totalRows: rows.length,
            documentCount: await collection.countDocuments()
          };
        } else {
          databaseTables[collectionName] = {
            columns: [],
            rows: [],
            totalColumns: 0,
            totalRows: 0,
            documentCount: 0
          };
        }
      } catch (tableError) {
        console.warn(`Warning: Could not fetch data from collection ${collectionName}:`, tableError.message);
        databaseTables[collectionName] = {
          columns: [],
          rows: [],
          error: tableError.message
        };
      }
    }
    
    await client.close();
    
    return {
      tables: databaseTables,
      metadata: metadata
    };
    
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

async function connectToSQLite(url) {
  try {
    // Import sqlite3 dynamically
    const Database = (await import('better-sqlite3')).default;
    
    // Handle file:// URLs and local paths
    const dbPath = url.startsWith('file://') ? url.replace('file://', '') : url;
    const db = new Database(dbPath);
    
    // Get all tables
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
    const tableNames = tables.map(table => table.name);
    
    const databaseTables = {};
    const metadata = {
      totalTables: tableNames.length,
      tableNames: tableNames
    };
    
    // Get data from each table
    for (const tableName of tableNames) {
      try {
        // Get table info
        const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const columnNames = tableInfo.map(col => col.name);
        
        // Get table data (limit to 1000 rows)
        const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT 1000`).all();
        
        databaseTables[tableName] = {
          columns: columnNames,
          rows: rows,
          totalColumns: columnNames.length,
          totalRows: rows.length,
          schema: tableInfo
        };
      } catch (tableError) {
        console.warn(`Warning: Could not fetch data from table ${tableName}:`, tableError.message);
        databaseTables[tableName] = {
          columns: [],
          rows: [],
          error: tableError.message
        };
      }
    }
    
    db.close();
    
    return {
      tables: databaseTables,
      metadata: metadata
    };
    
  } catch (error) {
    throw new Error(`SQLite connection failed: ${error.message}`);
  }
}

async function connectToMSSQL(url) {
  try {
    // Import mssql dynamically
    const sql = await import('mssql');
    
    const pool = await sql.connect(url);
    
    // Get all tables
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    
    const tableNames = tablesResult.recordset.map(row => row.TABLE_NAME);
    
    const databaseTables = {};
    const metadata = {
      totalTables: tableNames.length,
      tableNames: tableNames
    };
    
    // Get data from each table
    for (const tableName of tableNames) {
      try {
        // Get table structure
        const columnsResult = await pool.request().query(`
          SELECT COLUMN_NAME, DATA_TYPE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = '${tableName}'
          ORDER BY ORDINAL_POSITION
        `);
        
        const columns = columnsResult.recordset;
        const columnNames = columns.map(col => col.COLUMN_NAME);
        
        // Get table data (limit to 1000 rows)
        const dataResult = await pool.request().query(`SELECT TOP 1000 * FROM [${tableName}]`);
        
        databaseTables[tableName] = {
          columns: columnNames,
          rows: dataResult.recordset,
          totalColumns: columnNames.length,
          totalRows: dataResult.recordset.length,
          schema: columns
        };
      } catch (tableError) {
        console.warn(`Warning: Could not fetch data from table ${tableName}:`, tableError.message);
        databaseTables[tableName] = {
          columns: [],
          rows: [],
          error: tableError.message
        };
      }
    }
    
    await pool.close();
    
    return {
      tables: databaseTables,
      metadata: metadata
    };
    
  } catch (error) {
    throw new Error(`SQL Server connection failed: ${error.message}`);
  }
}

async function connectToOracle(url) {
  // Oracle connection would require oracledb package
  throw new Error('Oracle database connection not yet implemented. Please install oracledb package.');
}

async function connectGenericSQL(url) {
  // Try to determine and connect using generic SQL approach
  throw new Error('Generic SQL connection not implemented. Please specify database type.');
}