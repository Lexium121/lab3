const vscode = require('vscode');

function getStats(text) {
  const lines = text.split('\n');
  return {
    lines: lines.length,
    nonEmpty: lines.filter(l => l.trim() !== '').length,
    words: (text.match(/\S+/g) || []).length,
    chars: text.length
  };
}

function activate(context) {
  // элемент в строке состояния
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  status.command = 'fileStats.show';
  context.subscriptions.push(status);

  function update() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { status.hide(); return; }
    const s = getStats(editor.document.getText());
    status.text = `$(file-text) Строк: ${s.lines}, слов: ${s.words}`;
    status.show();
  }

  // команда: подробная статистика
  context.subscriptions.push(vscode.commands.registerCommand('fileStats.show', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showWarningMessage('Нет открытого файла'); return; }
    const s = getStats(editor.document.getText());
    vscode.window.showInformationMessage(
      `Строк: ${s.lines} (непустых: ${s.nonEmpty}), слов: ${s.words}, символов: ${s.chars}`);
  }));

  // команда: вставка шапки с автором и датой
  context.subscriptions.push(vscode.commands.registerCommand('fileStats.insertHeader', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const hashLangs = ['python', 'shellscript', 'yaml', 'ruby', 'perl', 'r'];
    const c = hashLangs.includes(editor.document.languageId) ? '#' : '//';
    const author = vscode.workspace.getConfiguration('fileStats').get('author');
    const date = new Date().toISOString().slice(0, 10);
    const header = `${c} Автор: ${author}\n${c} Дата: ${date}\n\n`;
    editor.edit(b => b.insert(new vscode.Position(0, 0), header));
  }));

  // обновлять статистику при смене вкладки и при редактировании
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(update),
    vscode.workspace.onDidChangeTextDocument(update)
  );
  update();
}

function deactivate() {}

module.exports = { activate, deactivate };
