import Cors from 'cors';

function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, result => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://omega.openship.org']
        : 'http://localhost:3000',
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  const { accessToken, searchEntry, productId, variantId } = req.query;

  // Check if accessToken from Openship matches ENV
  // if not, return "Access Denied"
  if (!process.env.ACCESS_TOKEN || process.env.ACCESS_TOKEN === accessToken) {
    const allProducts = [
      {
        image:
          'https://user-images.githubusercontent.com/41929050/61567048-13938600-aa33-11e9-9cfd-712191013192.jpeg',
        title: 'The Quantified Cactus: An Easy Plant Soil Moisture Sensor',
        productId: '887262',
        variantId: '0',
        price: '12.89',
        availableForSale: true,
      },
      {
        image:
          'https://user-images.githubusercontent.com/41929050/61567049-13938600-aa33-11e9-9c69-a4184bf8e524.jpeg',
        title: 'A beautiful switch-on book light',
        productId: '773642',
        variantId: '0',
        price: '4.26',
        availableForSale: true,
      },
    ];

    // if productId and variantId exists, filter allProducts based on these values
    // if no products are found after filter, return error
    if (productId && variantId) {
      const products = allProducts.filter(
        product =>
          product.productId === productId && product.variantId === variantId
      );
      if (products.length > 0) {
        return res.status(200).json({ products });
      }
      return res.status(400).json({ error: 'Product not found' });
    }

    // if searchEntry exists, filter allProducts based on that value
    if (searchEntry) {
      const products = allProducts.filter(product =>
        product.title.includes(searchEntry)
      );
      return res.status(200).json({ products });
    }

    return res.status(200).json({ products: allProducts });
  }
  res.status(500).json({ error: 'Access denied' });
}