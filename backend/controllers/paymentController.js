const paymentService = require('../services/paymentService');
const loyaltyService = require('../services/loyaltyService');
const asyncHandler = require('express-async-handler');
const Accommodation = require('../models/Accommodation');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new payment
exports.createPayment = asyncHandler(async (req, res) => {
  const { accommodationId, type, paymentMethod, pointsToRedeem } = req.body;
  const userId = req.user.id;

  // Get accommodation details
  const accommodation = await Accommodation.findByPk(accommodationId);
  if (!accommodation) {
    return res.status(404).json({ message: 'Accommodation not found' });
  }

  // Calculate amount based on payment type
  let amount;
  if (type === 'deposit') {
    amount = accommodation.depositAmount;
  } else if (type === 'rent') {
    amount = accommodation.price;
  } else {
    return res.status(400).json({ message: 'Invalid payment type' });
  }

  // Handle loyalty points redemption
  let finalAmount = amount;
  let discountNotes = '';
  if (pointsToRedeem && pointsToRedeem > 0) {
    try {
      const { discountAmount } = await loyaltyService.redeemPointsForDiscount(userId, pointsToRedeem);
      finalAmount = Math.max(0, amount - discountAmount);
      discountNotes = `Applied ${pointsToRedeem} points for a discount of ${discountAmount.toLocaleString('vi-VN')}đ.`;
    } catch (error) {
      // If redemption fails (e.g., insufficient points), fail the whole transaction.
      return res.status(400).json({ message: error.message });
    }
  }

  // Create payment record
  const payment = await paymentService.createPayment({
    userId,
    accommodationId,
    amount: finalAmount,
    type,
    paymentMethod,
    notes: discountNotes,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due in 24 hours
  });

  // Generate payment URL based on payment method
  let paymentUrl;
  if (paymentMethod === 'vnpay') {
    paymentUrl = await paymentService.createVNPayPayment(payment);
  } else if (paymentMethod === 'momo') {
    paymentUrl = await paymentService.createMoMoPayment(payment);
  } else if (paymentMethod === 'zalopay') {
    paymentUrl = await paymentService.createZaloPayPayment(payment);
  } else {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  res.status(201).json({
    message: 'Payment created successfully',
    payment,
    paymentUrl
  });
});

// Handle payment callback
exports.handlePaymentCallback = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.params;
  const callbackData = req.query;

  const payment = await paymentService.handlePaymentCallback(paymentMethod, callbackData);

  if (payment) {
    // Update accommodation deposit status if it's a deposit payment
    if (payment.type === 'deposit') {
      await Accommodation.update(
        { depositStatus: 'paid' },
        { where: { id: payment.accommodationId } }
      );
    }

    res.redirect(`/payment/success?paymentId=${payment.id}`);
  } else {
    res.redirect('/payment/failed');
  }
});

// Handle ZaloPay IPN callback
exports.handleZaloPayCallback = asyncHandler(async (req, res) => {
  const result = await paymentService.handleZaloPayCallback(req.body);

  // The service now returns an object { payment, response } or just the response
  if (result && result.payment) {
    const payment = result.payment;
    // Update accommodation deposit status if it's a deposit payment
    if (payment.type === 'deposit') {
      await Accommodation.update(
        { depositStatus: 'paid' },
        { where: { id: payment.accommodationId } }
      );
    }
  }
  
  // Respond to ZaloPay
  if (result && result.response) {
    return res.json(result.response);
  }
  
  // Default failure response if something went wrong
  return res.json({ return_code: 2, return_message: "failure" });
});

// Get payment details
exports.getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id;

  const payment = await Payment.findOne({
    where: {
      id: paymentId,
      userId
    },
    include: [
      {
        model: require('../models/Accommodation'),
        as: 'accommodation',
        attributes: ['title', 'address']
      }
    ]
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  res.json(payment);
});

