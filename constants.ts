export const LOADING_MESSAGES = [
  "CPO 正在计算 ROI...",
  "UX 研究员正在模拟用户心理...",
  "UI 设计师正在挑选配色方案...",
  "技术负责人正在评估可行性...",
  "增长黑客正在优化转化漏斗...",
  "专家团正在就方案 B 进行激烈的辩论...",
  "正在合成最终战略建议..."
];

export const CURRENT_STATE_OPTIONS = [
  "MVP (0 to 1)",
  "Feature Iteration",
  "Legacy Refactor",
  "Bug Fix / Polish",
  "A/B Test Variant"
];

export const PRODUCT_TYPE_OPTIONS = [
  "B2B SaaS Platform",
  "Consumer Mobile App",
  "Internal Enterprise Tool",
  "E-commerce Storefront",
  "Developer Tool / API",
  "Fintech Dashboard"
];

export const SYSTEM_INSTRUCTION = `
You are the "Product Council AI", a high-level strategic advisor and design critic. 
Your output must be authoritative, structured, and actionable. 
You follow the DEPTH framework: Define Perspectives, Provide Context, Establish Metrics, Task Breakdown, Human Feedback.
You must return the response in highly structured Markdown format.
The language of the response must be CHINESE (Simplified).
Focus on being critical but constructive.
`;