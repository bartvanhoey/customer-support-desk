export interface RoutingDecision {
  primaryAgent: "billing" | "account" | "technical";
  confidence: number; // 0.0 to 1.0
  reasoning: string;
}