import filterInvalidEmails from '../filterInvalidEmails';

describe('filterInvalidEmails', () => {
  it('should return an empty array when all domains match', () => {
    const emailDomainInput = '@gmail.com';
    const commitEmails = [
      'a@gmail.com',
      'a.b@gmail.com',
      'a+b@gmail.com',
      'd_f@gmail.com',
      '@gmail.com',
    ];
    expect(filterInvalidEmails(emailDomainInput, commitEmails)).toEqual([]);
  });

  it('should filter invalid emails from multiple domains', () => {
    const emailDomainInput = '@gmail.com,hotmail.com,outlook.com';
    const commitEmails = ['a@gmail.com', 'a.b@hotmail.com', 'a+b@outlook.com', 'd_f@dropbox.com'];
    expect(filterInvalidEmails(emailDomainInput, commitEmails)).toEqual(['d_f@dropbox.com']);
  });

  it('exempts GitHub App / bot noreply authors from the domain check', () => {
    const emailDomainInput = '@demark.com,symbolik.com,shakuro.com';
    const commitEmails = [
      'symbolikci[bot]@users.noreply.github.com',
      '41898282+github-actions[bot]@users.noreply.github.com',
      '29139614+renovate[bot]@users.noreply.github.com',
    ];
    expect(filterInvalidEmails(emailDomainInput, commitEmails)).toEqual([]);
  });

  it('still flags a human GitHub privacy noreply (no [bot] marker)', () => {
    const emailDomainInput = '@demark.com';
    const commitEmails = ['123456+octocat@users.noreply.github.com'];
    expect(filterInvalidEmails(emailDomainInput, commitEmails)).toEqual([
      '123456+octocat@users.noreply.github.com',
    ]);
  });

  it('does not crash on a missing author email (reports a legible sentinel)', () => {
    const emailDomainInput = '@demark.com';
    const commitEmails = ['octocat@demark.com', undefined];
    // valid corp email passes; the missing one is reported as the sentinel, and nothing threw
    expect(filterInvalidEmails(emailDomainInput, commitEmails)).toEqual(['(missing author email)']);
  });
});
