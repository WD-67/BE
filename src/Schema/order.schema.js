import Joi from "joi";

export const validation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.string().required(),
        status: Joi.string(),
        products: Joi.array().items({
            product_id: Joi.string().required(),
            quantity: Joi.number().required(),
        }),
        total_price: Joi.number().required(),
        address: Joi.string().required(),
        payment_id: Joi.string().required(),
        sale_id: Joi.string(),
    });

    const result = schema.validate(req.body);

    try {
        if (result.error) {
            return res.status(401).json({ error: 2, message: result.error.details[0].message });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            err: 1,
            message: new Error(err).message,
        });
    }
};
