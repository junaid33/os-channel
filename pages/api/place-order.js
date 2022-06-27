import { createTransport, getTestMessageUrl } from "nodemailer";

export default async (req, res) => {
  const {
    accessToken,
    email,
    metafields,
    cartItems,
    address: {
      first_name,
      last_name,
      streetAddress1,
      streetAddress2,
      city,
      state,
      zip,
      country,
    },
  } = req.body;
  if (process.env.ACCESS_TOKEN && process.env.ACCESS_TOKEN !== accessToken) {
    res.status(400).json({ error: "Denied" });
  }
  try {
    const newOrderId = Date.now().toString();
    let cartItemsHtml = "";
    cartItems.forEach((c) => {
      cartItemsHtml += `
          <p>Title: ${c.name}</p>
          <p>Product Id: ${c.productId}</p>
          <p>Variant Id: ${c.variantId}</p>
          <p>Quantity: ${c.quantity}</p>
          <p>Price: ${c.price}</p>
          <p>______________________________</p>
        `;
    });
    const html = `
        <div>
          <h2>Order ${newOrderId}</h2>
          <p>Shipping Address</p>
          <p>${first_name}${" "}${last_name}</p>
          <p>${streetAddress1}</p>
          <p>${streetAddress2}</p>
          <p>${city}</p>
          <p>${state}</p>
          <p>${zip}</p>
          <>${country}</p>
          <p>Products to ship</p>
          <p>______________________________</p>
          ${cartItemsHtml}
        </div>
      `;
    const transport = createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "lexus31@ethereal.email",
        pass: "2S2R8P29bTFQr2K2kY",
      },
    });
    const orderEmail = await transport.sendMail({
      to: "yoursupplier@awesome.com",
      from: email,
      subject: `Order ${newOrderId}`,
      html,
    });
    res.status(200).json({
      purchaseId: newOrderId,
      url: getTestMessageUrl(orderEmail),
    });
  } catch {
    res.status(200).json({
      error: "Order creation failed.",
    });
  }
};
