const { z, objectId } = require('./common.validator');

const userParams = z.object({
  id: objectId,
});

const cartBody = z.object({
  templateId: objectId,
});

const purchaseSchema = z.object({
  templateId: objectId,
  purchasedAt: z.coerce.date().optional(),
  amount: z.coerce.number().min(0).optional(),
  currency: z.string().trim().max(10).optional(),
  razorpayPaymentId: z.string().trim().optional(),
  razorpayOrderId: z.string().trim().optional(),
  razorpaySignature: z.string().trim().optional(),
  paymentStatus: z.enum(['pending', 'captured', 'failed', 'refunded']).optional(),
  downloadToken: z.string().trim().optional(),
  expiresAt: z.coerce.date().optional(),
  invoiceId: z.string().trim().optional(),
  refunds: z
    .array(
      z.object({
        refundId: z.string().trim().optional(),
        amount: z.coerce.number().min(0).optional(),
        reason: z.string().trim().optional(),
        createdAt: z.coerce.date().optional(),
      })
    )
    .optional(),
});

const userBody = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['end_user', 'content_creator', 'admin']).optional(),
  authProvider: z.enum(['local', 'google', 'github']).optional(),
  providerId: z.string().trim().optional(),
  razorpayContactId: z.string().trim().optional(),
  razorpayCustomerId: z.string().trim().optional(),
  purchases: z.array(purchaseSchema).optional(),
  cart: z.array(objectId).optional(),
  favorites: z.array(objectId).optional(),
  phone: z.string().trim().optional(),
  billingAddress: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
      zipCode: z.string().trim().optional(),
    })
    .optional(),
  creatorProfile: z
    .object({
      bio: z.string().trim().max(500).optional(),
      avatar: z.string().trim().optional(),
      website: z.string().trim().optional(),
      socialLinks: z
        .object({
          youtube: z.string().trim().optional(),
          instagram: z.string().trim().optional(),
          twitter: z.string().trim().optional(),
        })
        .optional(),
      isVerified: z.boolean().optional(),
    })
    .optional(),
  preferences: z
    .object({
      emailNotifications: z
        .object({
          newTemplates: z.boolean().optional(),
          promotions: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  lastLogin: z.coerce.date().optional(),
});

const createUserBody = userBody.extend({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
});

const updateUserBody = userBody.refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

module.exports = {
  userParams,
  cartBody,
  createUserBody,
  updateUserBody,
};
