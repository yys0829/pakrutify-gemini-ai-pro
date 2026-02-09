
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReport = async (type: 'hazard' | 'violation', data: any) => {
  try {
    const prompt = `
      请根据以下${type === 'hazard' ? '安全隐患' : '违章行为'}信息，生成一份正式的专业整改通知书草案。
      
      信息内容：
      ${JSON.stringify(data, null, 2)}
      
      要求：
      1. 语气严谨专业
      2. 包含具体的整改建议
      3. 格式清晰
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error generating report:', error);
    return "无法生成报告，请手动填写。";
  }
};
