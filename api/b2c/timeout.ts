import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.error("⏳ B2C Timeout:", JSON.stringify(req.body, null, 2));

  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Timeout received"
  });
}
