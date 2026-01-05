import Product from ".././../models/products.js";

export const getProductsByCategoryId = async (req, reply) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId })
      .select("-category")
      .exec();
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred." });
  }
}; 
