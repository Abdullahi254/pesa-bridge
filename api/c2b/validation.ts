import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('C2B Validation Request:', req.body);

  const { TransAmount, BillRefNumber } = req.body;

    // Example validation logic
//   if (!BillRefNumber) {
//     return res.status(200).json({
//       ResultCode: "C2B00012",
//       ResultDesc: "Rejected: Missing BillRefNumber"
//     });
//   }

  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });
}
