import * as vscode from "vscode";
import { analyze } from "./core/commands/analyze";
import { LabinsightViewerRuleProvider } from "./core/rules/ruleProvider";
import { createLabinsightFile } from "./core/commands/initialize";
import { LabInsightViewerReportProvider } from "./core/reports/reportProvider";
import { openReportDetailsWebview } from "./core/reports/reportsDetailsWebview";
import { ReportService } from "./services/reportService";

export function activate(context: vscode.ExtensionContext) {
  // Setting up the output channel
  const outputChannel = vscode.window.createOutputChannel("Labinsight");
  context.subscriptions.push(outputChannel);

  const rulesTreeViewProvider = new LabinsightViewerRuleProvider();
  const reportTreeViewProvider = new LabInsightViewerReportProvider();

  vscode.window.createTreeView("labinsightViewerViewRules", {
    treeDataProvider: rulesTreeViewProvider,
  });
  vscode.window.createTreeView("labinsightViewerViewReports", {
    treeDataProvider: reportTreeViewProvider,
  });

  // Setting up the commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "labinsightViewer.createLabinsightFile",
      async () => {
        await createLabinsightFile(rulesTreeViewProvider);
      }
    ),
    vscode.commands.registerCommand("labinsightViewer.analyze", async () => {
      const reportService = new ReportService(() => {
        reportTreeViewProvider.refresh();
      });
      await analyze(context, outputChannel, reportService);

      outputChannel.appendLine("Analysis completed");

      const selected = await vscode.window.showInformationMessage(
        "Analysis completed!",
        "View Reports"
      );

      if (selected === "View Reports") {
        vscode.commands.executeCommand("labinsightViewer.viewReports");
      }
    }),
    vscode.commands.registerCommand("labinsightViewer.viewRules", async () => {
      rulesTreeViewProvider.scanAllWorkspaces();
      rulesTreeViewProvider.showMainMenu();
    }),
    vscode.commands.registerCommand(
      "labinsightViewer.viewReports",
      async () => {
        await vscode.commands.executeCommand(
          "workbench.view.extension.labinsightViewerViewContainer"
        );
        
        reportTreeViewProvider.refresh();
      }
    ),
    vscode.commands.registerCommand("labinsightViewer.refreshReports", () => {
      reportTreeViewProvider.refresh();
      vscode.window.showInformationMessage("Labinsight reports refreshed");
    }),
    vscode.commands.registerCommand(
      "labinsightViewer.viewReportDetails",
      (report) => {
        openReportDetailsWebview(context, report);
      }
    )
    // vscode.commands.registerCommand("labinsightViewer.openConfig", async () =>
    //   openConfig(context)
    // ),
  );
}

export function deactivate() {}
