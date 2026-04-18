const { z } = require('./common.validator');

const roleSchema = z
  .enum(['end_user', 'content_creator', 'admin', 'user', 'manager'])
  .transform((role) => (role === 'user' || role === 'manager' ? 'end_user' : role));

const signUpBody = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(1),
    role: roleSchema.default('end_user'),
    phone: z.string().trim().regex(/^[0-9]{10}$/).optional().or(z.literal('')),
    billingAddress: z
      .object({
        street: z.string().trim().max(200).optional().or(z.literal('')),
        city: z.string().trim().max(100).optional().or(z.literal('')),
        state: z.string().trim().max(100).optional().or(z.literal('')),
        country: z.string().trim().max(100).optional(),
        zipCode: z.string().trim().max(20).optional().or(z.literal('')),
      })
      .optional(),
    creatorProfile: z
      .object({
        bio: z.string().trim().max(500).optional().or(z.literal('')),
        avatar: z.string().trim().optional().or(z.literal('')),
        website: z.string().trim().url().optional().or(z.literal('')),
        socialLinks: z
          .object({
            youtube: z.string().trim().max(200).optional().or(z.literal('')),
            instagram: z.string().trim().max(200).optional().or(z.literal('')),
            twitter: z.string().trim().max(200).optional().or(z.literal('')),
          })
          .optional(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '"confirmPassword" must match "password"',
    path: ['confirmPassword'],
  })
  .transform(({ confirmPassword, ...data }) => data);

const loginBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const emailLoginBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  guestCart: z.array(z.string()).default([]),
  guestFavorites: z.array(z.string()).default([]),
});

module.exports = {
  signUpBody,
  loginBody,
  emailLoginBody,
};
