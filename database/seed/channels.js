const crypto = require('crypto');

const channels = [
  {
    public_id: crypto.randomUUID(),
    name: 'Fiqh & Rulings',
    description: 'Questions about worship, halal/haram, and practical rulings.',
    color_variant: 'blue',
  },
  {
    public_id: crypto.randomUUID(),
    name: 'Aqeedah & Beliefs',
    description: 'Discussions on Islamic creed, theology, and core beliefs.',
    color_variant: 'purple',
  },
  {
    public_id: crypto.randomUUID(),
    name: 'Marriage & Family',
    description: 'Guidance on marriage, parenting, and family matters.',
    color_variant: 'amber',
  },
  {
    public_id: crypto.randomUUID(),
    name: 'New Muslims',
    description: 'A welcoming space for reverts and those learning the basics.',
    color_variant: 'teal',
  },
  {
    public_id: crypto.randomUUID(),
    name: 'General Discussion',
    description: 'Anything else related to Islamic life and practice.',
    color_variant: 'green',
  },
];

module.exports = channels;
