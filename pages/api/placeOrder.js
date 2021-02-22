import { createTransport, getTestMessageUrl } from 'nodemailer';
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
        ? ['https://www.app.openship.org']
        : 'http://localhost:3000',
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  const {
    accessToken,
    orderId,
    email,
    address: {
      first_name,
      last_name,
      streetAddress1,
      streetAddress2,
      city,
      state,
      zip,
    },
    cartItems,
  } = req.body;

  if (!process.env.ACCESS_TOKEN || process.env.ACCESS_TOKEN === accessToken) {
    try {
      const transport = createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'lexus31@ethereal.email',
          pass: '2S2R8P29bTFQr2K2kY',
        },
      });

      // we can use the current time as an order ID
      const newOrderId = Date.now().toString();

      let cartItemsHtml = '';

      cartItems.forEach(c => {
        cartItemsHtml += `
          <p>Title: ${c.name}</p>
          <p>Product Id: ${c.productId}</p>
          <p>Variant Id: ${c.variantId}</p>
          <p>Quantity: ${c.quantity}</p>
          <p>Price: ${c.price}</p>
          <p>_________________________________</p>
        `;
      });

      const html = `
        <div className="email" style="
          border: 1px solid black;
          padding: 20px;
          font-family: sans-serif;
          line-height: 2;
          font-size: 20px;
        ">
          <h2>Order ${Date.now()}</h2>
          <p>Address</p>
          <p>${first_name}${' '}${last_name}</p>
          <p>${streetAddress1}</p>
          <p>${streetAddress2}</p>
          <p>${city}</p>
          <p>${state}</p>
          <p>${zip}</p>
          <p>Line Items</p>
          <p>_________________________________</p>
          ${cartItemsHtml}
        </div>
      `;

      const orderEmail = await transport.sendMail({
        to: 'yoursupplier@awesome.com',
        from: email,
        subject: `Order ${newOrderId}`,
        html,
      });

      return res.status(200).json({
        url: getTestMessageUrl(orderEmail),
        purchaseId: newOrderId,
      });
    } catch {
      return res.status(400).json({ error: 'Something went wrong.' });
    }
  }
  return res.status(500).json({ error: 'Access denied' });
}