// Get user's payment history
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const payments = await Payment.findAndCountAll({
    where: { userId },
    include: [
      {
        model: require('../models/Accommodation'),
        as: 'accommodation',
        attributes: ['title', 'address']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (page - 1) * limit
  });

  res.json({
    payments: payments.rows,
    total: payments.count,
    currentPage: parseInt(page),
    totalPages: Math.ceil(payments.count / limit)
  });
});

// Get payment invoice
exports.getPaymentInvoice = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id;

  const payment = await Payment.findOne({
    where: {
      id: paymentId,
      userId
    },
    include: [
      {
        model: require('../models/Invoice'),
        as: 'invoice'
      }
    ]
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (!payment.invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  res.json(payment.invoice);
});

// Download invoice PDF
exports.downloadInvoice = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id;

  const payment = await Payment.findOne({
    where: {
      id: paymentId,
      userId
    },
    include: [
      {
        model: require('../models/Invoice'),
        as: 'invoice'
      },
      {
        model: require('../models/Accommodation'),
        as: 'accommodation',
        attributes: ['title', 'address']
      }
    ]
  });

  if (!payment || !payment.invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  // Tạo file PDF động
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${payment.invoice.invoiceNumber}.pdf`);

  // Header
  doc.fontSize(20).text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Số hóa đơn: ${payment.invoice.invoiceNumber}`);
  doc.text(`Ngày phát hành: ${payment.invoice.issueDate.toLocaleDateString('vi-VN')}`);
  doc.text(`Hạn thanh toán: ${payment.invoice.dueDate.toLocaleDateString('vi-VN')}`);
  doc.text(`Trạng thái: ${payment.invoice.status}`);
  doc.moveDown();

  // Thông tin khách hàng
  doc.fontSize(14).text('Thông tin khách hàng:', { underline: true });
  doc.fontSize(12).text(`Tên: ${req.user.fullName || req.user.username || ''}`);
  doc.text(`Email: ${req.user.email || ''}`);
  doc.moveDown();

  // Thông tin nhà trọ
  doc.fontSize(14).text('Thông tin nhà trọ:', { underline: true });
  doc.fontSize(12).text(`Tên nhà trọ: ${payment.accommodation?.title || ''}`);
  doc.text(`Địa chỉ: ${payment.accommodation?.address || ''}`);
  doc.moveDown();

  // Bảng dịch vụ
  doc.fontSize(14).text('Chi tiết dịch vụ:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  const items = payment.invoice.items || [];
  doc.text('Mô tả', 50, doc.y, { continued: true });
  doc.text('Số lượng', 250, doc.y, { continued: true });
  doc.text('Đơn giá', 350, doc.y, { continued: true });
  doc.text('Thành tiền', 450, doc.y);
  doc.moveDown(0.5);
  items.forEach(item => {
    doc.text(item.description, 50, doc.y, { continued: true });
    doc.text(item.quantity.toString(), 250, doc.y, { continued: true });
    doc.text(item.unitPrice.toLocaleString('vi-VN'), 350, doc.y, { continued: true });
    doc.text(item.amount.toLocaleString('vi-VN'), 450, doc.y);
  });
  doc.moveDown();

  // Tổng tiền
  doc.fontSize(12).text(`Tạm tính: ${Number(payment.invoice.subtotal).toLocaleString('vi-VN')} VND`, { align: 'right' });
  doc.text(`Thuế: ${Number(payment.invoice.tax).toLocaleString('vi-VN')} VND`, { align: 'right' });
  doc.fontSize(14).text(`Tổng cộng: ${Number(payment.invoice.total).toLocaleString('vi-VN')} VND`, { align: 'right', underline: true });
  doc.moveDown();

  // Ghi chú
  if (payment.invoice.notes) {
    doc.fontSize(12).text(`Ghi chú: ${payment.invoice.notes}`);
  }

  doc.end();
  doc.pipe(res);
}); 