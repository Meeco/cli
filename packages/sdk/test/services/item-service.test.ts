import { SlotType } from '@meeco/sdk';
import { ItemApi, NestedSlotAttributes } from '@meeco/vault-api-sdk';
import { expect } from '@oclif/test';
import nock from 'nock/types';
import { ItemCreateData } from '../../src/models/item-create-data';
import { ItemUpdateData } from '../../src/models/item-update-data';
import { ItemService } from '../../src/services/item-service';
import { MOCK_NEXT_PAGE_AFTER } from '../constants';
import { response as MockItemResponse } from '../fixtures/responses/item-response';
import {
  customTest,
  environment,
  getInputFixture,
  getOutputFixture,
  replaceUndefinedWithNull,
  testUserAuth,
} from '../test-helpers';

describe('ItemService.create', () => {
  function createItem({ template_name, item }) {
    const slot_ids = ['a', 'b', 'c', 'd', 'e'];
    const update = { ...item };
    if (template_name === 'vehicle') {
      update.slots_attributes = [
        {
          id: 'a',
          name: 'Make',
        },
        {
          id: 'b',
          name: 'Model',
        },
      ];
    }
    const slots = (update.slots_attributes || []).map((slot, index) => ({
      ...slot,
      id: slot_ids[index],
    }));
    delete update.slots_attributes;
    return Promise.resolve({
      item: {
        id: 'item-foo',
        template_name,
        ...update,
        slot_ids: slots.map(slot => slot.id),
      },
      slots,
    });
  }

  customTest
    .stub(ItemApi.prototype, 'itemsPost', createItem as any)
    .it('creates an empty item from a template', async () => {
      const input = getInputFixture('create-item-from-template.input.json');

      const itemCreateData = new ItemCreateData({
        template_name: input.template_name,
        slots: [],
        item: { label: input.label },
      });
      const result = await new ItemService(environment).create(testUserAuth, itemCreateData);

      const expected = getOutputFixture('create-item-from-template.output.json');
      const { slots, ...expectedItem } = expected;
      expect(result.item).to.eql(expectedItem);
      expect(result.slots).to.deep.members(slots);
    });

  customTest
    .stub(ItemApi.prototype, 'itemsPost', createItem as any)
    .mockCryppo()
    .it('creates an item with slots provided in a config file', async () => {
      const input = getInputFixture('create-item-with-slots.input.json');

      const inputSlots: NestedSlotAttributes[] = [];
      input.slots.forEach(x => {
        inputSlots.push({
          ...x,
        });
      });

      const itemCreateData = new ItemCreateData({
        template_name: input.template_name,
        slots: inputSlots,
        item: { label: input.label },
      });
      const result = await new ItemService(environment).create(testUserAuth, itemCreateData);

      const expected = getOutputFixture('create-item-with-slots.output.json');
      const { slots, ...expectedItem } = expected;
      expect(result.item).to.eql(expectedItem);
      expect(result.slots).to.deep.members(slots);
    });
});

describe('ItemService.get', () => {
  customTest
    .mockCryppo()
    .nock('https://sandbox.meeco.me/vault', api =>
      api
        .get('/items/my-item')
        .matchHeader('Authorization', testUserAuth.vault_access_token)
        .matchHeader('Meeco-Subscription-Key', environment.vault.subscription_key)
        .reply(200, MockItemResponse)
    )
    .it('returns an item with all slots decrypted', async () => {
      const result = await new ItemService(environment).get(testUserAuth, 'my-item');

      const { slots: expectedSlots, thumbnails, attachments, ...expectedItem } = getOutputFixture(
        'get-item.output.json'
      );
      expect(replaceUndefinedWithNull(result.item)).to.eql(expectedItem);
      expect(replaceUndefinedWithNull(result.slots)).to.deep.members(expectedSlots);
    });

  // gets a shared item
  // gets a shared item that has been re-encrypted
});

describe('ItemService.list', () => {
  const response = {
    items: [
      {
        id: 'a',
        name: 'My Car',
        slot_ids: ['make_model'],
        created_at: new Date(1),
        updated_at: new Date(1),
      },
      {
        id: 'b',
        name: 'My House',
        slot_ids: ['add'],
        created_at: new Date(1),
        updated_at: new Date(1),
      },
    ],
    slots: [
      {
        id: 'make_model',
        name: 'Make and Model',
        value: 'Tesla Model S',
        created_at: new Date(1),
        updated_at: new Date(1),
      },
      {
        id: 'add',
        name: 'address',
        value: '123 Fake Street',
        created_at: new Date(1),
        updated_at: new Date(1),
      },
    ],
    associations_to: [],
    associations: [],
    attachments: [],
    classification_nodes: [],
    shares: [],
    thumbnails: [],
    meta: [],
  };

  customTest
    .nock('https://sandbox.meeco.me/vault', api =>
      api
        .get('/items')
        .matchHeader('Authorization', '2FPN4n5T68xy78i6HHuQ')
        .matchHeader('Meeco-Subscription-Key', 'environment_subscription_key')
        .reply(200, response)
    )
    .it('list items that the user has', async () => {
      const result = await new ItemService(environment).list(testUserAuth);

      const expected = getOutputFixture('list-items.output.json');
      expect(replaceUndefinedWithNull(result.items)).to.deep.members(expected);
    });
});

