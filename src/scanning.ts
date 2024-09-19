import * as vscode from 'vscode';
import { LabinsightViewerRuleProvider } from './core/rules/ruleProvider';

export function scanAllWorkspaces(provider: LabinsightViewerRuleProvider) {
  provider.scanAllWorkspaces();
}