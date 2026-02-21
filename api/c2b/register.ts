import { VercelRequest, VercelResponse } from "@vercel/node";
import { initiateC2B } from "../utils/mpesa.js";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { confirmationURL, validationURL } = req.body;
        const response = await initiateC2B({
            confirmationURL,
            validationURL
        });

        return res.status(200).json(response);
    } catch (error: any) {
        console.error(error.response?.data || error.message);

        return res.status(500).json({
            message: "Failed to register C2B URLs",
            error: error.response?.data || error.message,
        });
    }
}
