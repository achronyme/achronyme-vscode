import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as os from 'os';
import * as tar from 'tar';
import AdmZip from 'adm-zip';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
const LSP_REPO = 'achronyme/achronyme-core';
const LSP_VERSION = '0.1.1';

function getPlatformInfo(): { platform: string; arch: string; archiveExt: string; binaryExt: string } {
    const platform = os.platform();
    const arch = os.arch();

    let platformName: string;
    let archName: string;
    let archiveExt: string;
    let binaryExt: string;

    switch (platform) {
        case 'win32':
            platformName = 'windows';
            archiveExt = '.zip';
            binaryExt = '.exe';
            break;
        case 'darwin':
            platformName = 'macos';
            archiveExt = '.tar.gz';
            binaryExt = '';
            break;
        case 'linux':
            platformName = 'linux';
            archiveExt = '.tar.gz';
            binaryExt = '';
            break;
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }

    switch (arch) {
        case 'x64':
            archName = 'x64';
            break;
        case 'arm64':
            archName = 'arm64';
            break;
        default:
            throw new Error(`Unsupported architecture: ${arch}`);
    }

    return { platform: platformName, arch: archName, archiveExt, binaryExt };
}

function getAssetName(): string {
    const { platform, arch, archiveExt } = getPlatformInfo();
    return `achronyme-lsp-${LSP_VERSION}-${platform}-${arch}${archiveExt}`;
}

function getServerDir(context: vscode.ExtensionContext): string {
    return path.join(context.globalStorageUri.fsPath, 'server');
}

function getServerBinaryPath(context: vscode.ExtensionContext): string {
    const { binaryExt } = getPlatformInfo();
    return path.join(getServerDir(context), `achronyme-lsp${binaryExt}`);
}

async function downloadFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const request = (urlString: string) => {
            https.get(urlString, { headers: { 'User-Agent': 'VSCode-Achronyme-Extension' } }, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Follow redirect
                    const redirectUrl = response.headers.location;
                    if (redirectUrl) {
                        request(redirectUrl);
                    } else {
                        reject(new Error('Redirect without location header'));
                    }
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                    return;
                }

                const chunks: Buffer[] = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            }).on('error', reject);
        };
        request(url);
    });
}

async function extractArchive(buffer: Buffer, destDir: string, archiveExt: string): Promise<void> {
    if (archiveExt === '.zip') {
        // Extract ZIP using adm-zip
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
            if (!entry.isDirectory) {
                const filePath = path.join(destDir, path.basename(entry.entryName));
                fs.writeFileSync(filePath, entry.getData());

                // Make executable on Unix (though unlikely for zip from Windows)
                if (os.platform() !== 'win32') {
                    fs.chmodSync(filePath, 0o755);
                }
            }
        }
    } else if (archiveExt === '.tar.gz') {
        // Extract tar.gz using tar library
        const tempTarPath = path.join(destDir, 'temp.tar.gz');
        fs.writeFileSync(tempTarPath, buffer);

        try {
            await tar.x({
                file: tempTarPath,
                cwd: destDir,
                strip: 1, // Strip leading directory component
            });

            // Make binary executable on Unix
            const { binaryExt } = getPlatformInfo();
            const binaryPath = path.join(destDir, `achronyme-lsp${binaryExt}`);
            if (fs.existsSync(binaryPath) && os.platform() !== 'win32') {
                fs.chmodSync(binaryPath, 0o755);
            }
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempTarPath)) {
                fs.unlinkSync(tempTarPath);
            }
        }
    } else {
        throw new Error(`Unsupported archive format: ${archiveExt}`);
    }
}

