import { expect } from '@oclif/test';
import { readFileSync } from 'fs';
import { customTest, outputFixture, testEnvironmentFile, testUserAuth } from '../../test-helpers';

describe('connections:list', () => {
  customTest
    .stdout()
    .mockCryppo()
    .nock('https://sandbox.meeco.me/vault', api => {
      api
        .get('/connections')
        .matchHeader('Authorization', '2FPN4n5T68xy78i6HHuQ')
        .matchHeader('Meeco-Subscription-Key', 'environment_subscription_key')
        .reply(200, {
          connections: [
            {
              own: {
                id: 'abc123',
                encrypted_recipient_name: 'Some Encrypted Name',
              },
              the_other_user: {
                id: 'abc345',
              },
            },
            {
              own: {
                id: 'def456',
                encrypted_recipient_name: 'Some Encrypted Name',
              },
              the_other_user: {
                id: 'def789',
              },
            },
          ],
        });
    })
    .run(['connections:list', ...testUserAuth, ...testEnvironmentFile])
    .it('lists a users connections', ctx => {
      const expected = readFileSync(outputFixture('list-connections.output.yaml'), 'utf-8');
      expect(ctx.stdout).to.contain(expected.trim());
    });
});
