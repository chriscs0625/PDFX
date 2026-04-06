import chokidar from 'chokidar';
import { execa } from 'execa';

const watcher = chokidar.watch('src/', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

let timeout;

watcher.on('all', (event, path) => {
  if (['add', 'change', 'unlink'].includes(event)) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        await execa('git', ['add', '.']);
        await execa('git', ['commit', '-m', `auto: save changes in ${path}`]);
        await execa('git', ['push']);
        console.log(`[${new Date().toISOString()}] Committed changes in ${path}`);
      } catch (error) {
        // Handle errors silently to prevent crashing
      }
    }, 2000);
  }
});

console.log('Watching src/ directory for changes...');