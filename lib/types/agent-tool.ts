export interface AgentTool {
  name: string;
  description: string;
  execute: (params: Record<string, unknown>) => Promise<string>;
}