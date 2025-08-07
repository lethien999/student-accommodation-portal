const { RentalContract, Accommodation, User } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');

// Lấy danh sách hợp đồng
const getRentalContracts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, accommodationId, tenantId, landlordId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (accommodationId) where.accommodationId = accommodationId;
    if (tenantId) where.tenantId = tenantId;
    if (landlordId) where.landlordId = landlordId;

    const contracts = await RentalContract.findAndCountAll({
      where,
      include: [
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['id', 'title', 'address', 'price']
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'username', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      contracts: contracts.rows,
      total: contracts.count,
      totalPages: Math.ceil(contracts.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting rental contracts:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách hợp đồng' });
  }
});

// Lấy các hợp đồng đang hoạt động của người thuê hiện tại
const getMyActiveContracts = asyncHandler(async (req, res) => {
    const contracts = await RentalContract.findAll({
        where: {
            tenantId: req.user.id,
            status: 'active'
        },
        include: [
            {
              model: Accommodation,
              as: 'accommodation',
              attributes: ['id', 'title']
            }
        ]
    });
    res.json(contracts);
});

// Lấy chi tiết hợp đồng
const getRentalContract = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await RentalContract.findByPk(id, {
      include: [
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['id', 'title', 'description', 'address', 'price', 'images']
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'username', 'email', 'phoneNumber']
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'username', 'email', 'phoneNumber']
        }
      ]
    });

    if (!contract) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Error getting rental contract:', error);
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết hợp đồng' });
  }
});

// Tạo hợp đồng mới
const createRentalContract = async (req, res) => {
  try {
    const {
      accommodationId,
      tenantId,
      landlordId,
      startDate,
      endDate,
      deposit,
      totalAmount,
      note
    } = req.body;

    // Kiểm tra xem accommodation có đang được thuê không
    const accommodation = await Accommodation.findByPk(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ error: 'Không tìm thấy nhà trọ' });
    }

    if (accommodation.status === 'rented') {
      return res.status(400).json({ error: 'Nhà trọ đã được thuê' });
    }

    // Kiểm tra xem tenant có hợp đồng đang hoạt động không
    const existingContract = await RentalContract.findOne({
      where: {
        tenantId,
        status: 'active',
        [Op.or]: [
          {
            startDate: { [Op.lte]: new Date(endDate) },
            endDate: { [Op.gte]: new Date(startDate) }
          }
        ]
      }
    });

    if (existingContract) {
      return res.status(400).json({ error: 'Người thuê đã có hợp đồng trong thời gian này' });
    }

    const contract = await RentalContract.create({
      accommodationId,
      tenantId,
      landlordId,
      startDate,
      endDate,
      deposit,
      totalAmount,
      note,
      status: 'pending'
    });

    // Cập nhật trạng thái accommodation
    await accommodation.update({ status: 'rented' });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating rental contract:', error);
    res.status(500).json({ error: 'Lỗi khi tạo hợp đồng' });
  }
};

// Cập nhật hợp đồng
const updateRentalContract = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      startDate,
      endDate,
      deposit,
      totalAmount,
      status,
      note
    } = req.body;

    const contract = await RentalContract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    }

    // Nếu thay đổi trạng thái từ active sang terminated
    if (contract.status === 'active' && status === 'terminated') {
      const accommodation = await Accommodation.findByPk(contract.accommodationId);
      if (accommodation) {
        await accommodation.update({ status: 'available' });
      }
    }

    await contract.update({
      startDate,
      endDate,
      deposit,
      totalAmount,
      status,
      note
    });

    res.json(contract);
  } catch (error) {
    console.error('Error updating rental contract:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật hợp đồng' });
  }
};

// Xóa hợp đồng
const deleteRentalContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await RentalContract.findByPk(id);
    
    if (!contract) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    }

    // Nếu hợp đồng đang active, cập nhật trạng thái accommodation
    if (contract.status === 'active') {
      const accommodation = await Accommodation.findByPk(contract.accommodationId);
      if (accommodation) {
        await accommodation.update({ status: 'available' });
      }
    }

    await contract.destroy();
    res.json({ message: 'Đã xóa hợp đồng thành công' });
  } catch (error) {
    console.error('Error deleting rental contract:', error);
    res.status(500).json({ error: 'Lỗi khi xóa hợp đồng' });
  }
};

// Upload file hợp đồng
const uploadContractFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { contractFile } = req.body;

    const contract = await RentalContract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
    }

    await contract.update({ contractFile });
    res.json(contract);
  } catch (error) {
    console.error('Error uploading contract file:', error);
    res.status(500).json({ error: 'Lỗi khi upload file hợp đồng' });
  }
};

