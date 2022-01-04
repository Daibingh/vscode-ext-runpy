// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as glob from 'glob';
var hjson = require('hjson');


let pythonPath = '';

function readSettings() {
    const workdir = getContexInfo().workdir;
    const config = fs.readFileSync(path.join(workdir, '.vscode', 'settings.json'), {encoding: 'utf-8'});
    const obj = hjson.parse(config);
    return obj;
}

function getContexInfo() {
    let info = {
        'workdir': '',
        'doc': '',
        'row': -1,
        'col': -1
    };
    if (vscode.workspace.workspaceFolders) {
        info.workdir = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    if (vscode.window.activeTextEditor) {
        info.doc = vscode.window.activeTextEditor.document.fileName;
        info.row = vscode.window.activeTextEditor.selection.active.line; 
        info.col = vscode.window.activeTextEditor.selection.active.character; 
    }
    return info;
}

function formatCMDArgs(info: any) {
    return `--workdir "${info.workdir}" --doc "${info.doc}" --row ${info.row} --col ${info.col}`;
}

function getScriptNames(workdir: string) {
    return glob.sync(path.join(workdir, '.vscode', 'scripts', '*.py'));
}

function callback() {
    let info = getContexInfo();
    console.log(info.workdir);
    console.log(info.doc);
    console.log(info.row);
    console.log(info.col);

    let items: string[] = getScriptNames(info.workdir);
    vscode.window.showQuickPick(items).then((pyfile) => {
        console.log(pyfile);
        const args = formatCMDArgs(info);
        const cmd = `${pythonPath}/python ${pyfile} ${args}`;
        console.log(cmd);
        vscode.window.showInformationMessage(`running ${pyfile} ...`);
        try {
            let stdout: string = child_process.execSync(cmd).toString();
            console.log(stdout);
            vscode.window.showInformationMessage(stdout);
        } catch (err) {
            console.log(`run ${pyfile} failed!`);
            vscode.window.showInformationMessage(`run ${pyfile} failed!`);
        }
    });
}

export function activate(context: vscode.ExtensionContext) {
    
    console.log('Congratulations, your extension "runpy" is now active!');
    
    const path = readSettings().pythonPath;
    if (path !== null && path !== undefined && typeof(path) === 'string') {
        pythonPath = path;
        vscode.window.showInformationMessage(`read pythonPath from .vscode/settings.json successfully, and set pythonPath to ${path}!`);
    } else {
        vscode.window.showInformationMessage(`read pythonPath from .vscode/settings.json failed!`);
    }

    let disposable = vscode.commands.registerCommand('runpy.runpy', callback);

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
