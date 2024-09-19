import * as vscode from "vscode";

export class ReportTreeItem extends vscode.TreeItem {
  public workspacePath?: string; // Chemin du workspace
  public reportId?: string; // ID du rapport

  constructor(
    public readonly label: string,
    public readonly collapsible: boolean = false,
    public readonly command?: {
      command: string;
      title: string;
      arguments?: any[];
    },
    public readonly report?: any, // Données associées au rapport
    public readonly iconPath?: { light: string; dark: string } | string,
    public readonly contextValue?: string, // Pour identifier le type d'élément
    workspacePath?: string, // Chemin pour les éléments workspace
    reportId?: string // ID du rapport pour les éléments de rapport
  ) {
    super(
      label,
      collapsible
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    // Assign the command if provided
    if (command) {
      this.command = command;
    }

    // Assign the icon if provided
    if (typeof iconPath === "string") {
      this.iconPath = iconPath;
    } else if (iconPath) {
      this.iconPath = iconPath;
    }

    // Set contextValue for identification in getChildren
    if (contextValue) {
      this.contextValue = contextValue;
    }

    // Set workspacePath if provided
    if (workspacePath) {
      this.workspacePath = workspacePath;
    }

    // Set reportId if provided (utilisé pour afficher l'ID du rapport)
    if (reportId) {
      this.reportId = reportId;
    }

    // Ajouter une description si c'est un rapport, avec une date
    if (report && report.date) {
      this.description = `${report.date}`;
    }
  }

  // Fonction pour générer une description à partir des informations du rapport
  public static createReportDescription(report: any): string {
    const reportDate = report?.date || "Unknown Date";
    return `Report Date: ${reportDate}`;
  }
}
