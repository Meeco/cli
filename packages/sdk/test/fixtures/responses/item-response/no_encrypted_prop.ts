import { SlotType } from '@meeco/sdk';
import { ItemResponse, Slot } from '@meeco/vault-api-sdk';

const itemId = 'itemId';

const response: ItemResponse = {
  item: {
    id: itemId,
    own: true,
    description: '',
    created_at: new Date(1),
    updated_at: new Date(1),
    label: 'My Fave Foods',
    name: 'food',
    slot_ids: ['steak', 'pizza', 'yoghurt'],
    item_template_id: 'id',
    ordinal: 1,
    visible: true,
    item_template_label: '',
    image: null,
    item_image: null,
    item_image_background_colour: null,
    classification_node_ids: [],
    association_ids: [],
    associations_to_ids: [],
    me: true,
    background_color: null,
    original_id: null,
    owner_id: null,
    share_id: null,
  },
  slots: ([
    {
      id: 'pizza',
      label: 'Pizza',
      name: 'pizza',
      slot_type_name: SlotType.KeyValue,
      encrypted_value: 'Hawaiian',
      created_at: new Date(1),
      updated_at: new Date(1),
      own: true,
      share_id: null,
      description: null,
      ordinal: 1,
      visible: true,
      classification_node_ids: [],
      attachment_id: null,
      attachment_uid: null,
      item_id: itemId,
      required: false,
      creator: null,
      encrypted_value_verification_key: null,
      value_verification_hash: null,
      image: null,
      original_id: null,
      owner_id: null,
    },
    {
      id: 'steak',
      label: 'Steak',
      name: 'steak',
      slot_type_name: SlotType.KeyValue,
      encrypted_value: 'Rump',
      created_at: new Date(1),
      updated_at: new Date(1),

      own: true,
      share_id: null,
      description: null,
      ordinal: 1,
      visible: true,
      classification_node_ids: [],
      attachment_id: null,
      attachment_uid: null,
      item_id: itemId,
      required: false,
      creator: null,
      encrypted_value_verification_key: null,
      value_verification_hash: null,
      image: null,
      original_id: null,
      owner_id: null,
    },
    {
      id: 'beer',
      label: 'Beer',
      name: 'beer',
      slot_type_name: SlotType.KeyValue,
      encrypted_value: 'Session Ale',
      created_at: new Date(1),
      updated_at: new Date(1),

      own: true,
      share_id: null,
      description: null,
      ordinal: 1,
      visible: true,
      classification_node_ids: [],
      attachment_id: null,
      attachment_uid: null,
      item_id: itemId,
      required: false,
      creator: null,
      encrypted_value_verification_key: null,
      value_verification_hash: null,
      image: null,
      original_id: null,
      owner_id: null,
    },
  ] as any) as Slot[],
  // cast is required as Slot.encrypted is required until api.v20
  associations_to: [],
  associations: [],
  attachments: [],
  classification_nodes: [],
  thumbnails: [],
};

export default response;
