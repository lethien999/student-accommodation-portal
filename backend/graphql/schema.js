const { buildSchema } = require('graphql');

const schema = buildSchema(`
  scalar Date
  scalar JSON

  type User {
    id: Int!
    username: String!
    email: String!
    role: String!
    isVerifiedLandlord: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  type Accommodation {
    id: Int!
    title: String!
    description: String!
    price: Float!
    address: String!
    city: String!
    state: String!
    zipCode: String!
    latitude: Float
    longitude: Float
    amenities: JSON
    images: JSON
    status: String!
    depositAmount: Float
    depositStatus: String
    depositDueDate: Date
    averageRating: Float
    numberOfReviews: Int
    ownerId: Int!
    owner: User
    createdAt: Date!
    updatedAt: Date!
  }

  type Review {
    id: Int!
    rating: Int!
    comment: String!
    images: JSON
    userId: Int!
    user: User
    accommodationId: Int!
    accommodation: Accommodation
    createdAt: Date!
    updatedAt: Date!
  }

  type Message {
    id: Int!
    senderId: Int!
    sender: User
    receiverId: Int!
    receiver: User
    content: String!
    isRead: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  type Favorite {
    id: Int!
    userId: Int!
    user: User
    accommodationId: Int!
    accommodation: Accommodation
    createdAt: Date!
    updatedAt: Date!
  }

  type Role {
    id: Int!
    name: String!
    description: String
    isSystem: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  type Permission {
    id: Int!
    name: String!
    description: String
    module: String!
    action: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type RolePermission {
    id: Int!
    roleId: Int!
    role: Role
    permissionId: Int!
    permission: Permission
    createdAt: Date!
    updatedAt: Date!
  }

  type Advertisement {
    id: Int!
    title: String!
    description: String
    imageUrl: String
    targetUrl: String
    startDate: Date!
    endDate: Date!
    status: String!
    userId: Int!\n    creator: User
    createdAt: Date!
    updatedAt: Date!
  }

  type Report {
    id: Int!
    reporterId: Int!
    reporter: User
    reportedItemId: Int!
    reportedItemType: String!
    reason: String!
    description: String
    status: String!
    resolvedById: Int
    resolvedBy: User
    resolvedAt: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type Payment {
    id: Int!
    userId: Int!
    user: User
    accommodationId: Int!
    accommodation: Accommodation
    amount: Float!
    status: String!
    paymentMethod: String!
    paymentDate: Date
    dueDate: Date!
    transactionId: String
    notes: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Invoice {
    id: Int!
    paymentId: Int!
    payment: Payment
    invoiceNumber: String!
    issueDate: Date!
    dueDate: Date!
    status: String!
    items: JSON!
    subtotal: Float!
    tax: Float!
    total: Float!
    notes: String
    pdfUrl: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Query {
    users: [User]
    user(id: Int!): User
    accommodations: [Accommodation]
    accommodation(id: Int!): Accommodation
    reviews: [Review]
    review(id: Int!): Review
    messages: [Message]
    message(id: Int!): Message
    favorites: [Favorite]
    favorite(id: Int!): Favorite
    roles: [Role]
    role(id: Int!): Role
    permissions: [Permission]
    permission(id: Int!): Permission
    advertisements: [Advertisement]
    advertisement(id: Int!): Advertisement
    reports: [Report]
    report(id: Int!): Report
    payments: [Payment]
    payment(id: Int!): Payment
    invoices: [Invoice]
    invoice(id: Int!): Invoice
  }

  type Mutation {
    # User Mutations
    createUser(username: String!, email: String!, password: String!, role: String): User
    updateUser(id: Int!, username: String, email: String, password: String, role: String): User
    deleteUser(id: Int!): Boolean

    # Accommodation Mutations
    createAccommodation(
      title: String!
      description: String!
      price: Float!
      address: String!
      city: String!
      state: String!
      zipCode: String!
      latitude: Float
      longitude: Float
      amenities: JSON
      images: JSON
      status: String
      depositAmount: Float
      depositStatus: String
      depositDueDate: Date
      ownerId: Int!
    ): Accommodation
    updateAccommodation(
      id: Int!
      title: String
      description: String
      price: Float
      address: String
      city: String
      state: String
      zipCode: String
      latitude: Float
      longitude: Float
      amenities: JSON
      images: JSON
      status: String
      depositAmount: Float
      depositStatus: String
      depositDueDate: Date
    ): Accommodation
    deleteAccommodation(id: Int!): Boolean

    # Review Mutations
    createReview(accommodationId: Int!, rating: Int!, comment: String!, images: JSON): Review
    updateReview(id: Int!, rating: Int, comment: String, images: JSON): Review
    deleteReview(id: Int!): Boolean

    # Message Mutations
    createMessage(senderId: Int!, receiverId: Int!, content: String!): Message
    updateMessage(id: Int!, content: String, isRead: Boolean): Message
    deleteMessage(id: Int!): Boolean

    # Favorite Mutations
    createFavorite(userId: Int!, accommodationId: Int!): Favorite
    deleteFavorite(id: Int!): Boolean

    # Role Mutations
    createRole(name: String!, description: String, isSystem: Boolean): Role
    updateRole(id: Int!, name: String, description: String, isSystem: Boolean): Role
    deleteRole(id: Int!): Boolean

    # Permission Mutations
    createPermission(name: String!, description: String, module: String!, action: String!): Permission
    updatePermission(id: Int!, name: String, description: String, module: String, action: String): Permission
    deletePermission(id: Int!): Boolean

    # RolePermission Mutations
    createRolePermission(roleId: Int!, permissionId: Int!): RolePermission
    deleteRolePermission(id: Int!): Boolean

    # Advertisement Mutations
    createAdvertisement(
      title: String!
      description: String
      imageUrl: String
      targetUrl: String
      startDate: Date!
      endDate: Date!
      status: String
      userId: Int!
    ): Advertisement
    updateAdvertisement(
      id: Int!
      title: String
      description: String
      imageUrl: String
      targetUrl: String
      startDate: Date
      endDate: Date
      status: String
    ): Advertisement
    deleteAdvertisement(id: Int!): Boolean

    # Report Mutations
    createReport(
      reporterId: Int!\n      reportedItemId: Int!
      reportedItemType: String!
      reason: String!
      description: String
      status: String
      resolvedById: Int
      resolvedAt: Date
    ): Report
    updateReport(
      id: Int!
      reportedItemId: Int
      reportedItemType: String
      reason: String
      description: String
      status: String
      resolvedById: Int
      resolvedAt: Date
    ): Report
    deleteReport(id: Int!): Boolean

    # Payment Mutations
    createPayment(
      userId: Int!
      accommodationId: Int!
      amount: Float!
      status: String
      paymentMethod: String!
      paymentDate: Date
      dueDate: Date!
      transactionId: String
      notes: String
    ): Payment
    updatePayment(
      id: Int!
      userId: Int
      accommodationId: Int
      amount: Float
      status: String
      paymentMethod: String
      paymentDate: Date
      dueDate: Date
      transactionId: String
      notes: String
    ): Payment
    deletePayment(id: Int!): Boolean

    # Invoice Mutations
    createInvoice(
      paymentId: Int!
      invoiceNumber: String!
      issueDate: Date!
      dueDate: Date!
      status: String
      items: JSON!
      subtotal: Float!
      tax: Float!
      total: Float!
      notes: String
      pdfUrl: String
    ): Invoice
    updateInvoice(
      id: Int!
      paymentId: Int
      invoiceNumber: String
      issueDate: Date
      dueDate: Date
      status: String
      items: JSON
      subtotal: Float
      tax: Float
      total: Float
      notes: String
      pdfUrl: String
    ): Invoice
    deleteInvoice(id: Int!): Boolean
  }
`);

module.exports = schema;