const crypto = require("crypto");

class EsewaService {
  constructor() {
    this.merchantCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
    this.secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    this.initiateUrl =
      process.env.ESEWA_INITIATE_URL ||
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    this.statusUrl =
      process.env.ESEWA_STATUS_URL ||
      "https://rc-epay.esewa.com.np/api/epay/transaction/status/";
    this.callbackBaseUrl =
      process.env.ESEWA_CALLBACK_BASE_URL || "http://192.168.29.235:5000";
    this.successUrl =
      process.env.ESEWA_SUCCESS_URL ||
      `${this.callbackBaseUrl}/api/payments/esewa/callback/success`;
    this.failureUrl =
      process.env.ESEWA_FAILURE_URL ||
      `${this.callbackBaseUrl}/api/payments/esewa/callback/failure`;
    this.appSuccessScheme = "kalkisenadrive://payment-success";
    this.appFailureScheme = "kalkisenadrive://payment-failure";
  }

  /**
   * Generates HMAC-SHA256 Base64 signature for payment initiation
   * Message: total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}
   */
  generateInitiateSignature(totalAmount, transactionUuid) {
    const formattedAmount = Number(totalAmount).toString();
    const message = `total_amount=${formattedAmount},transaction_uuid=${transactionUuid},product_code=${this.merchantCode}`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(message)
      .digest("base64");

    return { signature, signedFieldNames: "total_amount,transaction_uuid,product_code" };
  }