// Sinh và tải hợp đồng PDF
const downloadContractPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contract = await RentalContract.findByPk(id, {
    include: [
      { model: Accommodation, as: 'accommodation', attributes: ['id', 'title', 'description', 'address', 'price', 'images'] },
      { model: User, as: 'tenant', attributes: ['id', 'username', 'email', 'phoneNumber', 'fullName'] },
      { model: User, as: 'landlord', attributes: ['id', 'username', 'email', 'phoneNumber', 'fullName'] }
    ]
  });
  if (!contract) {
    return res.status(404).json({ error: 'Không tìm thấy hợp đồng' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.id}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Tiêu đề
  doc.fontSize(20).text('HỢP ĐỒNG THUÊ NHÀ', { align: 'center' });
  doc.moveDown();

  // Thông tin hợp đồng
  doc.fontSize(12).text(`Mã hợp đồng: ${contract.id}`);
  doc.text(`Ngày bắt đầu: ${contract.startDate.toLocaleDateString('vi-VN')}`);
  doc.text(`Ngày kết thúc: ${contract.endDate.toLocaleDateString('vi-VN')}`);
  doc.text(`Trạng thái: ${contract.status}`);
  doc.moveDown();

  // Thông tin bên cho thuê
  doc.fontSize(14).text('Bên cho thuê (Chủ nhà):', { underline: true });
  doc.fontSize(12).text(`Họ tên: ${contract.landlord?.fullName || contract.landlord?.username || ''}`);
  doc.text(`Email: ${contract.landlord?.email || ''}`);
  doc.text(`SĐT: ${contract.landlord?.phoneNumber || ''}`);
  doc.moveDown();

  // Thông tin bên thuê
  doc.fontSize(14).text('Bên thuê (Người thuê):', { underline: true });
  doc.fontSize(12).text(`Họ tên: ${contract.tenant?.fullName || contract.tenant?.username || ''}`);
  doc.text(`Email: ${contract.tenant?.email || ''}`);
  doc.text(`SĐT: ${contract.tenant?.phoneNumber || ''}`);
  doc.moveDown();

  // Thông tin nhà trọ
  doc.fontSize(14).text('Thông tin nhà trọ:', { underline: true });
  doc.fontSize(12).text(`Tên nhà trọ: ${contract.accommodation?.title || ''}`);
  doc.text(`Địa chỉ: ${contract.accommodation?.address || ''}`);
  doc.text(`Giá thuê: ${Number(contract.accommodation?.price).toLocaleString('vi-VN')} VND/tháng`);
  doc.moveDown();

  // Điều khoản
  doc.fontSize(14).text('Điều khoản hợp đồng:', { underline: true });
  doc.fontSize(12).text(`Tiền đặt cọc: ${Number(contract.deposit).toLocaleString('vi-VN')} VND`);
  doc.text(`Tổng số tiền thuê: ${Number(contract.totalAmount).toLocaleString('vi-VN')} VND`);
  doc.text(`Ghi chú: ${contract.note || 'Không có'}`);
  doc.moveDown();

  doc.text('1. Bên thuê có trách nhiệm thanh toán đúng hạn và giữ gìn tài sản nhà trọ.');
  doc.text('2. Bên cho thuê đảm bảo quyền sử dụng hợp pháp cho bên thuê trong thời gian hợp đồng.');
  doc.text('3. Hai bên cam kết thực hiện đúng các điều khoản đã ghi trong hợp đồng.');
  doc.moveDown();

  // Chữ ký số (giả lập)
  doc.fontSize(14).text('Chữ ký số:', { underline: true });
  doc.fontSize(12).text('Bên cho thuê (ký, ghi rõ họ tên):');
  doc.text(contract.landlord?.fullName || contract.landlord?.username || '');
  doc.moveDown();
  doc.text('Bên thuê (ký, ghi rõ họ tên):');
  doc.text(contract.tenant?.fullName || contract.tenant?.username || '');
  doc.moveDown();

  doc.text('--- Hợp đồng được tạo tự động bởi hệ thống Student Accommodation Portal ---', { align: 'center', oblique: true });

  doc.end();
  doc.pipe(res);
});

module.exports = {
  getRentalContracts,
  getRentalContract,
  createRentalContract,
  updateRentalContract,
  deleteRentalContract,
  uploadContractFile,
  getMyActiveContracts,
  downloadContractPDF
}; 