import { GoogleGenAI } from "@google/genai";
import { ProductContext } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateProductCritiqueStream = async (
  context: ProductContext,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct the DEPTH Prompt in Chinese
  const prompt = `
  # 角色: 虚拟产品战略与设计委员会 (Product Council AI)

  ## 用户提供的上下文:
  - **目标用户 (Target Audience)**: ${context.targetAudience}
  - **产品类型 (Product Type)**: ${context.productType}
  - **核心目标 (Primary Goal)**: ${context.primaryGoal}
  - **当前状态 (Current State)**: ${context.currentState}

  ## 指令:
  请分析附带的图片（如果有）以及上述产品背景。
  
  请使用 **中文 (Chinese)** 生成一份结构化的 Markdown 报告，包含以下特定部分：

  ### 第一部分：深度诊断 (🚫 关键阻力点)
  找出阻碍核心目标实现的 3 个致命或关键问题。语调要犀利、直接，使用警告风格。

  ### 第二部分：解决方案路径 (Solution Paths)
  提供两个截然不同的战略方向：
  **方案 A：速赢策略 (稳健型)** - 开发成本低，确定性高，解决眼前痛点。
  **方案 B：北极星策略 (创新型)** - 开发成本高，回报高，重构用户体验。
  对于每个方案，请简要描述 UX 交互变化和大致的技术实现逻辑。

  ### 第三部分：决策矩阵 (Decision Matrix)
  创建一个 Markdown 表格，对比方案 A、方案 B 和现状 (Status Quo)。
  列包含：指标 (Metric) | 方案 A | 方案 B
  行必须包含：开发工作量 (人天估算)、对目标的影响力、风险等级、ROI 评分 (1-10)。

  ### 第四部分：执行建议
  给工程和设计团队的简短下一步行动清单 (Bullet points)。

  重要提示:
  - 保持简洁专业。
  - 使用加粗强调关键点。
  - 如果提供了多张图片，请结合所有图片进行综合分析。
  - 如果没有提供图片，请仅根据战略背景给出建议，并建议用户上传视觉稿以获得更精准的反馈。
  `;

  const parts: any[] = [{ text: prompt }];

  if (context.images && context.images.length > 0) {
    context.images.forEach(imageStr => {
      // Expecting data:image/png;base64,...
      const base64Data = imageStr.split(',')[1];
      const mimeType = imageStr.split(';')[0].split(':')[1];

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    });
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};