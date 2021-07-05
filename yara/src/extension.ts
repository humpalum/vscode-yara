"use strict";

import * as vscode from "vscode";
import { configSection, debug, setDebugLogState } from "./configuration";
import { log } from "./helpers";
import * as helpers from "./helpers";
import { YaraCompletionItemProvider } from "./completionProvider";
import { YaraDefinitionProvider } from "./definitionProvider";
import { YaraReferenceProvider } from "./referenceProvider";
import { YaraSnippetCompletionItemProvider } from "./snippetProvider";
import { YaraHexStringHoverProvider } from "./hoverProvider";


function enableModuleCompletion(context: vscode.ExtensionContext, YARA: vscode.DocumentSelector) {
    const completionDisposable: vscode.Disposable = vscode.languages.registerCompletionItemProvider(YARA, new YaraCompletionItemProvider(), '.');
    if (debug) { log("Registered module completion provider"); }
    context.subscriptions.push(completionDisposable);
}

export function activate(context: vscode.ExtensionContext): void {
    // clear output channel and set up appropriate level of logging
    helpers.output.clear();
    log("Activating YARA extension");
    setDebugLogState();
    // register all the different providers for the extension
    const YARA: vscode.DocumentSelector = { language: "yara", scheme: "file" };
    const definitionDisposable: vscode.Disposable = vscode.languages.registerDefinitionProvider(YARA, new YaraDefinitionProvider());
    if (debug) { log("Registered definition provider"); }
    context.subscriptions.push(definitionDisposable);
    const referenceDisposable: vscode.Disposable = vscode.languages.registerReferenceProvider(YARA, new YaraReferenceProvider());
    if (debug) { log("Registered reference provider"); }
    context.subscriptions.push(referenceDisposable);
    const snippetsDisposable: vscode.Disposable = vscode.languages.registerCompletionItemProvider(YARA, new YaraSnippetCompletionItemProvider());
    if (debug) { log("Registered snippet provider"); }
    context.subscriptions.push(snippetsDisposable);
    const hoverDisposable: vscode.Disposable = vscode.languages.registerHoverProvider(YARA, new YaraHexStringHoverProvider());
    if (debug) { log("Registered hover provider"); }
    context.subscriptions.push(hoverDisposable);
    // watch configuration for changes to update log level
    const configWatcher: vscode.Disposable = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration(configSection)) {
            setDebugLogState();
        }
    });
    context.subscriptions.push(configWatcher);
    if (debug) { log('Registered configuration watcher'); }
    // check if this is a trusted workspace and watch for changes in it
    if (vscode.workspace.isTrusted) {
        enableModuleCompletion(context, YARA);
    }
    else {
        const trustWatcher: vscode.Disposable = vscode.workspace.onDidGrantWorkspaceTrust(() => {
            enableModuleCompletion(context, YARA);
        });
        context.subscriptions.push(trustWatcher);
        if (debug) { log('Registered workspace trust watcher'); }
    }
}

export function deactivate(context: vscode.ExtensionContext): void {
    log("Deactivating YARA extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
}
