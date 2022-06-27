export default async function handler(req, res) {
  const { accessToken, searchEntry, productId, variantId } = req.query;
  if (process.env.ACCESS_TOKEN && process.env.ACCESS_TOKEN !== accessToken) {
    res.status(400).json({ error: "Denied" });
  }
  const allProducts = [
    {
      image: "https://example.com/book.jpeg",
      title: "Pocket Book",
      productId: "887262",
      variantId: "0",
      price: "9.99",
      availableForSale: true,
    },
  ];
  if (searchEntry) {
    const products = allProducts.filter((product) =>
      product.title.includes(searchEntry)
    );
    res.status(200).json({ products });
  }
  if (productId && variantId) {
    const products = allProducts.filter(
      (product) =>
        product.productId === productId && product.variantId === variantId
    );
    if (products.length > 0) {
      res.status(200).json({ products });
    }
    res.status(400).json({ error: "Not found" });
  }
  res.status(200).json({ products: allProducts });
}