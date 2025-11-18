import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as os from 'os';
import * as tar from 'tar';
import * as child_process from 'child_process';
import AdmZip from 'adm-zip';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
    ErrorAction,
    CloseAction,
    StreamInfo
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let outputChannel: vscode.OutputChannel;
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
    outputChannel.appendLine(`[Download] Starting download from: ${url}`);
    return new Promise((resolve, reject) => {
        const request = (urlString: string) => {
            https.get(urlString, { headers: { 'User-Agent': 'VSCode-Achronyme-Extension' } }, (response) => {
                outputChannel.appendLine(`[Download] Response status: ${response.statusCode}`);
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Follow redirect
                    const redirectUrl = response.headers.location;
                    if (redirectUrl) {
                        outputChannel.appendLine(`[Download] Following redirect to: ${redirectUrl}`);
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
                let downloadedBytes = 0;
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                    downloadedBytes += chunk.length;
                });
                response.on('end', () => {
                    outputChannel.appendLine(`[Download] Download complete: ${downloadedBytes} bytes`);
                    resolve(Buffer.concat(chunks));
                });
                response.on('error', (err) => {
                    outputChannel.appendLine(`[Download] Error: ${err.message}`);
                    reject(err);
                });
            }).on('error', reject);
        };
        request(url);
    });
}

async function extractArchive(buffer: Buffer, destDir: string, archiveExt: string): Promise<void> {
    outputChannel.appendLine(`[Extract] Starting extraction to: ${destDir}`);
    outputChannel.appendLine(`[Extract] Archive type: ${archiveExt}`);

    if (archiveExt === '.zip') {
        // Extract ZIP using adm-zip
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();
        outputChannel.appendLine(`[Extract] Found ${zipEntries.length} entries in ZIP`);

        for (const entry of zipEntries) {
            if (!entry.isDirectory) {
                const filePath = path.join(destDir, path.basename(entry.entryName));
                outputChannel.appendLine(`[Extract] Extracting file: ${entry.entryName} -> ${filePath}`);
                fs.writeFileSync(filePath, entry.getData());

                // Make executable on Unix (though unlikely for zip from Windows)
                if (os.platform() !== 'win32') {
                    fs.chmodSync(filePath, 0o755);
                    outputChannel.appendLine(`[Extract] Set executable permissions on: ${filePath}`);
                }
            }
        }
    } else if (archiveExt === '.tar.gz') {
        // Extract tar.gz using tar library
        const tempTarPath = path.join(destDir, 'temp.tar.gz');
        outputChannel.appendLine(`[Extract] Writing temporary tar.gz to: ${tempTarPath}`);
        fs.writeFileSync(tempTarPath, buffer);

        try {
            outputChannel.appendLine(`[Extract] Extracting tar.gz with strip=0`);
            await tar.x({
                file: tempTarPath,
                cwd: destDir,
                strip: 0, // No leading directory - binary is at root
            });
            outputChannel.appendLine(`[Extract] Tar extraction complete`);

            // Make binary executable on Unix
            const { binaryExt } = getPlatformInfo();
            const binaryPath = path.join(destDir, `achronyme-lsp${binaryExt}`);
            if (fs.existsSync(binaryPath)) {
                outputChannel.appendLine(`[Extract] Binary found at: ${binaryPath}`);
                if (os.platform() !== 'win32') {
                    fs.chmodSync(binaryPath, 0o755);
                    outputChannel.appendLine(`[Extract] Set executable permissions on: ${binaryPath}`);
                }
            } else {
                outputChannel.appendLine(`[Extract] WARNING: Binary not found at: ${binaryPath}`);
                // List files in directory for debugging
                const files = fs.readdirSync(destDir);
                outputChannel.appendLine(`[Extract] Files in ${destDir}: ${files.join(', ')}`);
            }
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempTarPath)) {
                fs.unlinkSync(tempTarPath);
                outputChannel.appendLine(`[Extract] Cleaned up temporary file`);
            }
        }
    } else {
        throw new Error(`Unsupported archive format: ${archiveExt}`);
    }
}

