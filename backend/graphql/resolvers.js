const {
    User,
    Accommodation,
    Review,
    Message,
    Favorite,
    Role,
    Permission,
    RolePermission,
    Advertisement,
    Report,
    Payment,
    Invoice
  } = require('../models');
  const { Op } = require('sequelize');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  
  // Custom scalar resolvers (ensure graphql-scalars is installed: npm install graphql-scalars)
  const { DateResolver, JSONResolver } = require('graphql-scalars');
  
  const resolvers = {
    Date: DateResolver,
    JSON: JSONResolver,
  
    Query: {
      users: async () => {
        return User.findAll();
      },
      user: async (_, { id }) => {
        return User.findByPk(id);
      },
      accommodations: async (_, args) => {
        const where = {};
        if (args.city) where.city = { [Op.like]: `%${args.city}%` };
        if (args.minPrice) where.price = { [Op.gte]: args.minPrice };
        if (args.maxPrice) where.price = { ...where.price, [Op.lte]: args.maxPrice };
        if (args.status) where.status = args.status;
        return Accommodation.findAll({ where, include: [{ model: User, as: 'accommodationOwner' }] });
      },
      accommodation: async (_, { id }) => {
        return Accommodation.findByPk(id, { include: [{ model: User, as: 'accommodationOwner' }] });
      },
      reviews: async () => {
        return Review.findAll({ include: [{ model: User, as: 'user' }, { model: Accommodation, as: 'accommodation' }] });
      },
      review: async (_, { id }) => {
        return Review.findByPk(id, { include: [{ model: User, as: 'user' }, { model: Accommodation, as: 'accommodation' }] });
      },
      messages: async () => {
        return Message.findAll({ include: [{ model: User, as: 'sender' }, { model: User, as: 'receiver' }] });
      },
      message: async (_, { id }) => {
        return Message.findByPk(id, { include: [{ model: User, as: 'sender' }, { model: User, as: 'receiver' }] });
      },
      favorites: async () => {
        return Favorite.findAll({ include: [{ model: User, as: 'user' }, { model: Accommodation, as: 'accommodation' }] });
      },
      favorite: async (_, { id }) => {
        return Favorite.findByPk(id, { include: [{ model: User, as: 'user' }, { model: Accommodation, as: 'accommodation' }] });
      },
      roles: async () => {
        return Role.findAll();
      },
      role: async (_, { id }) => {
        return Role.findByPk(id);
      },
      permissions: async () => {
        return Permission.findAll();
      },
      permission: async (_, { id }) => {
        return Permission.findByPk(id);
      },
      advertisements: async () => {
        return Advertisement.findAll({ include: [{ model: User, as: 'creator' }] });
      },
      advertisement: async (_, { id }) => {
        return Advertisement.findByPk(id, { include: [{ model: User, as: 'creator' }] });
      },
      reports: async () => {
        return Report.findAll({ include: [{ model: User, as: 'reporter' }, { model: User, as: 'resolvedBy' }] });
      },
      report: async (_, { id }) => {
        return Report.findByPk(id, { include: [{ model: User, as: 'reporter' }, { model: User, as: 'resolvedBy' }] });
      },
      payments: async () => {
        return Payment.findAll({ include: [{ model: User, as: 'user' }, { model: Accommodation, as: 'accommodation' }] });
      },
      payment: async (_, { id }) => {
        return Payment.findByPk(id, { include: [{ model: User, as: 'user' }, { model: Accommodation, as: 'accommodation' }] });
      },
      invoices: async () => {
        return Invoice.findAll({ include: [{ model: Payment, as: 'payment' }] });
      },
      invoice: async (_, { id }) => {
        return Invoice.findByPk(id, { include: [{ model: Payment, as: 'payment' }] });
      },
    },
  
    Mutation: {
      // User Mutations
      createUser: async (_, { username, email, password, role }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        return User.create({ username, email, password: hashedPassword, role });
      },
      updateUser: async (_, { id, username, email, password, role }) => {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);
        if (role) user.role = role;
        return user.save();
      },
      deleteUser: async (_, { id }) => {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        await user.destroy();
        return true;
      },
  
      // Accommodation Mutations
      createAccommodation: async (_, args) => {
        return Accommodation.create(args);
      },
      updateAccommodation: async (_, { id, ...args }) => {
        const accommodation = await Accommodation.findByPk(id);
        if (!accommodation) throw new Error('Accommodation not found');
        await accommodation.update(args);
        return accommodation;
      },
      deleteAccommodation: async (_, { id }) => {
        const accommodation = await Accommodation.findByPk(id);
        if (!accommodation) throw new Error('Accommodation not found');
        await accommodation.destroy();
        return true;
      },
  
      // Review Mutations
      createReview: async (_, args) => {
        return Review.create(args);
      },
      updateReview: async (_, { id, ...args }) => {
        const review = await Review.findByPk(id);
        if (!review) throw new Error('Review not found');
        await review.update(args);
        return review;
      },
      deleteReview: async (_, { id }) => {
        const review = await Review.findByPk(id);
        if (!review) throw new Error('Review not found');
        await review.destroy();
        return true;
      },
  
      // Message Mutations
      createMessage: async (_, args) => {
        return Message.create(args);
      },
      updateMessage: async (_, { id, ...args }) => {
        const message = await Message.findByPk(id);
        if (!message) throw new Error('Message not found');
        await message.update(args);
        return message;
      },
      deleteMessage: async (_, { id }) => {
        const message = await Message.findByPk(id);
        if (!message) throw new Error('Message not found');
        await message.destroy();
        return true;
      },
  
      // Favorite Mutations
      createFavorite: async (_, args) => {
        return Favorite.create(args);
      },
      deleteFavorite: async (_, { id }) => {
        const favorite = await Favorite.findByPk(id);
        if (!favorite) throw new Error('Favorite not found');
        await favorite.destroy();
        return true;
      },
  
      // Role Mutations
      createRole: async (_, args) => {
        return Role.create(args);
      },
      updateRole: async (_, { id, ...args }) => {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');
        await role.update(args);
        return role;
      },
      deleteRole: async (_, { id }) => {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');
        await role.destroy();
        return true;
      },
  
      // Permission Mutations
      createPermission: async (_, args) => {
        return Permission.create(args);
      },
      updatePermission: async (_, { id, ...args }) => {
        const permission = await Permission.findByPk(id);
        if (!permission) throw new Error('Permission not found');
        await permission.update(args);
        return permission;
      },
      deletePermission: async (_, { id }) => {
        const permission = await Permission.findByPk(id);
        if (!permission) throw new Error('Permission not found');
        await permission.destroy();
        return true;
      },
  
      // RolePermission Mutations
      createRolePermission: async (_, args) => {
        return RolePermission.create(args);
      },
      deleteRolePermission: async (_, { id }) => {
        const rolePermission = await RolePermission.findByPk(id);
        if (!rolePermission) throw new Error('RolePermission not found');
        await rolePermission.destroy();
        return true;
      },
  
      // Advertisement Mutations
      createAdvertisement: async (_, args) => {
        return Advertisement.create(args);
      },
      updateAdvertisement: async (_, { id, ...args }) => {
        const advertisement = await Advertisement.findByPk(id);
        if (!advertisement) throw new Error('Advertisement not found');
        await advertisement.update(args);
        return advertisement;
      },
      deleteAdvertisement: async (_, { id }) => {
        const advertisement = await Advertisement.findByPk(id);
        if (!advertisement) throw new Error('Advertisement not found');
        await advertisement.destroy();
        return true;
      },
  
      // Report Mutations
      createReport: async (_, args) => {
        return Report.create(args);
      },
      updateReport: async (_, { id, ...args }) => {
        const report = await Report.findByPk(id);
        if (!report) throw new Error('Report not found');
        await report.update(args);
        return report;
      },
      deleteReport: async (_, { id }) => {
        const report = await Report.findByPk(id);
        if (!report) throw new Error('Report not found');
        await report.destroy();
        return true;
      },
  
      // Payment Mutations
      createPayment: async (_, args) => {
        return Payment.create(args);
      },
      updatePayment: async (_, { id, ...args }) => {
        const payment = await Payment.findByPk(id);
        if (!payment) throw new Error('Payment not found');
        await payment.update(args);
        return payment;
      },
      deletePayment: async (_, { id }) => {
        const payment = await Payment.findByPk(id);
        if (!payment) throw new Error('Payment not found');
        await payment.destroy();
        return true;
      },
  
      // Invoice Mutations
      createInvoice: async (_, args) => {
        return Invoice.create(args);
      },
      updateInvoice: async (_, { id, ...args }) => {
        const invoice = await Invoice.findByPk(id);
        if (!invoice) throw new Error('Invoice not found');
        await invoice.update(args);
        return invoice;
      },
      deleteInvoice: async (_, { id }) => {
        const invoice = await Invoice.findByPk(id);
        if (!invoice) throw new Error('Invoice not found');
        await invoice.destroy();
        return true;
      },
    },
  };
  
  module.exports = resolvers;