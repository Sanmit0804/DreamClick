const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider === 'local';
        },
        minlength: 6,
    },
    
    // --- UPDATED FOR RAZORPAY ---
    role: {
        type: String,
        enum: ['end_user', 'content_creator', 'admin'],
        default: 'end_user'
    },

    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    providerId: {
        type: String,
        sparse: true
    },

    // Razorpay-specific fields
    razorpayContactId: {
        type: String,
        sparse: true
    },
    razorpayCustomerId: {
        type: String, // This is the Customer ID in Razorpay
        sparse: true
    },
    
    purchases: [{
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VideoTemplate'
        },
        purchasedAt: {
            type: Date,
            default: Date.now
        },
        amount: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        // Razorpay payment details
        razorpayPaymentId: String,
        razorpayOrderId: String,
        razorpaySignature: String, // For webhook verification
        paymentStatus: {
            type: String,
            enum: ['pending', 'captured', 'failed', 'refunded'],
            default: 'pending'
        },
        downloadToken: String,
        expiresAt: Date,
        // Additional fields for better tracking
        invoiceId: String, // Razorpay Invoice ID if you generate invoices
        refunds: [{
            refundId: String,
            amount: Number,
            reason: String,
            createdAt: Date
        }]
    }],

    // Additional fields for Razorpay
    phone: {
        type: String,
        sparse: true
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        zipCode: String
    },

    creatorProfile: {
        bio: String,
        avatar: String,
        website: String,
        socialLinks: {
            youtube: String,
            instagram: String,
            twitter: String
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },

    preferences: {
        emailNotifications: {
            newTemplates: { type: Boolean, default: true },
            promotions: { type: Boolean, default: true }
        }
    },

    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date

}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Remove password from output
UserSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Add method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;