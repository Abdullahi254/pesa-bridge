import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('C2B Confirmation:', req.body);

  const {
    TransID,
    TransAmount,
    MSISDN,
    BillRefNumber
  } = req.body;

  // TODO: Save to DB here

  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Received successfully"
  });
}