async function downloadLspServer(context: vscode.ExtensionContext): Promise<string | undefined> {
    const serverDir = getServerDir(context);
    const binaryPath = getServerBinaryPath(context);

    outputChannel.appendLine(`[LSP Setup] Server directory: ${serverDir}`);
    outputChannel.appendLine(`[LSP Setup] Expected binary path: ${binaryPath}`);

    // Check if already downloaded
    if (fs.existsSync(binaryPath)) {
        outputChannel.appendLine(`[LSP Setup] Binary already exists, skipping download`);
        return binaryPath;
    }

    const assetName = getAssetName();
    const downloadUrl = `https://github.com/${LSP_REPO}/releases/download/lsp-v${LSP_VERSION}/${assetName}`;
    outputChannel.appendLine(`[LSP Setup] Asset name: ${assetName}`);
    outputChannel.appendLine(`[LSP Setup] Download URL: ${downloadUrl}`);

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
                    outputChannel.appendLine(`[LSP Setup] Creating server directory: ${serverDir}`);
                    fs.mkdirSync(serverDir, { recursive: true });
                } else {
                    outputChannel.appendLine(`[LSP Setup] Server directory already exists`);
                }

                // Download
                const buffer = await downloadFile(downloadUrl);

                progress.report({ message: 'Extracting Language Server...' });

                // Extract
                const { archiveExt } = getPlatformInfo();
                await extractArchive(buffer, serverDir, archiveExt);

                if (fs.existsSync(binaryPath)) {
                    outputChannel.appendLine(`[LSP Setup] ✓ Installation successful!`);
                    vscode.window.showInformationMessage('Achronyme Language Server installed successfully!');
                    return binaryPath;
                } else {
                    outputChannel.appendLine(`[LSP Setup] ✗ Binary not found after extraction`);
                    throw new Error('Binary not found after extraction');
                }
            } catch (error) {
                outputChannel.appendLine(`[LSP Setup] ✗ Error: ${error}`);
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
    outputChannel.appendLine(`[LSP] Searching for LSP server binary...`);
    const config = vscode.workspace.getConfiguration('achronyme');
    const configuredPath = config.get<string>('lsp.serverPath');

    if (configuredPath && configuredPath.trim() !== '') {
        outputChannel.appendLine(`[LSP] Using configured path: ${configuredPath}`);
        if (fs.existsSync(configuredPath)) {
            outputChannel.appendLine(`[LSP] ✓ Configured path exists`);
            return configuredPath;
        } else {
            outputChannel.appendLine(`[LSP] ✗ Configured path does not exist`);
        }
    }

    // Check downloaded server in global storage
    const downloadedPath = getServerBinaryPath(context);
    outputChannel.appendLine(`[LSP] Checking downloaded path: ${downloadedPath}`);
    if (fs.existsSync(downloadedPath)) {
        outputChannel.appendLine(`[LSP] ✓ Found downloaded server`);
        return downloadedPath;
    }

    // Try to find bundled server in extension directory
    const { binaryExt } = getPlatformInfo();
    const bundledPath = path.join(context.extensionPath, 'server', `achronyme-lsp${binaryExt}`);
    outputChannel.appendLine(`[LSP] Checking bundled path: ${bundledPath}`);
    if (fs.existsSync(bundledPath)) {
        outputChannel.appendLine(`[LSP] ✓ Found bundled server`);
        return bundledPath;
    }

    // Not found - will need to download
    outputChannel.appendLine(`[LSP] ✗ Server binary not found anywhere`);
    return undefined;
}

