const axios = require('axios');
const sharp = require('sharp');

class OCRService {
  constructor() {
    this.mistralApiKey = process.env.MISTRAL_OCR_API_KEY;
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
  }

  async preprocessImage(imageBuffer) {
    try {
      // Optimize image for OCR - Sharp automatically detects HEIF/HEIC format
      const processedImage = await sharp(imageBuffer)
        .resize(2000, 2000, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .normalize()
        .sharpen()
        .jpeg({ quality: 95 })
        .toBuffer();

      return processedImage;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  async extractTextFromImage(imageBuffer) {
    try {
      const processedImage = await this.preprocessImage(imageBuffer);
      const base64Image = processedImage.toString('base64');

      // Using Mistral for OCR
      const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this MBV (Material Booking Voucher) image. Return only the extracted text without any additional formatting or commentary."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.mistralApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractInformation(ocrText) {
    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting structured information from MBV (Material Booking Voucher) documents. 
            Extract the following information from the provided text:
            1. Storage Location (format: e.g., HKG01 01 01 01 A1)
            2. Part Number (PN)
            3. Serial Number (SN)
            
            Return ONLY valid JSON with keys: storageLocation, partNumber, serialNumber.
            If any information is not found, return null for that field.
            Do not wrap the JSON in markdown code blocks or any other formatting.
            
            Example output:
            {"storageLocation": "HKG01 03 02 03 A2", "partNumber": "TOP-GEAR001", "serialNumber": "GRAND TOUR001"}`
          },
          {
            role: "user",
            content: ocrText
          }
        ],
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      let responseContent = response.data.choices[0].message.content;
      
      // Clean up the response by removing markdown code blocks
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const extractedInfo = JSON.parse(responseContent);
      return extractedInfo;
    } catch (error) {
      console.error('Information extraction error:', error);
      throw new Error('Failed to extract information from OCR text');
    }
  }

  async processMBVImage(imageBuffer) {
    try {
      console.log('Processing MBV image, buffer size:', imageBuffer.length);
      
      const ocrText = await this.extractTextFromImage(imageBuffer);
      console.log('OCR text extracted:', ocrText);
      
      const extractedInfo = await this.extractInformation(ocrText);
      console.log('Extracted info:', extractedInfo);
      
      return {
        ocrText,
        extractedInfo
      };
    } catch (error) {
      console.error('MBV processing error:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }
}

module.exports = new OCRService();