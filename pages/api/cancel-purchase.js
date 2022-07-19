import { request, gql } from "graphql-request";

export default async (req, res) => {
  const {
    accessToken,
    purchaseId,
  } = req.body;
  if (
    process.env.ACCESS_TOKEN &&
    process.env.ACCESS_TOKEN !== accessToken
  ) {
    return res
      .status(403)
      .json({ error: "Denied" });
  }
  try {
    const cancelledPurchase = await request({
      url: process.env.OPENSHIP_DOMAIN,
      requestHeaders: {
        "x-api-key": process.env.OPENSHIP_KEY,
      },
      document: gql`
        mutation ($purchaseId: String!) {
          cancelPurchase(purchaseId: $purchaseId) {
            id
          }
        }
      `,
      variables: { purchaseId },
    });
    return res
      .status(200)
      .json({ cancelledPurchase });
  } catch {
    return res.status(400).json({
      error: "Purchase cancellation failed.",
    });
  }
};