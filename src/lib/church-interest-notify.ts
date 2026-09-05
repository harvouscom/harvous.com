/**
 * "Someone filled in the church form" — the email that says so.
 *
 * Netlify Forms sent these for us. D1 replaced the storage but not the telling,
 * so submissions were landing in a table nobody was watching.
 *
 * Best-effort by design. The row is already committed before this runs, and the
 * Worker fires it through `waitUntil` — a bounced email, a rate limit, an
 * expired key, all leave the submission safely stored. The table is the record;
 * this is only the nudge to go and look at it.
 *
 * Cloudflare's own send_email binding would avoid the vendor entirely, but it
 * wants Email Routing enabled on the zone, and that rewrites MX — harvous.com's
 * mail is Hey (work-mx.app.hey.com). Not worth breaking real email over a
 * notification.
 *
 * @see cloudflare/worker.ts — the caller
 * @see src/lib/church-interest.ts — the record this describes
 */

import type { ChurchInterestRecord } from './church-interest.ts';

export type NotifyConfig = {
  apiKey: string;
  /** Must be on a domain verified in Resend. */
  from: string;
  to: string;
};

export function readNotifyConfig(env: Record<string, string | undefined>): NotifyConfig | null {
  const apiKey = (env.RESEND_API_KEY ?? '').trim();
  const from = (env.NOTIFY_FROM ?? '').trim();
  const to = (env.NOTIFY_TO ?? '').trim();
  // Unset is a valid state: no key, no email, submission still stored.
  if (!apiKey || !from || !to) return null;
  return { apiKey, from, to };
}

/** Everything here is visitor-supplied, so it never reaches HTML unescaped. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A header can't hold a newline without becoming two headers, and the church
 * name is typed by a stranger. Strip controls, then cap it.
 */
function headerSafe(value: string, max = 60): string {
  const flat = value.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

const INTEREST_LABELS: Record<string, string> = {
  'shared-spaces': 'Shared spaces',
  'church-org-curriculum': 'Church curriculum',
  'chms-integrations': 'ChMS integrations',
  'getting-set-up': 'Help getting set up',
};

const ROLE_LABELS: Record<string, string> = {
  pastor: 'Pastor',
  staff: 'Church staff',
  'group-leader': 'Group leader',
  teacher: 'Teacher',
  other: 'Other',
};

export function buildNotification(record: ChurchInterestRecord): {
  subject: string;
  html: string;
  text: string;
} {
  const country =
    record.churchCountry === 'OTHER'
      ? record.churchCountryOther || 'Not listed'
      : record.churchCountry;

  const where = [record.churchCity, record.churchState, country].filter(Boolean).join(', ');
  const role = ROLE_LABELS[record.role] ?? record.role;
  const roleLine = record.role === 'other' && record.roleOther ? `Other — ${record.roleOther}` : role;
  const interests = record.interests
    .split(',')
    .map((i) => INTEREST_LABELS[i] ?? i)
    .join(', ');

  const rows: [string, string][] = [
    ['Name', record.name],
    ['Email', record.email],
    ['Role', roleLine],
    ['Church', record.churchName],
    ['Where', where],
    ['Denomination', record.churchDenomination ?? '—'],
    ['Interested in', interests],
    // Present only when they picked a real church from the typeahead, which is
    // the difference between a lead and a lead you can look up.
    ['Here’s My Church ID', record.hmcChurchId ?? '—'],
  ];

  const subject = `Church interest: ${headerSafe(record.churchName)}`;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">
<p style="margin:0 0 16px">Someone asked about Harvous for their church.</p>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(
        k
      )}</td><td style="padding:4px 0">${esc(v)}</td></tr>`
  )
  .join('\n')}
</table>
<p style="margin:16px 0 0;color:#666;font-size:13px">Stored in D1 — <code>harvous-com.church_interest</code>. Replying goes straight to them.</p>
</div>`;

  return { subject, html, text };
}

/** Resolves either way; failure is logged, never thrown at the request. */
export async function sendChurchInterestNotification(
  record: ChurchInterestRecord,
  config: NotifyConfig
): Promise<void> {
  const { subject, html, text } = buildNotification(record);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        subject,
        html,
        text,
        // So hitting reply reaches the person who filled in the form.
        reply_to: record.email,
      }),
    });
    if (!response.ok) {
      console.error('church-interest notification failed', response.status, await response.text());
    }
  } catch (error) {
    console.error('church-interest notification threw', error);
  }
}
