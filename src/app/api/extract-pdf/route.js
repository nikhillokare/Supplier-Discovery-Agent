import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

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

    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch (err) {
      console.error('pdfParse error:', err);
      return NextResponse.json({ error: 'Failed to parse PDF file.' }, { status: 500 });
    }

    const text = pdfData.text;

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
