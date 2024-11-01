import { Schema } from 'mongoose';
import { IBusiness } from '.';

export const BusinessSchema = new Schema<IBusiness>(
  {
    createdAt: {
      type: String,
      default(): string {
        return new Date(Date.now()).toUTCString();
      },
    },
    modifiedAt: {
      type: String,
      default(): string {
        return new Date(Date.now()).toUTCString();
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    verification: {
      email: {
        type: String,
      },
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dataProtStatement: String,
    ownerFirstName: String,
    ownerLastName: String,
    members: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
    },
    distance: {
      type: Number,
    },
    onlineShop: String,
    website: {
      type: String,
    },
    phone: {
      type: String,
    },
    whatsApp: {
      type: String,
    },
    instagram: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      street: String,
      streetNumber: String,
      zip: String,
      city: String,
      state: String,
      country: String,
    },
    description: {
      type: String,
      maxlength: 1500,
    },
    delivery: {
      type: [String],
      enum: ['collect', 'delivery'],
    },
    category: {
      type: [String],
      // enum: ['food', 'beverages', 'clothing', 'lifestyle', 'accessories', 'crafts', 'service', 'hairdresse', 'education'],
      required: true,
    },
    paymentMethods: {
      type: [String],
      enum: ['paypal', 'cash', 'creditcard', 'invoice', 'sofort', 'amazon', 'ondelivery', 'sepa', 'other'],
    },
    media: {
      logo: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
        default: null,
      },
      profile: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
        default: null,
      },
      stories: {
        images: {
          type: [Schema.Types.ObjectId],
          ref: 'Image',
        },
        videos: {
          type: [Schema.Types.ObjectId],
          ref: 'Video',
        },
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Virtuals
BusinessSchema.virtual('verified').get(function (this: IBusiness) {
  return Object.keys(this.verification)
    .filter((key) => key !== '$init')
    .some((key) => this.verification[key]);
});

BusinessSchema.method('setDistance', function (this: IBusiness, distance: number) {
  this.distance = distance;
});
// Static methods
// BusinessSchema.statics.anyMethod = async function (this: IBusinessModel): Promise<IBusinessPopulated | null> {
//   return '';
// };

BusinessSchema.pre('validate', function () {
  if (!this.id) {
    this.id = this._id.toHexString();
  }
});

// Document pre Hook
BusinessSchema.pre<IBusiness>('save', function () {
  this.modifiedAt = Date.now().toLocaleString();
  this.active = true;
});
