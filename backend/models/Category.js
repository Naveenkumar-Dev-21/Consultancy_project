import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        image: {
            type: String,
            default: '/placeholder-category.png'
        },
        subtitle: {
            type: String,
            default: 'Explore our collection'
        },
        gradient: {
            type: String,
            default: 'from-rose-50 to-pink-50'
        }
    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
