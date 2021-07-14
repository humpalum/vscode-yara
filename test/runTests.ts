import * as path from 'path';
import { downloadAndUnzipVSCode, runTests } from 'vscode-test';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test runner script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './index');
    const testWorkspace = path.resolve(__dirname, 'rules');

    // Download VS Code, unzip it and run the integration test
    const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');
    await runTests({
        vscodeExecutablePath,
        extensionDevelopmentPath,
        extensionTestsPath,
        launchArgs: [testWorkspace, '--disable-extensions', '--disable-gpu']
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
