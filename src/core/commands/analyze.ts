import * as vscode from "vscode";
import { exec } from "child_process";
import path from "path";
import { ReportService } from "../../services/reportService";

export const analyze = async (
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel,
  reportService: ReportService
) => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folders are open.");
    return;
  }

  let selectedWorkspace = workspaceFolders[0];
  let analysisType = await vscode.window.showQuickPick(
    ["full", "basic", "deep", "dependencies"],
    {
      placeHolder: "Select analysis type",
    }
  );

  if (!analysisType) {
    vscode.window.showWarningMessage("No analysis type selected.");
    return;
  }

  const cliPath = path.join(
    context.extensionPath,
    "node_modules",
    "@techfever",
    "labinsight",
    "dist",
    "bin",
    "labinsight.js"
  );

  try {
    await reportService.generateReport(
      cliPath,
      selectedWorkspace.uri.fsPath,
      analysisType
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      "An error occurred during analysis. Check LabInsight Logs for details."
    );
  }
};
