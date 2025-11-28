import { ProductContext, ApiConfig } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateProductCritiqueStream = async (
  context: ProductContext,
  apiConfig: ApiConfig,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!apiConfig.baseUrl || !apiConfig.apiKey) {
    throw new Error("API Configuration is missing. Please check settings.");
  }

  // Ensure Base URL ends with correct path if user only provided host
  // Default expectation: user provides "http://host:port/v1" or we append it
  let url = apiConfig.baseUrl;
  if (!url.endsWith('/chat/completions')) {
     // intelligent guess: if it ends in slash, remove it
     if (url.endsWith('/')) url = url.slice(0, -1);
     // if it doesn't have v1, add it (common convention), otherwise just add /chat/completions
     if (!url.includes('/v1')) {
         url = `${url}/v1/chat/completions`;
     } else {
         url = `${url}/chat/completions`;
     }
  }
  
  // If user explicitly provided a full path in settings (e.g. including /chat/completions), use it directly
  if (apiConfig.baseUrl.includes('/chat/completions')) {
      url = apiConfig.baseUrl;
  }

  // Construct the DEPTH Prompt in Chinese
  const userPrompt = `
  # 用户提供的上下文:
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
  `;

  const messages: any[] = [
    { role: "system", content: SYSTEM_INSTRUCTION }
  ];

  const contentParts: any[] = [
    { type: "text", text: userPrompt }
  ];

  if (context.images && context.images.length > 0) {
    context.images.forEach(imageStr => {
      // imageStr is like "data:image/png;base64,....."
      contentParts.push({
        type: "image_url",
        image_url: {
          url: imageStr
        }
      });
    });
  }

  messages.push({
    role: "user",
    content: contentParts
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: apiConfig.model || 'gpt-4-vision-preview', // Default or user choice
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        
        const dataStr = trimmed.slice(6);
        if (dataStr === "[DONE]") return;

        try {
          const json = JSON.parse(dataStr);
          const content = json.choices?.[0]?.delta?.content || "";
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          console.warn("Failed to parse stream chunk", e);
        }
      }
    }
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};