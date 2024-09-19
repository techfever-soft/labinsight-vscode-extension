import * as vscode from "vscode";
import { ReportTreeItem } from "./reportTreeItem";
import { ReportService } from "../../services/reportService";

export class LabInsightViewerReportProvider
  implements vscode.TreeDataProvider<ReportTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ReportTreeItem | undefined | null | void
  > = new vscode.EventEmitter<ReportTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ReportTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private reportService: ReportService;

  constructor() {
    // Passer une fonction de callback qui rafraîchira la vue lorsque le rapport est généré
    this.reportService = new ReportService(() => this.refresh());
  }

  getTreeItem(element: ReportTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(
    element?: ReportTreeItem
  ): Promise<ReportTreeItem[] | undefined> {
    if (!element) {
      return this.getReportTypeItems();
    }

    if (element.contextValue === "reportType") {
      return this.getReportsForType(element.label);
    }

    return undefined;
  }

  private async getReportTypeItems(): Promise<ReportTreeItem[]> {
    const reportTypes = await this.reportService.fetchReportTypes();
    return reportTypes.map(
      (type) =>
        new ReportTreeItem(
          type.toUpperCase(), // Le type de rapport (JSON, HTML, etc.)
          true,
          undefined,
          undefined,
          undefined,
          "reportType"
        )
    );
  }

  private async getReportsForType(type: string): Promise<ReportTreeItem[]> {
    const reports = await this.reportService.fetchReportsByType(
      type.toLowerCase()
    );

    return reports.map(
      (report) =>
        new ReportTreeItem(
          report.id,
          false,
          {
            command: "labinsightViewer.viewReportDetails",
            title: "View Report Details",
            arguments: [report],
          },
          report,
          undefined,
          "report"
        )
    );
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
