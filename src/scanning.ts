import * as vscode from 'vscode';
import { LabinsightViewerProvider } from './provider';

export function scanAllWorkspaces(provider: LabinsightViewerProvider) {
  provider.scanAllWorkspaces();
}