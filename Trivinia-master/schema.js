const Joi = require("joi");
const review = require("./models/review");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().allow("").optional(), 
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
        category: Joi.string().valid('beach', 'mountain', 'city', 'lake', 'trending', 'countryside', 'mansion', 'all').default('all'),
        amenities: Joi.object({
            beds: Joi.number().min(1).default(1),
            baths: Joi.number().min(1).default(1),
            guests: Joi.number().min(1).default(1)
        }).default({
            beds: 1,
            baths: 1,
            guests: 1
        })
    }).required(),
    deleteImages: Joi.string().optional()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required().min(5).max(500),
        rating: Joi.number().required().min(1).max(5),
    }).required()
});