describe('ItemService.listAll', () => {
  const response = {
    items: [
      {
        id: 'a',
        name: 'My Car',
        slot_ids: ['make_model'],
        created_at: new Date(1),
        updated_at: new Date(1),
      },
      {
        id: 'b',
        name: 'My House',
        slot_ids: ['add'],
        created_at: new Date(1),
        updated_at: new Date(1),
      },
    ],
    slots: [
      {
        id: 'make_model',
        name: 'Make and Model',
        value: 'Tesla Model S',
        created_at: new Date(1),
        updated_at: new Date(1),
      },
      {
        id: 'add',
        name: 'address',
        value: '123 Fake Street',
        created_at: new Date(1),
        updated_at: new Date(1),
      },
    ],
    associations_to: [],
    associations: [],
    attachments: [],
    classification_nodes: [],
    shares: [],
    thumbnails: [],
    meta: [],
  };

  const responsePart1 = {
    ...response,
    items: [response.items[0]],
    slots: [response.slots[0]],
    next_page_after: MOCK_NEXT_PAGE_AFTER,
    meta: [{ next_page_exists: true }],
  };

  const responsePart2 = {
    ...response,
    items: [response.items[1]],
    slots: [response.slots[1]],
  };

  customTest
    .nock('https://sandbox.meeco.me/vault', api =>
      api
        .get('/items')
        .matchHeader('Authorization', '2FPN4n5T68xy78i6HHuQ')
        .matchHeader('Meeco-Subscription-Key', 'environment_subscription_key')
        .reply(200, responsePart1)
        .get('/items')
        .query({ next_page_after: MOCK_NEXT_PAGE_AFTER })
        .matchHeader('Authorization', '2FPN4n5T68xy78i6HHuQ')
        .matchHeader('Meeco-Subscription-Key', 'environment_subscription_key')
        .reply(200, responsePart2)
    )
    .it('list items that the user has', async () => {
      const result = await new ItemService(environment).listAll(testUserAuth);

      const expected = getOutputFixture('list-items.output.json');
      expect(replaceUndefinedWithNull(result.items)).to.deep.members(expected);
    });
});

describe('ItemService.removeSlot', () => {
  customTest
    .nock('https://sandbox.meeco.me/vault', api =>
      api
        .delete('/slots/my_slot_id')
        .matchHeader('Authorization', '2FPN4n5T68xy78i6HHuQ')
        .matchHeader('Meeco-Subscription-Key', 'environment_subscription_key')
        .reply(204)
    )
    .it('removes a slot from an item', async () => {
      await new ItemService(environment).removeSlot(testUserAuth, 'my_slot_id');
    });
});

describe('ItemService.update', () => {
  const response = {
    item: {
      created_at: new Date(1),
      updated_at: new Date(1),
      label: 'My Fave Foods',
      name: 'food',
      slot_ids: ['pizza'],
    },
    slots: [
      {
        id: 'pizza',
        label: 'Pizza',
        name: 'pizza',
        foo: 'bar',
        slot_type_name: SlotType.KeyValue,
        encrypted_value: 'Supreme',
        encrypted: true,
        created_at: new Date(1),
        updated_at: new Date(1),
      },
    ],
    associations_to: [],
    associations: [],
    attachments: [],
    classification_nodes: [],
    shares: [],
    thumbnails: [],
  };

  function mockVault(api: nock.Scope) {
    api
      .put('/items/my-item', {
        item: {
          label: 'My Fave Foods',
          slots_attributes: [
            {
              name: 'pizza',
              encrypted_value: '[serialized][encrypted]Supreme[with my_generated_dek]',
            },
            {
              name: 'steak',
              _destroy: true,
            },
          ],
        },
      })
      .matchHeader('Authorization', '2FPN4n5T68xy78i6HHuQ')
      .matchHeader('Meeco-Subscription-Key', 'environment_subscription_key')
      .reply(200, response);
  }

  customTest
    .mockCryppo()
    .nock('https://sandbox.meeco.me/vault', mockVault)
    .it('Updates the item', async () => {
      const input = getInputFixture('update-item.input.json');
      const updateData = new ItemUpdateData({
        id: input.id,
        label: input.label,
        slots: input.slots,
      });
      const result = await new ItemService(environment).update(testUserAuth, updateData);

      const { slots: expectedSlots, thumbnails, attachments, ...expectedItem } = getOutputFixture(
        'update-item.output.json'
      );
      expect(replaceUndefinedWithNull(result.item)).to.eql(expectedItem);
      expect(replaceUndefinedWithNull(result.slots)).to.deep.members(expectedSlots);
    });
});