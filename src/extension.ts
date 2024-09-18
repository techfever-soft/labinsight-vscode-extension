import * as vscode from "vscode";
import { LabinsightViewerProvider } from "./provider";
import { TreeItem } from "./treeItem";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new LabinsightViewerProvider();
  vscode.window.createTreeView("labinsightViewerView", {
    treeDataProvider,
  });

  // Enregistrer les commandes
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "labinsightViewer.scanForLabinsight",
      () => {
        vscode.window.showInformationMessage(
          "Scanning all workspaces for .labinsight files..."
        );
        treeDataProvider.scanAllWorkspaces();
      }
    ),
    vscode.commands.registerCommand("labinsightViewer.refresh", () => {
      treeDataProvider.refresh();
    }),
    vscode.commands.registerCommand("labinsightViewer.goBackToMenu", () => {
      treeDataProvider.showMainMenu();
    }),
    vscode.commands.registerCommand(
      "labinsightViewer.initializeLabinsight",
      () => {
        // Implémenter la logique d'initialisation si nécessaire
        vscode.window.showInformationMessage(
          "Initialize Labinsight functionality not implemented yet."
        );
      }
    ),
    vscode.commands.registerCommand(
      "labinsightViewer.refreshWorkspace",
      (treeItem: TreeItem) => {
        if (treeItem.workspacePath) {
          vscode.window.showInformationMessage(
            `Refreshing Labinsight for workspace: ${path.basename(
              treeItem.workspacePath
            )}`
          );
          treeDataProvider.loadLabinsightConfig(
            treeItem.workspacePath,
            treeDataProvider.labinsightFiles[treeItem.workspacePath]
          );
          treeDataProvider.refresh();
        }
      }
    ),
    // Enregistrer la nouvelle commande pour créer un fichier Labinsight
    vscode.commands.registerCommand(
      "labinsightViewer.createLabinsightFile",
      async () => {
        await createLabinsightFile(treeDataProvider);
      }
    )
  );
}

export function deactivate() {}

