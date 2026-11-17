/**
 * Runs the janitor alone: `npm run test:integration:live:janitor`. Reads the keys like the tier does (environment, then
 * LIVE_ENV_FILE or test/integration/live/.env.local). Exit code 1 when something could not be removed or a grant stayed open.
 * `--role open,pam` limits the roles.
 */
import { formatReport, runJanitor, verifyApplicationGrantClosed } from './janitor';
import { env, redact, ROLES, type Role } from './env';

async function main(): Promise<void> {
  const flag = process.argv.indexOf('--role');
  const roles =
    flag > 0
      ? (process.argv[flag + 1] ?? '').split(',').filter((r): r is Role => (ROLES as readonly string[]).includes(r))
      : ROLES;
  const report = await runJanitor({ roles });
  formatReport(report).forEach((line) => console.log(line));
  const secured = roles.includes('pam') ? env().pam : roles.includes('datasync') ? env().datasync : undefined;
  if (secured && report.critical.length === 0 && !process.argv.includes('--no-verify')) {
    const ms = await verifyApplicationGrantClosed(secured);
    console.log(`janitor: a client without a token is refused on the secured keyset (checked in ${ms} ms)`);
  }
  process.exitCode = report.failed.length || report.critical.length ? 1 : 0;
}

main().catch((error: unknown) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