async function startLanguageServer(context: vscode.ExtensionContext, statusBarItem?: vscode.StatusBarItem) {
    outputChannel.appendLine(`\n[LSP] ========================================`);
    outputChannel.appendLine(`[LSP] Starting Achronyme Language Server`);
    outputChannel.appendLine(`[LSP] ========================================`);

    const config = vscode.workspace.getConfiguration('achronyme');
    const lspEnabled = config.get<boolean>('lsp.enabled', true);
    outputChannel.appendLine(`[LSP] LSP Enabled: ${lspEnabled}`);

    if (!lspEnabled) {
        outputChannel.appendLine(`[LSP] LSP is disabled in configuration`);
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
        outputChannel.appendLine(`[LSP] ✗ Server path could not be determined`);
        vscode.window.showWarningMessage(
            'Achronyme LSP server not available. Some features will be unavailable.'
        );
        if (statusBarItem) {
            statusBarItem.text = '$(warning) Achronyme LSP';
            statusBarItem.tooltip = 'Achronyme Language Server not available';
        }
        return;
    }

    outputChannel.appendLine(`[LSP] ✓ Using server at: ${serverPath}`);

    const debugMode = config.get<boolean>('lsp.debug', false);
    outputChannel.appendLine(`[LSP] Debug mode: ${debugMode}`);
    const args = ['--stdio'];
    if (debugMode) {
        args.push('--debug');
    }
    outputChannel.appendLine(`[LSP] Server arguments: ${args.join(' ')}`);

    const serverOptions: ServerOptions = () => {
        return new Promise<StreamInfo>((resolve, reject) => {
            if (!serverPath) {
                reject(new Error('Server path is undefined'));
                return;
            }

            outputChannel.appendLine(`[LSP] Spawning server process: ${serverPath} ${args.join(' ')}`);

            const serverProcess = child_process.spawn(serverPath, args, {
                stdio: 'pipe',
                env: process.env,
                shell: false
            });

            serverProcess.on('error', (err: Error) => {
                outputChannel.appendLine(`[LSP] Process error: ${err}`);
                reject(err);
            });

            if (serverProcess.stderr) {
                serverProcess.stderr.on('data', (data: Buffer) => {
                    outputChannel.appendLine(`[LSP] Server stderr: ${data.toString()}`);
                });
            }

            serverProcess.on('exit', (code: number | null, signal: string | null) => {
                outputChannel.appendLine(`[LSP] Server process exited with code ${code}, signal ${signal}`);
            });

            outputChannel.appendLine(`[LSP] Server process spawned with PID: ${serverProcess.pid}`);

            if (!serverProcess.stdout || !serverProcess.stdin) {
                reject(new Error('Failed to get process streams'));
                return;
            }

            resolve({
                reader: serverProcess.stdout,
                writer: serverProcess.stdin
            });
        });
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'soc' }
        ],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{soc,ach}')
        },
        outputChannelName: 'Achronyme Language Server',
        initializationOptions: {},
        initializationFailedHandler: (error) => {
            outputChannel.appendLine(`[LSP] Initialization failed: ${error}`);
            return false; // Don't retry
        },
        errorHandler: {
            error: (error, message, count) => {
                outputChannel.appendLine(`[LSP] Error (count ${count}): ${error}, message: ${JSON.stringify(message)}`);
                return { action: ErrorAction.Continue };
            },
            closed: () => {
                outputChannel.appendLine(`[LSP] Connection closed by server`);
                return { action: CloseAction.DoNotRestart };
            }
        }
    };

    client = new LanguageClient(
        'achronymeLSP',
        'Achronyme Language Server',
        serverOptions,
        clientOptions
    );

    // Add error handlers
    client.onDidChangeState((event) => {
        outputChannel.appendLine(`[LSP] State changed: ${event.oldState} -> ${event.newState}`);
    });

    try {
        outputChannel.appendLine(`[LSP] Attempting to start client...`);
        await client.start();
        outputChannel.appendLine(`[LSP] ✓ Language Server started successfully!`);
        console.log('Achronyme Language Server started successfully');
        if (statusBarItem) {
            statusBarItem.text = '$(check) Achronyme LSP';
            statusBarItem.tooltip = 'Achronyme Language Server is active\n\nFeatures:\n• Code Completion (151 items)\n• Signature Help (56+ signatures)\n• Code Formatting\n• Diagnostics\n• Navigation (Go to Definition, Find References)\n• Hover Information\n• Document Symbols';
        }
        vscode.window.showInformationMessage('Achronyme Language Server is ready!');
    } catch (error) {
        outputChannel.appendLine(`[LSP] ✗ Failed to start Language Server: ${error}`);
        if (error instanceof Error) {
            outputChannel.appendLine(`[LSP] Error stack: ${error.stack}`);
        }
        console.error('Failed to start Achronyme Language Server:', error);
        if (statusBarItem) {
            statusBarItem.text = '$(error) Achronyme LSP';
            statusBarItem.tooltip = `Achronyme Language Server failed to start: ${error}`;
        }
        vscode.window.showErrorMessage(
            `Failed to start Achronyme Language Server: ${error}. ` +
            'Check the "Achronyme" output channel for details.'
        );
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Achronyme SOC extension activated');

    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('Achronyme');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine(`[Extension] Achronyme SOC extension activated`);
    outputChannel.appendLine(`[Extension] Platform: ${os.platform()} ${os.arch()}`);
    outputChannel.appendLine(`[Extension] Extension path: ${context.extensionPath}`);
    outputChannel.appendLine(`[Extension] Global storage path: ${context.globalStorageUri.fsPath}`);

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
        outputChannel.appendLine(`\n[Extension] Restart command triggered`);
        if (client) {
            outputChannel.appendLine(`[Extension] Stopping existing client...`);
            await client.stop();
            outputChannel.appendLine(`[Extension] Client stopped`);
        }
        await startLanguageServer(context, statusBarItem);
    });

    context.subscriptions.push(restartCommand);

    // Command to show output channel
    const showLogsCommand = vscode.commands.registerCommand('achronyme.showLogs', () => {
        outputChannel.show();
    });

    context.subscriptions.push(showLogsCommand);
}

export async function deactivate(): Promise<void> {
    if (client) {
        await client.stop();
    }
}
