// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { WorkspaceConfiguration } from "vscode";

enum FILE_TYPES {
  COMMAND = "Command",
  SUBSYSTEM = "Subsystem",
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  let disposable1 = vscode.commands.registerCommand(
    "frc-2024.generateCommand",
    () => {
      prepareFile(FILE_TYPES.COMMAND);
    }
  );

  let disposable2 = vscode.commands.registerCommand(
    "frc-2024.generateSubsystem",
    () => {
      prepareFile(FILE_TYPES.SUBSYSTEM);
    }
  );

  context.subscriptions.push(disposable1);
  context.subscriptions.push(disposable2);
}

async function prepareFile(fileType: FILE_TYPES) {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showInformationMessage("Please select a workspace!");
    return;
  }

  const config = vscode.workspace.getConfiguration("FRC");
  const fileName = await vscode.window
    .showInputBox({
      placeHolder: `${fileType} Name`,
    })
    .then((value) => capitalizeFirstLetter(value));

  if (fileName === undefined) {
    vscode.window.showInformationMessage(
      `Could not parse value ${fileName}, please enter a value.`
    );
    return;
  }

  const subName = fileName?.split(/(?=[A-Z])/);

  if (fileType === FILE_TYPES.COMMAND) {
    if (subName.length < 2) {
      vscode.window.showInformationMessage(
        `Could not parse value ${fileName}, please use camel case formatting.`
      );
      return;
    }
    prepareCommandFile(fileName, config, subName[0]);
  }

  prepareSubsystemFile(subName[0], config);
}

function prepareCommandFile(
  fileName: string | undefined,
  config: WorkspaceConfiguration,
  subsystemName: string
) {
  const fileDIR = config.get(
    `directory.${FILE_TYPES.COMMAND.toLowerCase()}s`
  ) as string;
  const subFileDIR = config.get(
    `directory.${FILE_TYPES.SUBSYSTEM.toLowerCase()}s`
  ) as string;
  const fileDIRSanitized = fileDIR.slice(-1) === "/" ? fileDIR : fileDIR + "/";
  const subFileDIRSanitized =
    subFileDIR.slice(-1) === "/" ? subFileDIR : subFileDIR + "/";

  vscode.window.showInformationMessage(
    "sub lastchar: " + subFileDIRSanitized.slice(-1)
  );

  const content =
    `package ${fileDIRSanitized
      .substring(1, fileDIRSanitized.lastIndexOf("/"))
      .replaceAll("/", ".")};\n\n` +
    `import edu.wpi.first.wpilibj2.command.${FILE_TYPES.COMMAND}Base;\n\n` +
    `import ${subFileDIRSanitized
      .substring(1, subFileDIRSanitized.lastIndexOf("/"))
      .replaceAll("/", ".")}.${subsystemName};\n\n` +
    `public class ${fileName} extends CommandBase{\n\n` +
    `\tprivate ${subsystemName} ${lowerFirstLetter(
      subsystemName
    )} = new ${subsystemName}();\n\n` +
    `\tpublic ${fileName}(){\n\n\t}\n}`;

  createFile(FILE_TYPES.COMMAND, fileName, fileDIRSanitized, content);
}

async function prepareSubsystemFile(
  fileName: string | undefined,
  config: WorkspaceConfiguration
) {
  const fileDIR = config.get(
    `directory.${FILE_TYPES.SUBSYSTEM.toLowerCase()}s`
  ) as string;
  const fileDIRSanitized = fileDIR.slice(-1) === "/" ? fileDIR : fileDIR + "/";
  const content =
    `package ${fileDIRSanitized
      .substring(1, fileDIRSanitized.lastIndexOf("/"))
      .replaceAll("/", ".")};\n\n` +
    `import edu.wpi.first.wpilibj2.command.${FILE_TYPES.SUBSYSTEM}Base;\n\n` +
    `public class ${fileName} extends SubsystemBase{\n\n` +
    `\tpublic ${fileName}(){\n\n\t}\n\n\t@Override\n\tpublic void periodic() {\n\t}\n}`;

  createFile(FILE_TYPES.SUBSYSTEM, fileName, fileDIRSanitized, content);
}

async function createFile(
  fileType: string,
  fileName: string | undefined,
  fileDIR: string,
  content: string
) {
  if (vscode.workspace.workspaceFolders) {
    const wsedit = new vscode.WorkspaceEdit();
    const fs = require("node:fs");
    const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const file = vscode.Uri.file(wsPath + fileDIR + fileName + ".java");

    vscode.window.showInformationMessage("lastchar: " + fileDIR.slice(-1));

    if (fs.existsSync(file.path)) {
      vscode.window.showInformationMessage(
        `${fileType} ${fileName} already exists!`
      );
      return;
    }

    wsedit.createFile(file, { ignoreIfExists: true });
    await vscode.workspace.applyEdit(wsedit);

    try {
      fs.writeFileSync(file.path, content);
      // file written successfully
      vscode.window.showInformationMessage(
        `${fileType} ${fileName} has been generated!`
      );
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        vscode.window.showInformationMessage(err.message);
      }
    }
  } else {
    vscode.window.showInformationMessage("WorkspaceFolders is null!");
  }
}

function capitalizeFirstLetter(val: string | undefined): string | undefined {
  return val ? val?.charAt(0).toUpperCase() + val?.slice(1) : undefined;
}

function lowerFirstLetter(val: string | undefined): string | undefined {
  return val ? val?.charAt(0).toLocaleLowerCase() + val?.slice(1) : undefined;
}

// This method is called when your extension is deactivated
export function deactivate() {}
