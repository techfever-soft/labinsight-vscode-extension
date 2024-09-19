import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { RuleTreeItem } from "./ruleTreeItem";

export class LabinsightViewerRuleProvider
  implements vscode.TreeDataProvider<RuleTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    RuleTreeItem | undefined | null | void
  > = new vscode.EventEmitter<RuleTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    RuleTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  public labinsightConfigs: { [workspace: string]: any } = {}; // Store config per workspace
  public labinsightFiles: { [workspace: string]: string } = {}; // Store file paths per workspace

  constructor() {
    this.scanAllWorkspaces();
  }

  getTreeItem(element: RuleTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RuleTreeItem): vscode.ProviderResult<RuleTreeItem[]> {
    // If no element is provided, display the main menu
    if (!element) {
      return this.getMainMenuItems();
    }

    // Handle "Back to Menu" button
    if (element.contextValue === "backToMenu") {
      // Refresh to show the main menu again
      this.showMainMenu();
      return [];
    }

    // If the element is a workspace, display its Labinsight rules or a message if none
    if (element.contextValue === "workspace") {
      const workspacePath = element.workspacePath;
      const config = this.labinsightConfigs[workspacePath as string];
      if (config) {
        const ruleItems = this.parseLabinsightConfig(config.rules);
        return ruleItems.length > 0
          ? ruleItems
          : [new RuleTreeItem("No Labinsight rules found", false)];
      } else {
        return [new RuleTreeItem("No .labinsight file found", false)];
      }
    }

    // If the element is a rule, display its details
    if (element.contextValue === "rule") {
      return this.getRuleDetails(element.rule);
    }

    // If the element is an options node, display the options
    if (element.contextValue === "options") {
      return this.getRuleOptions(element.rule);
    }

    return [];
  }

  // Method to retrieve main menu items, including "Back to Menu" and workspaces
  private getMainMenuItems(): RuleTreeItem[] {
    const items: RuleTreeItem[] = [];

    // Add all workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      items.push(new RuleTreeItem("No workspaces available", false));
      return items;
    }

    workspaceFolders.forEach((folder) => {
      const workspacePath = folder.uri.fsPath;
      const workspaceItem = new RuleTreeItem(
        path.basename(workspacePath),
        true,
        undefined,
        undefined,
        undefined,
        "workspace", // contextValue to identify workspace items
        workspacePath // custom property to store workspace path
      );
      items.push(workspaceItem);
    });

    return items;
  }

  // Method to parse Labinsight config and create rule TreeItems
  private parseLabinsightConfig(rules: any): RuleTreeItem[] {
    const ruleItems: RuleTreeItem[] = [];
    for (const ruleName of Object.keys(rules)) {
      const rule = rules[ruleName];
      const ruleItem = new RuleTreeItem(
        ruleName,
        true,
        undefined,
        rule,
        {
          light: path.join(
            __filename,
            "..",
            "..",
            "resources",
            "logo",
            this.getRuleIcon(ruleName) + ".svg"
          ),
          dark: path.join(
            __filename,
            "..",
            "..",
            "resources",
            "logo",
            this.getRuleIcon(ruleName) + ".svg"
          ),
        },
        "rule" // contextValue to identify rule items
      );
      ruleItems.push(ruleItem);
    }
    return ruleItems;
  }

  // Method to get details of a specific rule
  private getRuleDetails(rule: any): RuleTreeItem[] {
    const detailItems: RuleTreeItem[] = [];

    // Add "Severity" as a non-collapsible TreeItem
    detailItems.push(new RuleTreeItem(`Severity: ${rule.severity}`, false));

    // Add "Options" as an expandable TreeItem if options exist
    if (rule.options) {
      const optionsTreeItem = new RuleTreeItem(
        "Options",
        true,
        undefined,
        rule,
        undefined,
        "options"
      );
      detailItems.push(optionsTreeItem);
    }

    return detailItems;
  }

  // Method to get options of a rule
  private getRuleOptions(rule: any): RuleTreeItem[] {
    const optionItems: RuleTreeItem[] = [];
    for (const optionName of Object.keys(rule.options)) {
      const optionValue = rule.options[optionName];
      const optionItem = new RuleTreeItem(
        `${optionName}: ${optionValue}`,
        false,
        undefined,
        undefined,
        undefined,
        "option" // contextValue to identify option items
      );
      optionItems.push(optionItem);
    }
    return optionItems;
  }

  private getRuleIcon(ruleName: string) {
    const extension = ruleName.startsWith("py")
      ? "python"
      : ruleName.startsWith("js")
      ? "javascript"
      : ruleName.startsWith("ts")
      ? "typescript"
      : undefined;

    return extension;
  }

  // Method to load Labinsight config for a specific workspace
  public loadLabinsightConfig(workspacePath: string, filePath: string) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      this.labinsightConfigs[workspacePath] = JSON.parse(content);
    } else {
      this.labinsightConfigs[workspacePath] = null;
    }
  }

  // Recursive method to find .labinsight file in a directory
  public findLabinsightFile(
    dir: string,
    callback: (filePath: string | null) => void
  ) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.findLabinsightFile(filePath, callback);
      } else if (file === ".labinsight") {
        callback(filePath);
        return;
      }
    }

    callback(null);
  }

  // Method to scan all workspaces for .labinsight files
  public scanAllWorkspaces() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      workspaceFolders.forEach((folder) => {
        const workspacePath = folder.uri.fsPath;
        this.findLabinsightFile(workspacePath, (filePath) => {
          if (filePath) {
            this.labinsightFiles[workspacePath] = filePath;
            this.loadLabinsightConfig(workspacePath, filePath);
          } else {
            this.labinsightConfigs[workspacePath] = null;
          }
          this.refresh();
        });
      });
    }
  }

  // Method to show the main menu (workspace list)
  public showMainMenu() {
    // Simply refresh to show the main menu
    this.refresh();
  }

  // Method to refresh the TreeView
  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