  /**
   * Directly contacts eSewa API and retrieves the official payment session booking URL
   */
  async createDirectPaymentSession(totalAmount, transactionUuid, callbackUrls = {}) {
    const successUrl = callbackUrls.successUrl || this.successUrl;
    const failureUrl = callbackUrls.failureUrl || this.failureUrl;

    const { signature, signedFieldNames } = this.generateInitiateSignature(
      totalAmount,
      transactionUuid
    );
    const amountStr = Number(totalAmount).toString();

    const formBody = new URLSearchParams({
      amount: amountStr,
      tax_amount: "0",
      total_amount: amountStr,
      transaction_uuid: transactionUuid,
      product_code: this.merchantCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature: signature,
    });

    try {
      const response = await fetch(this.initiateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
        redirect: "manual",
      });

      const location = response.headers.get("location");
      if (location) {
        return {
          success: true,
          bookingUrl: location,
        };
      }

      const bodyText = await response.text();
      return {
        success: false,
        error: `eSewa response status ${response.status}: ${bodyText}`,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Builds the official eSewa ePay v2 form payload
   */
  buildInitiatePayload(totalAmount, transactionUuid, customProps = {}, callbackUrls = {}) {
    const successUrl = callbackUrls.successUrl || this.successUrl;
    const failureUrl = callbackUrls.failureUrl || this.failureUrl;

    const { signature, signedFieldNames } = this.generateInitiateSignature(
      totalAmount,
      transactionUuid
    );

    const amountStr = Number(totalAmount).toString();

    return {
      action_url: this.initiateUrl,
      amount: amountStr,
      tax_amount: "0",
      total_amount: amountStr,
      transaction_uuid: transactionUuid,
      product_code: this.merchantCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature: signature,
      // Optional properties
      properties: customProps,
    };
  }

  /**
   * Builds official eSewa Intent App-to-App direct launch URIs and metadata
   */
  buildIntentPayload(totalAmount, transactionUuid, customProps = {}) {
    const { signature, signedFieldNames } = this.generateInitiateSignature(
      totalAmount,
      transactionUuid
    );
    const amountStr = Number(totalAmount).toString();

    // Standard eSewa deep link intent URI:
    // esewa://ea?amt=1000&txAmt=0&psc=0&pdc=0&scd=EPAYTEST&pid=KS-TXN-...&su=...&fu=...
    const intentUrl = `esewa://ea?amt=${encodeURIComponent(
      amountStr
    )}&txAmt=0&psc=0&pdc=0&scd=${encodeURIComponent(
      this.merchantCode
    )}&pid=${encodeURIComponent(transactionUuid)}&su=${encodeURIComponent(
      this.successUrl
    )}&fu=${encodeURIComponent(this.failureUrl)}`;

    // ePay v2 intent URI:
    const intentV2Url = `esewa://epay?amount=${encodeURIComponent(
      amountStr
    )}&tax_amount=0&total_amount=${encodeURIComponent(
      amountStr
    )}&transaction_uuid=${encodeURIComponent(
      transactionUuid
    )}&product_code=${encodeURIComponent(
      this.merchantCode
    )}&product_service_charge=0&product_delivery_charge=0&success_url=${encodeURIComponent(
      this.successUrl
    )}&failure_url=${encodeURIComponent(
      this.failureUrl
    )}&signed_field_names=${encodeURIComponent(
      signedFieldNames
    )}&signature=${encodeURIComponent(signature)}`;

    return {
      intentUrl,
      intentV2Url,
      androidPackage: "com.f1soft.esewa",
      iosScheme: "esewa://",
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.f1soft.esewa",
      marketUrl: "market://details?id=com.f1soft.esewa",
      appStoreUrl: "https://apps.apple.com/np/app/esewa/id1162483832",
      totalAmount: amountStr,
      transactionUuid,
      productCode: this.merchantCode,
      signature,
      signedFieldNames,
      properties: customProps,
    };
  }

  /**
   * Verifies payment directly with eSewa's Server-Side Status Check API
   * GET /api/epay/transaction/status/?product_code=...&total_amount=...&transaction_uuid=...
   */
  async verifyServerStatus(totalAmount, transactionUuid) {
    const formattedAmount = Number(totalAmount).toString();
    const url = `${this.statusUrl}?product_code=${encodeURIComponent(
      this.merchantCode
    )}&total_amount=${encodeURIComponent(
      formattedAmount
    )}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `eSewa status check returned HTTP error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Expected format:
      // { "product_code": "EPAYTEST", "transaction_uuid": "...", "total_amount": 1000, "status": "COMPLETE", "ref_id": "0001TS9" }
      const isComplete = data && data.status === "COMPLETE";
      const isAmountMatching =
        data &&
        Number(data.total_amount) === Number(totalAmount);
      const isUuidMatching =
        data && data.transaction_uuid === transactionUuid;

      return {
        verified: Boolean(isComplete && isAmountMatching && isUuidMatching),
        status: data.status || "UNKNOWN",
        refId: data.ref_id || "",
        data,
      };
    } catch (error) {
      console.error("[EsewaService] Verification error:", error);
      return {
        verified: false,
        status: "ERROR",
        refId: "",
        error: error.message,
      };
    }
  }

  /**
   * Validates HMAC-SHA256 signature from decoded response data
   */
  validateCallbackSignature(responseData) {
    try {
      if (!responseData || !responseData.signature || !responseData.signed_field_names) {
        return false;
      }

      const fields = responseData.signed_field_names.split(",");
      const messageParts = fields.map((f) => {
        const val = responseData[f] !== undefined ? responseData[f] : "";
        return `${f}=${val}`;
      });
      const message = messageParts.join(",");

      const expectedSignature = crypto
        .createHmac("sha256", this.secretKey)
        .update(message)
        .digest("base64");

      return expectedSignature === responseData.signature;
    } catch (err) {
      console.error("[EsewaService] Callback signature validation failed:", err);
      return false;
    }
  }

  /**
   * Decodes Base64 data param if provided by eSewa redirect
   */
  decodeBase64Response(base64String) {
    try {
      const jsonStr = Buffer.from(base64String, "base64").toString("utf-8");
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error("[EsewaService] Base64 decode failed:", err);
      return null;
    }
  }
}

module.exports = new EsewaService();
