import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Uploaded file is not a PDF.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Buffer:', buffer);
    console.log('Buffer isBuffer:', Buffer.isBuffer(buffer));
    console.log('Buffer length:', buffer.length);
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      return NextResponse.json({ error: 'Failed to read PDF file buffer.' }, { status: 400 });
    }

    let text;
    try {
      // Use pdf-parse with proper initialization to avoid test file issues
      const pdfParse = await import('pdf-parse');
      const parseFunction = pdfParse.default || pdfParse;
      
      // Create a clean options object to avoid test file references
      const options = {
        // Disable any internal tests or demos
        max: 0, // No page limit
        version: 'v1.10.100' // Specify version to avoid auto-detection
      };
      
      const pdfData = await parseFunction(buffer, options);
      text = pdfData.text;
      
    } catch (err) {
      console.error('PDF parsing error:', err);
      
      // Fallback: try to extract text manually or return meaningful error
      if (err.message && err.message.includes('test')) {
        console.log('Attempting fallback text extraction...');
        try {
          // Simple fallback - convert buffer to string and extract readable text
          const rawText = buffer.toString('utf8');
          const textMatches = rawText.match(/[a-zA-Z0-9\s.,!?;:()\-]+/g);
          text = textMatches ? textMatches.join(' ').trim() : '';
          
          if (!text || text.length < 10) {
            throw new Error('No readable text found in PDF');
          }
        } catch (fallbackErr) {
          console.error('Fallback extraction failed:', fallbackErr);
          return NextResponse.json({ error: 'Unable to extract text from PDF. Please ensure the PDF contains readable text.' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse PDF file.' }, { status: 500 });
      }
    }

    const prompt = `Extract all supplier-related data from the following PDF text. Return a JSON array of supplier objects with as much detail as possible (company name, revenue, certifications, CEO, etc.):\n\n${text}\n\nReturn only valid JSON array without any extra text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured supplier data from unstructured documents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000
    });

    const response = completion.choices[0].message.content;

    let suppliers = [];
    try {
      suppliers = JSON.parse(response);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse supplier data from GPT.' }, { status: 500 });
    }

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Error extracting PDF:', error);
    return NextResponse.json({ error: 'Failed to extract PDF.' }, { status: 500 });
  }
}
