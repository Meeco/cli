import { expect } from '@oclif/test';
import { readFileSync } from 'fs';
import { customTest, outputFixture, testEnvironmentFile, testUserAuth } from '../../test-helpers';

describe('items:list', () => {
  customTest
    .nock('https://sandbox.meeco.me/vault', api =>
      api
        .get('/items')
        .matchHeader('Authorization', '2FPN4n5T68xy78i6HHuQ')
        .matchHeader('Meeco-Subscription-Key', 'environment_subscription_key')
        .reply(200, {
          items: [
            {
              id: 'a',
              name: 'My Car',
              slot_ids: ['make_model'],
              created_at: new Date(0),
              updated_at: new Date(0),
            },
            {
              id: 'b',
              name: 'My House',
              slot_ids: ['add'],
              created_at: new Date(0),
              updated_at: new Date(0),
            },
          ],
          slots: [
            {
              id: 'make_model',
              name: 'Make and Model',
              value: 'Tesla Model S',
              created_at: new Date(0),
              updated_at: new Date(0),
            },
            {
              id: 'add',
              name: 'address',
              value: '123 Fake Street',
              created_at: new Date(0),
              updated_at: new Date(0),
            },
          ],
          associations_to: [],
          associations: [],
          attachments: [],
          classification_nodes: [],
          shares: [],
          thumbnails: [],
        })
    )
    .stdout()
    .run(['items:list', ...testUserAuth, ...testEnvironmentFile])
    .it('list items that the user has', ctx => {
      const expected = readFileSync(outputFixture('list-items.output.yaml'), 'utf-8');
      expect(ctx.stdout).to.contain(expected);
    });
});
