import * as vscode from "vscode";

export function openReportDetailsWebview(
  context: vscode.ExtensionContext,
  report: any
) {
  // Crée un panneau Webview pour afficher les détails du rapport
  const panel = vscode.window.createWebviewPanel(
    "reportDetails", // Identifiant du panneau
    `Report Details - ${report.id}`, // Titre du panneau
    vscode.ViewColumn.One, // Vue à afficher (vue principale)
    {
      enableScripts: true, // Permettre JavaScript dans la Webview
    }
  );

  // Contenu HTML de la Webview
  panel.webview.html = getReportDetailsHtml(report);
}

// Fonction pour générer le contenu HTML avec les détails du rapport
function getReportDetailsHtml(report: any): string {
  const reportData = JSON.stringify(report.data, null, 2);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report Details</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        pre {
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>Report Details</h1>
      <p><strong>Report ID:</strong> ${report.id}</p>
      <p><strong>Date:</strong> ${report.date}</p>
      <h2>Details:</h2>
      <pre>${reportData}</pre>
    </body>
    </html>
  `;
}
