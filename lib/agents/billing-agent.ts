import { getToolsByAgent } from "../tools/tool-registry";
import { BaseSubAgent } from "./base-sub-agent";

export class BillingAgent extends BaseSubAgent {
  constructor() {
    super(
      'BillingAgent',
      'Handle billing inquiries, refunds, invoices, and payment issues',
      getToolsByAgent('billing')
    );
  }
}
