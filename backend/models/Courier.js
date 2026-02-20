import mongoose from 'mongoose';

const courierSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    trackingUrlPattern: {
        type: String,
        trim: true,
        // Pattern should include {trackingId} placeholder
        // e.g., "https://bluedart.com/track/{trackingId}"
    },
    serviceable: {
        type: Boolean,
        default: true
    },
    estimatedDeliveryDays: {
        type: Number,
        default: 3,
        min: 1
    }
}, {
    timestamps: true
});

// Method to generate tracking URL for a specific tracking ID
courierSchema.methods.getTrackingUrl = function(trackingId) {
    if (!this.trackingUrlPattern || !trackingId) return null;
    return this.trackingUrlPattern.replace('{trackingId}', trackingId);
};

const Courier = mongoose.model('Courier', courierSchema);

export default Courier;
