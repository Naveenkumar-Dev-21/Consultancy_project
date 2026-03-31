import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        descriptionImages: {
            type: [String],
            default: [],
            validate: {
                validator: function(arr) {
                    return arr.length <= 3;
                },
                message: 'Maximum 3 description images allowed'
            }
        },
        brand: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        subCategory: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        originalPrice: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        ageGroup: {
            type: [String],
            default: [],
        },
        sizes: {
            type: [String],
            default: [],
        },
        gender: {
            type: String,
            enum: ['Boy', 'Girl', 'Unisex'],
            default: 'Unisex',
        }
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
