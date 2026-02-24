import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./pay.js";

vi.mock("../utils/mpesa.js", () => ({
  initiateB2C: vi.fn()
}));

import { initiateB2C } from "../utils/mpesa.js";

const mockInitiateB2C = vi.mocked(initiateB2C);

function buildReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: "POST",
    body: {},
    ...overrides
  } as VercelRequest;
}

function buildRes() {
  const res = {
    statusCode: 0,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    }
  };
  return res as unknown as VercelResponse & { statusCode: number; body: unknown };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/b2c/pay", () => {
  it("returns 405 for non-POST requests", async () => {
    const req = buildReq({ method: "GET" });
    const res = buildRes();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ message: "Method not allowed" });
  });

  it("returns 400 when phoneNumber is missing", async () => {
    const req = buildReq({ body: { amount: 100 } });
    const res = buildRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "phoneNumber and amount are required" });
  });

  it("returns 400 when amount is missing", async () => {
    const req = buildReq({ body: { phoneNumber: "254712345678" } });
    const res = buildRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "phoneNumber and amount are required" });
  });

  it("returns 400 when both phoneNumber and amount are missing", async () => {
    const req = buildReq({ body: {} });
    const res = buildRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "phoneNumber and amount are required" });
  });

  it("returns 200 with B2C result on success", async () => {
    const mpesaResult = { ConversationID: "AG_001", OriginatorConversationID: "OC_001" };
    mockInitiateB2C.mockResolvedValue(mpesaResult);

    const req = buildReq({
      body: { phoneNumber: "254712345678", amount: 500, remarks: "Payout" }
    });
    const res = buildRes();

    await handler(req, res);

    expect(mockInitiateB2C).toHaveBeenCalledWith("254712345678", 500, "Payout");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "B2C request sent", data: mpesaResult });
  });

  it("uses default remarks when not provided", async () => {
    mockInitiateB2C.mockResolvedValue({});

    const req = buildReq({ body: { phoneNumber: "254712345678", amount: 200 } });
    const res = buildRes();

    await handler(req, res);

    expect(mockInitiateB2C).toHaveBeenCalledWith("254712345678", 200, "B2C Payment");
  });

  it("returns 500 when initiateB2C throws an axios-style error", async () => {
    const axiosError = {
      message: "Request failed",
      response: { data: { errorCode: "500.001.1001", errorMessage: "Unable to lock subscriber" } }
    };
    mockInitiateB2C.mockRejectedValue(axiosError);

    const req = buildReq({ body: { phoneNumber: "254712345678", amount: 100 } });
    const res = buildRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      message: "Failed to initiate B2C",
      error: axiosError.response.data
    });
  });

  it("returns 500 with error message when error has no response", async () => {
    mockInitiateB2C.mockRejectedValue(new Error("Network error"));

    const req = buildReq({ body: { phoneNumber: "254712345678", amount: 100 } });
    const res = buildRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      message: "Failed to initiate B2C",
      error: "Network error"
    });
  });
});
