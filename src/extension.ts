// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable1 = vscode.commands.registerCommand(
    "frc-2024.generateSubsystem",
    async () => {
      const subsystemName = await vscode.window.showInputBox({
        placeHolder: "Subsystem Name",
      });
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user

      const wsedit = new vscode.WorkspaceEdit();
      if (vscode.workspace.workspaceFolders) {
        const fs = require("node:fs");
        const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath; // gets the path of the first workspace folder
        const SubsystemDIR = "/src/subsystems/";
        const filePath = vscode.Uri.file(
          wsPath + SubsystemDIR + subsystemName + ".java"
        );
        vscode.window.showInformationMessage(wsPath);
        wsedit.createFile(filePath, { ignoreIfExists: true });
        await vscode.workspace.applyEdit(wsedit);

        const content =
          `package ${SubsystemDIR};\n\n` +
          "import edu.wpi.first.wpilibj2.command.SubsystemBase;\n\n" +
          `public class ${subsystemName} extends SubsystemBase{\n\tpublic ${subsystemName}(){\n\n\t}\n\t@Override\n\tpublic void periodic() {\n\t}\n}`;

        try {
          fs.writeFileSync(filePath.path, content);
          // file written successfully
        } catch (err) {
          console.error(err);
          if (err instanceof Error) {
            vscode.window.showInformationMessage(err.message);
          }
        }
        vscode.window.showInformationMessage(
          `Subsystem ${subsystemName} has been generated!`
        );
      } else {
        vscode.window.showInformationMessage("WorkspaceFolders is null!");
      }
    }
  );

  
let disposable2 = vscode.commands.registerCommand(
    "frc-2024.generateCommand",
    async () => {
      const commandName = await vscode.window.showInputBox({
        placeHolder: "Command Name",
      });
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user

      const wsedit = new vscode.WorkspaceEdit();
      if (vscode.workspace.workspaceFolders) {
        const fs = require("node:fs");
        const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath; // gets the path of the first workspace folder
        const CommandDIR = "/src/commands/";
        const filePath = vscode.Uri.file(
          wsPath + CommandDIR + commandName + ".java"
        );
        vscode.window.showInformationMessage(wsPath);
        wsedit.createFile(filePath, { ignoreIfExists: true });
        await vscode.workspace.applyEdit(wsedit);

        const content =
          `package ${CommandDIR};\n\n` +
          "import edu.wpi.first.wpilibj2.command.CommandBase;\n\n" +
          `public class ${commandName} extends CommandBase{\n\tpublic ${commandName}(){\n\n\t}\n}`;

        try {
          fs.writeFileSync(filePath.path, content);
          // file written successfully
        } catch (err) {
          console.error(err);
          if (err instanceof Error) {
            vscode.window.showInformationMessage(err.message);
          }
        }
        vscode.window.showInformationMessage(
          `Command ${commandName} has been generated!`
        );
      } else {
        vscode.window.showInformationMessage("WorkspaceFolders is null!");
      }
    }
  );
  
  context.subscriptions.push(disposable1);
  context.subscriptions.push(disposable2);

}

// This method is called when your extension is deactivated
export function deactivate() {}
