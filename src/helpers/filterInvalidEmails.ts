import formatEmailDomain from './formatEmailDomain';

// GitHub App / bot commits are authored with a `…[bot]@users.noreply.github.com` address
// (e.g. github-actions[bot], renovate[bot], symbolikci[bot]). The domain check exists to keep
// human contributors on a corp email; bots legitimately use noreply, so they are exempt.
// Intentionally narrow: a human's GitHub privacy noreply (`<id>+<user>@users.noreply.github.com`)
// has no `[bot]` marker and is still checked. github.com only (GHES hosts are out of scope).
// The local part is anchored (`^[^@\s]+`) so only a real single-address local part can match.
const BOT_NOREPLY_EMAIL = /^[^@\s]+\[bot\]@users\.noreply\.github\.com$/i;

const MISSING_EMAIL = '(missing author email)';

function filterInvalidEmails(
  emailDomainInput: string,
  commitEmails: (string | undefined)[]
): string[] {
  const allowedDomains = emailDomainInput.replace(/\s/g, '').split(',').map(formatEmailDomain);

  const invalidEmails = commitEmails
    // getCommitEmails force-casts author?.email, so a missing email can slip through as
    // undefined; map it to a legible sentinel so it is reported as invalid (rather than
    // throwing at `.endsWith` below, or surfacing a bare "undefined" in the error).
    .map((commitEmail) =>
      typeof commitEmail === 'string' && commitEmail ? commitEmail : MISSING_EMAIL
    )
    .filter((commitEmail) => !BOT_NOREPLY_EMAIL.test(commitEmail))
    .filter((commitEmail) => allowedDomains.every((domain) => !commitEmail.endsWith(domain)));

  return invalidEmails;
}

export default filterInvalidEmails;