async function createLabinsightFile(provider: LabinsightViewerProvider) {
  try {
    // Récupérer les workspaces disponibles
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage("No workspace folders are open.");
      return;
    }

    // Si un seul workspace, le sélectionner automatiquement
    let selectedWorkspace: vscode.WorkspaceFolder | undefined;
    if (workspaceFolders.length === 1) {
      selectedWorkspace = workspaceFolders[0];
    } else {
      // Si plusieurs workspaces, demander à l'utilisateur de sélectionner
      selectedWorkspace = await vscode.window.showWorkspaceFolderPick({
        placeHolder: "Select a workspace to create the Labinsight file",
      });
      if (!selectedWorkspace) {
        vscode.window.showWarningMessage("No workspace selected.");
        return;
      }
    }

    // Définir le nom de fichier fixe
    const fileName = ".labinsight";

    // Définir le chemin complet du fichier
    const filePath = path.join(selectedWorkspace.uri.fsPath, fileName);

    // Vérifier si le fichier existe déjà
    if (fs.existsSync(filePath)) {
      const overwrite = await vscode.window.showWarningMessage(
        `File "${fileName}" already exists in the workspace. Do you want to overwrite it?`,
        { modal: true },
        "Yes",
        "No"
      );
      if (overwrite !== "Yes") {
        vscode.window.showInformationMessage("Operation cancelled.");
        return;
      }
    }

    // Créer un contenu de base pour le fichier Labinsight
    const initialContent = {
      $schema: "https://lab-insight.web.app/config.schema.json",
      version: 2,
      projectName: path.basename(selectedWorkspace.uri.fsPath),
      projectType: "none",
      engine: "none",
      environment: "development",
      linting: "none",
      ignoredDirectories: [
        "node_modules",
        ".git",
        "dist",
        "reports",
        "rules",
        "build",
        "out",
        "temp",
        "tmp",
        "reports",
        "logs",
      ],
      ignoredFiles: [
        ".labinsight",
        ".gitignore",
        ".npmignore",
        ".prettierignore",
        ".eslintignore",
        "package-lock.json",
        "package.json",
        "tsconfig.json",
        "README.md",
        "CHANGELOG.md",
        "LICENCE",
        "ROADMAP.md",
        "gulpfile.js",
        "webpack.config.js",
        "rollup.config.js",
        "jest.config.js",
        "gruntfile.js",
      ],
      customRules: {},
      rules: {
        "py.require-function-description": {
          severity: "error",
        },
        "py.require-class-description": {
          severity: "error",
        },
        "py.casing-class": {
          severity: "error",
          options: {
            casing: "PascalCase",
          },
        },
        "py.casing-parameter": {
          severity: "error",
          options: {
            casing: "snakeCase",
          },
        },
        "py.casing-method": {
          severity: "error",
          options: {
            casing: "snakeCase",
          },
        },
        "py.casing-property": {
          severity: "error",
          options: {
            casing: "snakeCase",
          },
        },
        "py.casing-function": {
          severity: "error",
          options: {
            casing: "snakeCase",
          },
        },
        "py.max-file-lines": {
          severity: "error",
          options: {
            limit: 100,
          },
        },
        "py.max-function-lines": {
          severity: "error",
          options: {
            limit: 10,
          },
        },
        "py.max-method-lines": {
          severity: "error",
          options: {
            limit: 10,
          },
        },
        "js.max-lines": {
          severity: "error",
          options: {
            limit: 100,
          },
        },
        "js.max-method-lines": {
          severity: "error",
          options: {
            limit: 25,
          },
        },
        "js.max-function-lines": {
          severity: "error",
          options: {
            limit: 25,
          },
        },
        "js.max-array-length": {
          severity: "error",
          options: {
            limit: 50,
          },
        },
        "js.require-method-description": {
          severity: "error",
        },
        "js.require-function-description": {
          severity: "error",
        },
        "js.require-try-catch": {
          severity: "error",
        },
        "js.casing-class": {
          severity: "error",
          options: {
            casing: "pascalCase",
          },
        },
        "js.casing-parameter": {
          severity: "error",
          options: {
            casing: "camelCase",
          },
        },
        "js.casing-method": {
          severity: "error",
          options: {
            casing: "camelCase",
          },
        },
        "js.casing-property": {
          severity: "error",
          options: {
            casing: "camelCase",
          },
        },
        "ts.max-file-lines": {
          severity: "error",
          options: {
            limit: 100,
          },
        },
        "ts.max-class-lines": {
          severity: "error",
          options: {
            limit: 50,
          },
        },
        "ts.max-method-lines": {
          severity: "error",
          options: {
            limit: 10,
          },
        },
        "ts.max-function-lines": {
          severity: "error",
          options: {
            limit: 10,
          },
        },
        "ts.max-interface-lines": {
          severity: "error",
          options: {
            limit: 10,
          },
        },
        "ts.max-enum-lines": {
          severity: "error",
          options: {
            limit: 10,
          },
        },
        "ts.max-type-lines": {
          severity: "error",
          options: {
            limit: 10,
          },
        },
        "ts.max-array-length": {
          severity: "error",
          options: {
            limit: 50,
          },
        },
        "ts.require-function-description": {
          severity: "error",
        },
        "ts.require-method-description": {
          severity: "error",
        },
        "ts.require-class-description": {
          severity: "error",
        },
        "ts.require-interface-description": {
          severity: "error",
        },
        "ts.require-try-catch": {
          severity: "error",
        },
        "ts.casing-function": {
          severity: "error",
          options: {
            casing: "camelCase",
          },
        },
        "ts.casing-class": {
          severity: "error",
          options: {
            casing: "pascalCase",
          },
        },
        "ts.casing-parameter": {
          severity: "error",
          options: {
            casing: "camelCase",
          },
        },
        "ts.casing-method": {
          severity: "error",
          options: {
            casing: "camelCase",
          },
        },
        "ts.casing-property": {
          severity: "error",
          options: {
            casing: "camelCase",
          },
        },
        "ts.casing-type": {
          severity: "error",
          options: {
            casing: "pascalCase",
          },
        },
        "ts.casing-interface": {
          severity: "error",
          options: {
            casing: "pascalCase",
          },
        },
        "ts.casing-enum": {
          severity: "error",
          options: {
            casing: "pascalCase",
          },
        },
      },
    };

    // Écrire le fichier
    fs.writeFileSync(
      filePath,
      JSON.stringify(initialContent, null, 2),
      "utf-8"
    );
    vscode.window.showInformationMessage(
      `Labinsight file "${fileName}" created successfully.`
    );

    // Ouvrir le fichier dans l'éditeur
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    // Actualiser le TreeView pour refléter le nouveau fichier
    provider.scanAllWorkspaces();
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to create Labinsight file: ${error}`
    );
  }
}
