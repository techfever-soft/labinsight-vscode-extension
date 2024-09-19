import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export class ReportService {
  private onReportGeneratedCallback: () => void;

  constructor(onReportGeneratedCallback: () => void) {
    this.onReportGeneratedCallback = onReportGeneratedCallback;
  }

  // Simule l'analyse et appelle le callback lorsqu'elle est terminée
  public async generateReport(cliPath: string, workspacePath: string, analysisType: string) {
    return new Promise<void>((resolve, reject) => {
      // Exécuter la commande d'analyse réelle
      exec(
        `node ${cliPath} analyze -t ${analysisType} -f json`,
        { cwd: workspacePath },
        (error, stdout, stderr) => {
          if (error) {
            reject(`Error during analysis: ${error}`);
          } else {
            // Quand l'analyse est terminée, invoquer le callback pour rafraîchir la vue
            this.onReportGeneratedCallback();
            resolve();
          }
        }
      );
    });
  }

  // Méthode existante pour récupérer les types de rapports disponibles
  async fetchReportTypes(): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage("No workspace folders are open.");
      return [];
    }

    const selectedWorkspace = workspaceFolders[0];
    const reportFolderPath = path.join(selectedWorkspace.uri.fsPath, "reports");

    if (fs.existsSync(reportFolderPath)) {
      const reportTypes = fs
        .readdirSync(reportFolderPath)
        .filter((file) =>
          fs.statSync(path.join(reportFolderPath, file)).isDirectory()
        );
      return reportTypes;
    } else {
      vscode.window.showErrorMessage("Report folder not found.");
      return [];
    }
  }

  async fetchReportsByType(type: string): Promise<any[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage("No workspace folders are open.");
      return [];
    }

    const selectedWorkspace = workspaceFolders[0];
    const reportFolderPath = path.join(
      selectedWorkspace.uri.fsPath,
      "reports",
      type
    );

    if (fs.existsSync(reportFolderPath)) {
      const reportFiles = fs
        .readdirSync(reportFolderPath)
        .filter((file) => file.endsWith(".json"));

      return reportFiles.map((file) => {
        const reportFilePath = path.join(reportFolderPath, file);
        const reportData = fs.readFileSync(reportFilePath, "utf-8");

        return {
          id: file, // Nom du fichier (peut contenir un ID ou un timestamp)
          data: JSON.parse(reportData),
          date: fs.statSync(reportFilePath).mtime.toLocaleString(),
        };
      });
    } else {
      vscode.window.showErrorMessage(`No ${type} reports found.`);
      return [];
    }
  }
}
