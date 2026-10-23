import { getToolsByAgent } from "../tools/tool-registry";
import { BaseSubAgent } from "./base-sub-agent";

export class TechnicalAgent extends BaseSubAgent {
  constructor() {
    super(
      'TechnicalAgent',
      'Diagnose and resolve technical issues with services and connectivity',
      getToolsByAgent('technical')
    );
  }
}