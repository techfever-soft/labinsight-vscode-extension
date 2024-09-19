import { LabinsightViewerRuleProvider } from "./core/rules/ruleProvider";

export function refreshView(provider: LabinsightViewerRuleProvider) {
  provider.refresh();
}
