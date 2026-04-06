import chokidar from 'chokidar';
import { execa } from 'execa';

function getCommitMessage(filePath, event) {
  const p = filePath.replace(/\\/g, '/');

  if (event === 'unlink') return `chore: remove ${p}`;

  if (p.includes('app/auth/login')) return 'feat(auth): update login page UI and logic';
  if (p.includes('app/auth/register')) return 'feat(auth): update register page UI and logic';
  if (p.includes('middleware')) return 'feat(auth): update route protection middleware';
  if (p.includes('auth-client')) return 'fix(auth): update Better Auth client configuration';
  if (p.includes('auth.ts')) return 'fix(auth): update Better Auth server configuration';
  if (p.includes('app/layout')) return 'feat(layout): update root layout and providers';
  if (p.includes('dashboard/layout')) return 'feat(layout): update dashboard shell and sidebar';
  if (p.includes('dashboard/page')) return 'feat(dashboard): update main dashboard page';
  if (p.includes('dashboard/new')) return 'feat(dashboard): update new document page';
  if (p.includes('dashboard/history')) return 'feat(dashboard): update document history page';
  if (p.includes('components/pdf/Invoice')) return 'feat(pdf): update InvoicePDF component';
  if (p.includes('components/pdf/Report')) return 'feat(pdf): update ReportPDF component';
  if (p.includes('components/pdf/Certificate')) return 'feat(pdf): update CertificatePDF component';
  if (p.includes('components/pdf/GradeReport')) return 'feat(pdf): update GradeReportPDF component';
  if (p.includes('components/pdf/PDFPreview')) return 'fix(pdf): update PDFPreview ESM import handling';
  if (p.includes('forms/Invoice')) return 'feat(forms): update invoice form fields and validation';
  if (p.includes('forms/Report')) return 'feat(forms): update report form fields and validation';
  if (p.includes('forms/Certificate')) return 'feat(forms): update certificate form fields and validation';
  if (p.includes('forms/GradeReport')) return 'feat(forms): update grade report form fields and validation';
  if (p.includes('components/DocumentCard')) return 'feat(ui): update DocumentCard component';
  if (p.includes('components/EmptyState')) return 'feat(ui): update EmptyState component';
  if (p.includes('layout/Navbar')) return 'feat(ui): update Navbar component';
  if (p.includes('layout/Sidebar')) return 'feat(ui): update Sidebar component';
  if (p.includes('trpc/routers')) return 'feat(api): update tRPC document router';
  if (p.includes('trpc/router')) return 'feat(api): update tRPC root router';
  if (p.includes('trpc/server')) return 'feat(api): update tRPC server configuration';
  if (p.includes('trpc/client')) return 'feat(api): update tRPC client configuration';
  if (p.includes('api/pdf')) return 'feat(api): update PDF generation API route';
  if (p.includes('api/trpc')) return 'feat(api): update tRPC API route handler';
  if (p.includes('lib/supabase')) return 'feat(storage): update Supabase upload helper';
  if (p.includes('lib/pdf-theme')) return 'style(pdf): update PDF theme tokens';
  if (p.includes('schemas/invoice')) return 'feat(schema): update invoice Zod schema';
  if (p.includes('schemas/report')) return 'feat(schema): update report Zod schema';
  if (p.includes('schemas/certificate')) return 'feat(schema): update certificate Zod schema';
  if (p.includes('schemas/grade-report')) return 'feat(schema): update grade report Zod schema';
  if (p.includes('types/index')) return 'chore(types): update shared TypeScript types';
  if (p.includes('globals.css')) return 'style: update global CSS design tokens';
  if (p.includes('prisma/schema')) return 'chore(db): update Prisma schema';
  if (p.includes('next.config')) return 'chore: update Next.js configuration';
  if (p.includes('package.json')) return 'chore: update project dependencies or scripts';
  if (p.includes('.env')) return 'chore: update environment variables';
  if (p.includes('jest')) return 'chore(test): update Jest configuration';
  if (p.includes('vercel')) return 'chore: update Vercel deployment configuration';

  return `chore: update ${p.split('/').pop()}`;
}

const watcher = chokidar.watch('src/', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

let timeout;
let pendingPath = '';
let pendingEvent = '';

watcher.on('all', (event, filePath) => {
  if (['add', 'change', 'unlink'].includes(event)) {
    pendingPath = filePath;
    pendingEvent = event;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(async () => {
      try {
        const commitMessage = getCommitMessage(pendingPath, pendingEvent);
        await execa('git', ['add', '.']);
        await execa('git', ['commit', '-m', commitMessage]);
        await execa('git', ['push']);
        console.log(`[${new Date().toISOString()}] Committed changes: ${commitMessage}`);
      } catch (error) {
        // Handle errors silently to prevent crashing
      }
    }, 2000);
  }
});

console.log('Watching src/ directory for changes...');