async function downloadLspServer(context: vscode.ExtensionContext): Promise<string | undefined> {
    const serverDir = getServerDir(context);
    const binaryPath = getServerBinaryPath(context);

    // Check if already downloaded
    if (fs.existsSync(binaryPath)) {
        return binaryPath;
    }

    const assetName = getAssetName();
    const downloadUrl = `https://github.com/${LSP_REPO}/releases/download/lsp-v${LSP_VERSION}/${assetName}`;

    const result = await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Achronyme',
            cancellable: false
        },
        async (progress) => {
            progress.report({ message: 'Downloading Language Server...' });

            try {
                // Create server directory
                if (!fs.existsSync(serverDir)) {
                    fs.mkdirSync(serverDir, { recursive: true });
                }

                // Download
                const buffer = await downloadFile(downloadUrl);

                progress.report({ message: 'Extracting Language Server...' });

                // Extract
                const { archiveExt } = getPlatformInfo();
                await extractArchive(buffer, serverDir, archiveExt);

                if (fs.existsSync(binaryPath)) {
                    vscode.window.showInformationMessage('Achronyme Language Server installed successfully!');
                    return binaryPath;
                } else {
                    throw new Error('Binary not found after extraction');
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to download Achronyme Language Server: ${error}. ` +
                    'You can manually download from GitHub releases and configure the path.'
                );
                return undefined;
            }
        }
    );

    return result;
}

function findServerPath(context: vscode.ExtensionContext): string | undefined {
    const config = vscode.workspace.getConfiguration('achronyme');
    const configuredPath = config.get<string>('lsp.serverPath');

    if (configuredPath && configuredPath.trim() !== '') {
        return configuredPath;
    }

    // Check downloaded server in global storage
    const downloadedPath = getServerBinaryPath(context);
    if (fs.existsSync(downloadedPath)) {
        return downloadedPath;
    }

    // Try to find bundled server in extension directory
    const { binaryExt } = getPlatformInfo();
    const bundledPath = path.join(context.extensionPath, 'server', `achronyme-lsp${binaryExt}`);
    if (fs.existsSync(bundledPath)) {
        return bundledPath;
    }

    // Not found - will need to download
    return undefined;
}

async function startLanguageServer(context: vscode.ExtensionContext, statusBarItem?: vscode.StatusBarItem) {
    const config = vscode.workspace.getConfiguration('achronyme');
    const lspEnabled = config.get<boolean>('lsp.enabled', true);

    if (!lspEnabled) {
        console.log('Achronyme LSP is disabled');
        if (statusBarItem) {
            statusBarItem.text = '$(circle-slash) Achronyme LSP';
            statusBarItem.tooltip = 'Achronyme Language Server is disabled';
        }
        return;
    }

    if (statusBarItem) {
        statusBarItem.text = '$(loading~spin) Achronyme LSP';
        statusBarItem.tooltip = 'Achronyme Language Server is starting...';
    }

    let serverPath = findServerPath(context);

    // If not found, offer to download
    if (!serverPath) {
        const choice = await vscode.window.showInformationMessage(
            'Achronyme Language Server not found. Would you like to download it?',
            'Download',
            'Configure Path',
            'Disable LSP'
        );

        if (choice === 'Download') {
            serverPath = await downloadLspServer(context);
        } else if (choice === 'Configure Path') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'achronyme.lsp.serverPath');
            return;
        } else if (choice === 'Disable LSP') {
            await config.update('lsp.enabled', false, vscode.ConfigurationTarget.Global);
            return;
        } else {
            return;
        }
    }

    if (!serverPath) {
        vscode.window.showWarningMessage(
            'Achronyme LSP server not available. Some features will be unavailable.'
        );
        if (statusBarItem) {
            statusBarItem.text = '$(warning) Achronyme LSP';
            statusBarItem.tooltip = 'Achronyme Language Server not available';
        }
        return;
    }

    const debugMode = config.get<boolean>('lsp.debug', false);
    const args = ['--stdio'];
    if (debugMode) {
        args.push('--debug');
    }

    const serverOptions: ServerOptions = {
        run: {
            command: serverPath,
            args: args,
            transport: TransportKind.stdio
        },
        debug: {
            command: serverPath,
            args: ['--stdio', '--debug'],
            transport: TransportKind.stdio
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'soc' }
        ],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{soc,ach}')
        },
        outputChannelName: 'Achronyme Language Server',
    };

    client = new LanguageClient(
        'achronymeLSP',
        'Achronyme Language Server',
        serverOptions,
        clientOptions
    );

    try {
        await client.start();
        console.log('Achronyme Language Server started successfully');
        if (statusBarItem) {
            statusBarItem.text = '$(check) Achronyme LSP';
            statusBarItem.tooltip = 'Achronyme Language Server is active\n\nFeatures:\n• Code Completion (151 items)\n• Signature Help (56+ signatures)\n• Code Formatting\n• Diagnostics\n• Navigation (Go to Definition, Find References)\n• Hover Information\n• Document Symbols';
        }
        vscode.window.showInformationMessage('Achronyme Language Server is ready!');
    } catch (error) {
        console.error('Failed to start Achronyme Language Server:', error);
        if (statusBarItem) {
            statusBarItem.text = '$(error) Achronyme LSP';
            statusBarItem.tooltip = `Achronyme Language Server failed to start: ${error}`;
        }
        vscode.window.showErrorMessage(
            `Failed to start Achronyme Language Server: ${error}. ` +
            'Check that achronyme-lsp is installed and accessible.'
        );
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Achronyme SOC extension activated');

    // Status bar item to show LSP status
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(loading~spin) Achronyme LSP';
    statusBarItem.tooltip = 'Achronyme Language Server is starting...';
    statusBarItem.command = 'achronyme.restartServer';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Start Language Server
    startLanguageServer(context, statusBarItem);

    // Command to restart LSP server
    const restartCommand = vscode.commands.registerCommand('achronyme.restartServer', async () => {
        if (client) {
            await client.stop();
        }
        await startLanguageServer(context, statusBarItem);
    });

    context.subscriptions.push(restartCommand);
}

export async function deactivate(): Promise<void> {
    if (client) {
        await client.stop();
    }
}
