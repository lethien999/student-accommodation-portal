const crypto = require('crypto');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinaryConfig');
const { Payment, Invoice, User, Accommodation } = require('../models');
const { Op } = require('sequelize');
const loyaltyService = require('./loyaltyService');

// Helper to upload a buffer to Cloudinary
const uploadPDFStream = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    stream.end(buffer);
  });
};

class PaymentService {
  constructor() {
    this.vnpayConfig = {
      vnp_TmnCode: process.env.VNP_TMN_CODE,
      vnp_HashSecret: process.env.VNP_HASH_SECRET,
      vnp_Url: process.env.VNP_URL,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL
    };

    this.momoConfig = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: process.env.MOMO_ENDPOINT
    };

    this.zalopayConfig = {
      app_id: process.env.ZALOPAY_APP_ID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create" // Sandbox endpoint
    };
  }

  // Create payment record
  async createPayment(data) {
    return await Payment.create(data);
  }

  // Generate VNPay payment URL
  async createVNPayPayment(payment) {
    const date = new Date();
    const createDate = date.toISOString().split('T')[0].split('-').join('');

    const orderId = `PAY${payment.id}${Date.now()}`;
    const amount = Math.round(payment.amount * 100); // Convert to smallest currency unit

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount,
      vnp_ReturnUrl: this.vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate
    };

    // Sort params alphabetically
    const sortedParams = this.sortObject(vnpParams);
    
    // Create signature
    const signData = this.createVNPaySignature(sortedParams);
    vnpParams.vnp_SecureHash = signData;

    // Create payment URL
    const paymentUrl = `${this.vnpayConfig.vnp_Url}?${this.createQueryString(vnpParams)}`;

    // Update payment record
    await payment.update({
      paymentUrl,
      transactionId: orderId,
      paymentDetails: vnpParams
    });

    return paymentUrl;
  }

  // Generate MoMo payment URL
  async createMoMoPayment(payment) {
    const orderId = `PAY${payment.id}${Date.now()}`;
    const amount = Math.round(payment.amount * 100); // Convert to smallest currency unit

    const requestId = orderId;
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const redirectUrl = process.env.MOMO_RETURN_URL;
    const ipnUrl = process.env.MOMO_IPN_URL;
    const extraData = '';

    // Create signature
    const rawSignature = `partnerCode=${this.momoConfig.partnerCode}&accessKey=${this.momoConfig.accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&redirectUrl=${redirectUrl}&ipnUrl=${ipnUrl}&extraData=${extraData}`;
    const signature = crypto.createHmac('sha256', this.momoConfig.secretKey).update(rawSignature).digest('hex');

    const requestBody = {
      partnerCode: this.momoConfig.partnerCode,
      accessKey: this.momoConfig.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType: 'captureWallet',
      signature
    };

    try {
      const response = await axios.post(this.momoConfig.endpoint, requestBody);
      
      if (response.data.resultCode === 0) {
        // Update payment record
        await payment.update({
          paymentUrl: response.data.payUrl,
          transactionId: orderId,
          paymentDetails: response.data
        });

        return response.data.payUrl;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(`MoMo payment creation failed: ${error.message}`);
    }
  }

  // Generate ZaloPay payment URL
  async createZaloPayPayment(payment) {
    const app_trans_id = `${new Date().getFullYear().toString().substr(-2)}${new Date().getMonth() + 1}${new Date().getDate()}_${payment.id}_${Date.now()}`;
    const order = {
      app_id: this.zalopayConfig.app_id,
      app_trans_id,
      app_user: `user_${payment.userId}`,
      app_time: Date.now(),
      amount: Math.round(payment.amount), // ZaloPay uses VND
      item: JSON.stringify([{ "name": `Payment for Order #${payment.id}` }]),
      description: `Thanh toan cho don hang #${payment.id}`,
      embed_data: JSON.stringify({
        redirecturl: process.env.ZALOPAY_REDIRECT_URL
      }),
      bank_code: "zalopayapp",
    };

    // Create signature
    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = crypto.createHmac('sha256', this.zalopayConfig.key1).update(data).digest('hex');

    try {
      const response = await axios.post(this.zalopayConfig.endpoint, null, { params: order });
      
      if (response.data.return_code === 1) {
        await payment.update({
          paymentUrl: response.data.order_url,
          transactionId: app_trans_id,
          paymentDetails: response.data
        });
        return response.data.order_url;
      } else {
        throw new Error(`ZaloPay Error: ${response.data.return_message}`);
      }
    } catch (error) {
      console.error("ZaloPay creation error:", error.response ? error.response.data : error.message);
      throw new Error(`ZaloPay payment creation failed: ${error.message}`);
    }
  }

  // Handle payment callback
  async handlePaymentCallback(paymentMethod, callbackData) {
    if (paymentMethod === 'vnpay') {
      return await this.handleVNPayCallback(callbackData);
    } else if (paymentMethod === 'momo') {
      return await this.handleMoMoCallback(callbackData);
    } else if (paymentMethod === 'zalopay') {
      // Note: ZaloPay is handled by a separate controller due to POST method,
      // but if it were ever routed here, this would be the logic.
      const result = await this.handleZaloPayCallback(callbackData);
      return result.payment; // Extract the payment object
    }
    return null;
  }

  // Centralized method for post-payment success actions
  async _onPaymentSuccess(payment) {
    console.log(`Processing successful payment ${payment.id}...`);
    try {
      await this.generateInvoice(payment);
      await loyaltyService.addPointsForPayment(payment);
      console.log(`Successfully processed post-payment actions for payment ${payment.id}.`);
    } catch (error) {
      console.error(`Error during post-payment processing for payment ${payment.id}:`, error);
      // Depending on requirements, you might want to flag this payment for manual review.
    }
  }

  // Handle VNPay callback
  async handleVNPayCallback(callbackData) {
    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionStatus } = callbackData;
    
    if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
      const payment = await Payment.findOne({
        where: { transactionId: vnp_TxnRef }
      });

      if (payment && payment.status !== 'completed') {
        await payment.update({
          status: 'completed',
          paidAt: new Date()
        });
        await this._onPaymentSuccess(payment);
        return payment;
      }
    }

    return null;
  }

  // Handle MoMo callback
  async handleMoMoCallback(callbackData) {
    const { orderId, resultCode } = callbackData;
    
    if (resultCode === 0) {
      const payment = await Payment.findOne({
        where: { transactionId: orderId }
      });

      if (payment && payment.status !== 'completed') {
        await payment.update({
          status: 'completed',
          paidAt: new Date()
        });
        await this._onPaymentSuccess(payment);
        return payment;
      }
    }

    return null;
  }

  // Handle ZaloPay callback (IPN)
  async handleZaloPayCallback(callbackData) {
    const { data, mac } = callbackData;

    // Verify mac
    const calculatedMac = crypto.createHmac('sha256', this.zalopayConfig.key2).update(data).digest('hex');

    if (calculatedMac !== mac) {
      console.error('ZaloPay callback: Invalid MAC');
      // In production, you might want to return an error response to ZaloPay
      return { return_code: -1, return_message: "mac not equal" };
    }
    
    const result = JSON.parse(data);

    if (result.return_code === 1) { // 1 means success
      const payment = await Payment.findOne({
        where: { transactionId: result.app_trans_id }
      });

      if (payment && payment.status !== 'completed') {
        await payment.update({
          status: 'completed',
          paidAt: new Date(),
          notes: `Paid via ZaloPay. ZPTranstoken: ${result.zp_trans_token}`
        });
        await this._onPaymentSuccess(payment);
        // After updating, return the response ZaloPay expects
        return { payment, response: { return_code: 1, return_message: "success" } };
      } else if (payment) { // Already completed
        return { payment, response: { return_code: 1, return_message: "success" } };
      }
    }
    
    // If something failed or payment already processed
    return { response: { return_code: 2, return_message: "failure" } };
  }

  // Generate invoice for completed payment
  async generateInvoice(payment) {
    const invoiceNumber = `INV${Date.now()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    const items = [{
      description: `Payment for ${payment.type}`,
      quantity: 1,
      unitPrice: payment.amount,
      amount: payment.amount
    }];

    const invoice = await Invoice.create({
      paymentId: payment.id,
      invoiceNumber,
      issueDate: new Date(),
      dueDate,
      status: 'issued',
      items,
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount
    });

    // Generate PDF invoice
    const pdfUrl = await this.generatePDFInvoice(invoice, payment);
    await invoice.update({ pdfUrl });

    return invoice;
  }

  // Generate PDF invoice
  async generatePDFInvoice(invoice, payment) {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
        try {
          const result = await uploadPDFStream(pdfBuffer, {
            folder: 'invoices',
            public_id: `invoice-${invoice.invoiceNumber}`,
            resource_type: 'raw' // Use 'raw' for non-image files like PDFs
          });
          resolve(result.secure_url);
        } catch (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        }
      });

      // --- PDF Content ---
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica');
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Payment ID: ${payment.id}`);
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('vi-VN')}`);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('vi-VN')}`);
      doc.moveDown();
      doc.text(`Amount: ${payment.amount.toLocaleString('vi-VN')} VND`);
      doc.text(`Payment Method: ${payment.paymentMethod.toUpperCase()}`);
      // --- End PDF Content ---

      doc.end();
    });
  }

  // Get pending payments that need reminders
  async getPendingPaymentsForReminder() {
    const now = new Date();
    const reminderDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    return await Payment.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.lte]: reminderDate
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'username']
        },
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['title']
        }
      ]
    });
  }

  // Helper methods
  sortObject(obj) {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
  }

  createVNPaySignature(params) {
    const signData = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return crypto
      .createHmac('sha512', this.vnpayConfig.vnp_HashSecret)
      .update(signData)
      .digest('hex');
  }

  createQueryString(params) {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  }
}

module.exports = new PaymentService(); 