import { getToolsByAgent } from "../tools/tool-registry";
import { BaseSubAgent } from "./base-sub-agent";

export class AccountAgent extends BaseSubAgent {
  constructor() {
    super(
      'AccountAgent',
      'Manage account information, customer history, profile updates, and complex issues',
      getToolsByAgent('account')
    );
  }
}
