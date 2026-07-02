import { info } from '@actions/core';
import { WebhookPayload } from '@actions/github/lib/interfaces';

import { TCommit } from 'types/common';
import { fetchCommitsInPullRequest } from './octokit';

async function getCommitEmails(
  githubEvent: WebhookPayload
): Promise<(string | undefined)[] | undefined> {
  if (githubEvent.pull_request) {
    const { number } = githubEvent.pull_request;

    info(`Checking pull request with id: ${number}`);
    const data = await fetchCommitsInPullRequest(number);

    // author?.email can be undefined; return it honestly (filterInvalidEmails handles it).
    return data.map((data) => data.commit.author?.email);
  }

  if (githubEvent.commits) {
    info('Checking commits');
    return githubEvent.commits.map((commit: TCommit) => commit.author.email);
  }

  throw Error('This action should be used in `pull_request` or `push` event');
}

export default getCommitEmails;
