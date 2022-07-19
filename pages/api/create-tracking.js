import { request, gql } from "graphql-request";

export default async (req, res) => {
  const {
    accessToken,
    purchaseId,
    trackingNumber,
    trackingCompany,
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
    const trackingDetails = await request({
      url: process.env.OPENSHIP_DOMAIN,
      requestHeaders: {
        "x-api-key": process.env.OPENSHIP_KEY,
      },
      document: gql`
        mutation (
          $data: TrackingDetailCreateInput!
        ) {
          createTrackingDetail(data: $data) {
            id
          }
        }
      `,
      variables: {
        data: {
          trackingCompany,
          trackingNumber,
          purchaseId,
        },
      },
    });
    return res
      .status(200)
      .json({ trackingDetails });
  } catch {
    return res.status(400).json({
      error: "Tracking creation failed.",
    });
  }
};