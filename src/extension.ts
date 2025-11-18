import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as os from 'os';
import * as zlib from 'zlib';
import { execSync } from 'child_process';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
const LSP_REPO = 'achronyme/achronyme-core';
const LSP_VERSION = '0.1.0';

function getPlatformInfo(): { platform: string; arch: string; ext: string } {
    const platform = os.platform();
    const arch = os.arch();

    let platformName: string;
    let archName: string;
    let ext: string;

    switch (platform) {
        case 'win32':
            platformName = 'windows';
            ext = '.exe';
            break;
        case 'darwin':
            platformName = 'macos';
            ext = '';
            break;
        case 'linux':
            platformName = 'linux';
            ext = '';
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

    return { platform: platformName, arch: archName, ext };
}

function getAssetName(): string {
    const { platform, arch } = getPlatformInfo();
    return `achronyme-lsp-${LSP_VERSION}-${platform}-${arch}.tar.gz`;
}

function getServerDir(context: vscode.ExtensionContext): string {
    return path.join(context.globalStorageUri.fsPath, 'server');
}

function getServerBinaryPath(context: vscode.ExtensionContext): string {
    const { ext } = getPlatformInfo();
    return path.join(getServerDir(context), `achronyme-lsp${ext}`);
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

async function extractTarGz(buffer: Buffer, destDir: string): Promise<void> {
    // Simple tar.gz extraction using Node.js streams
    return new Promise((resolve, reject) => {
        const gunzip = zlib.createGunzip();

        gunzip.on('error', reject);

        // Simple tar parser - extracts single file
        let headerBuffer = Buffer.alloc(0);
        let fileSize = 0;
        let fileName = '';
        let fileData = Buffer.alloc(0);
        let state: 'header' | 'data' | 'padding' = 'header';
        let bytesRemaining = 0;

        gunzip.on('data', (chunk: Buffer) => {
            let offset = 0;

            while (offset < chunk.length) {
                if (state === 'header') {
                    const needed = 512 - headerBuffer.length;
                    const available = chunk.length - offset;
                    const toCopy = Math.min(needed, available);

                    headerBuffer = Buffer.concat([headerBuffer, chunk.slice(offset, offset + toCopy)]);
                    offset += toCopy;

                    if (headerBuffer.length === 512) {
                        // Parse tar header
                        if (headerBuffer[0] === 0) {
                            // End of archive
                            return;
                        }

                        fileName = headerBuffer.slice(0, 100).toString('utf8').replace(/\0/g, '').trim();
                        const sizeStr = headerBuffer.slice(124, 136).toString('utf8').replace(/\0/g, '').trim();
                        fileSize = parseInt(sizeStr, 8);

                        if (fileName && fileSize > 0 && !fileName.endsWith('/')) {
                            state = 'data';
                            bytesRemaining = fileSize;
                            fileData = Buffer.alloc(0);
                        } else {
                            // Skip directory or empty entry
                            headerBuffer = Buffer.alloc(0);
                        }
                    }
                } else if (state === 'data') {
                    const available = chunk.length - offset;
                    const toCopy = Math.min(bytesRemaining, available);

                    fileData = Buffer.concat([fileData, chunk.slice(offset, offset + toCopy)]);
                    offset += toCopy;
                    bytesRemaining -= toCopy;

                    if (bytesRemaining === 0) {
                        // Write file
                        const filePath = path.join(destDir, path.basename(fileName));
                        fs.writeFileSync(filePath, fileData);

                        // Make executable on Unix
                        if (os.platform() !== 'win32') {
                            fs.chmodSync(filePath, 0o755);
                        }

                        // Skip padding to 512-byte boundary
                        const padding = (512 - (fileSize % 512)) % 512;
                        state = 'padding';
                        bytesRemaining = padding;
                    }
                } else if (state === 'padding') {
                    const available = chunk.length - offset;
                    const toSkip = Math.min(bytesRemaining, available);
                    offset += toSkip;
                    bytesRemaining -= toSkip;

                    if (bytesRemaining === 0) {
                        state = 'header';
                        headerBuffer = Buffer.alloc(0);
                    }
                }
            }
        });

        gunzip.on('end', resolve);
        gunzip.end(buffer);
    });
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
                await extractTarGz(buffer, serverDir);

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
    const { ext } = getPlatformInfo();
    const bundledPath = path.join(context.extensionPath, 'server', `achronyme-lsp${ext}`);
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
