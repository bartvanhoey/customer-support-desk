import type { CustomerIssue } from "@/lib/types/customer-issue";
import { BillingAgent } from "./billing-agent";
import { AccountAgent } from "./account-agent";
import { TechnicalAgent } from "./technical-agent";
import { Anthropic } from "@anthropic-ai/sdk";
import { RoutingDecision } from "../types/routing-decision";

export class OrchestratorAgent {
  private billingAgent: BillingAgent;
  private accountAgent: AccountAgent;
  private technicalAgent: TechnicalAgent;
  private client: Anthropic;

  constructor() {
    this.billingAgent = new BillingAgent();
    this.accountAgent = new AccountAgent();
    this.technicalAgent = new TechnicalAgent();
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }

  async handleCustomerIssue(issue: CustomerIssue): Promise<string> {
    const routing = await this.routeCustomerIssue(issue);
    console.log("Routing decision:", routing);
    let result: string;
    switch (routing.primaryAgent) {
      case "billing":
        result = await this.billingAgent.processRequest(
          issue.description,
          issue.customerId,
        );
        break;
      case "account":
        result = await this.accountAgent.processRequest(
          issue.description,
          issue.customerId,
        );
        break;
      case "technical":
        result = await this.technicalAgent.processRequest(
          issue.description,
          issue.customerId,
        );
        break;
      default:
        result = `Support response for customer ${issue.customerId}: We have received your issue - "${issue.description}" at ${issue.timestamp}`;
        break;
    }

    const finalResponse = await this.synthesizeResponse(
      issue.description,
      result,
      routing.primaryAgent,
    );

    return finalResponse;
  }
  private async synthesizeResponse(
    issueDescription: string,
    agentFindings: string,
    agentType: string,
  ): Promise<string> {
    const synthesisPrompt = `You are a customer support coordinator synthesizing findings from specialist agents.

    Issue Description: ${issueDescription}
    Agent Type: ${agentType}
    Agent Findings: ${agentFindings}

    Create a professional, empathetic customer-facing response that:
    1. Acknowledges the customer's issue
    2. Explains the investigation and actions taken
    3. Provides clear next steps or resolution guidance
    4. Maintains a professional and empathetic tone throughout the response
    5. Avoids technical jargon and ensures the response is understandable to a non-technical customer.
    6. Offers additional help if needed
    
    Ensure the response is concise (no more than 250 words), clear, and easy for the customer to understand.`;

    const response = await this.client.messages.create({
      model: "claude-opus-5",
      max_tokens: 256,
      messages: [{ role: "user", content: synthesisPrompt }],
    });

    return response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n");
  }
  async routeCustomerIssue(issue: CustomerIssue) {
    const routingPrompt = `You are an expert customer support orchestrator. 
                    Route the following issue to the appropriate agent: ${JSON.stringify(issue)}
                    
                    Available agents: 
                    1. BillingAgent - Handles billing-related issues, refunds, invoices, payments, charges, charge disputes
                    2. AccountAgent - Handles account-related issues, profile updates, and account settings, complex multi-domain issues
                    3. TechnicalAgent - Handles technical issues, troubleshooting, errors, performance, connectivity and bug reports
                    
                    Respond in JSON format with the following structure:
                    {
                      "primaryAgent": "billing" | "account" | "technical"
                      "confidence": "0.0 to 1.0",
                      "reasoning": "Provide a brief explanation for the routing decision"
                    }`;

    const response = await this.client.messages.create({
      model: "claude-opus-5",
      max_tokens: 256,
      messages: [{ role: "user", content: routingPrompt }],
    });

    const responseText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n");

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const decision = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      return decision as RoutingDecision;
    } catch (error) {
      console.error("Routing parse error:", error);
      return {
        primaryAgent: "account",
        confidence: 0.5,
        reasoning: "Default routing due to parsing",
      };
    }
  }
}
