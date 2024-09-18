import * as vscode from "vscode";

export class TreeItem extends vscode.TreeItem {
  public workspacePath?: string; // Only for workspace items

  constructor(
    public readonly label: string,
    public readonly collapsible: boolean = false,
    public readonly commandId?: string,
    public readonly rule?: any, // The associated rule (optional)
    public readonly iconPath?: { light: string; dark: string } | string,
    public readonly contextValue?: string, // To identify the type of item
    workspacePath?: string // Path for workspace items
  ) {
    super(
      label,
      collapsible
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    // Assign the command if provided
    if (commandId) {
      this.command = {
        command: commandId,
        title: label,
      };
    }

    // Assign the icon if provided
    if (typeof iconPath === "string") {
      this.iconPath = iconPath;
    } else if (iconPath) {
      this.iconPath = iconPath;
    }

    // Assign contextValue for identification in getChildren
    if (contextValue) {
      this.contextValue = contextValue;
    }

    // Assign workspacePath if provided
    if (workspacePath) {
      this.workspacePath = workspacePath;
    }
  }
}
