/**
 * RentBilling Model
 * 
 * Represents a monthly billing record for an accommodation.
 * Includes rent, utilities (electricity, water), and additional services.
 * 
 * Follows Single Responsibility Principle - only handles billing data.
 * 
 * @module models/RentBilling
 */
module.exports = (sequelize, DataTypes) => {
    const RentBilling = sequelize.define('RentBilling', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // Reference fields
        accommodationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to the accommodation/room'
        },
        tenantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to the tenant user'
        },
        landlordId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to the landlord user'
        },
        propertyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to the property (if applicable)'
        },
        contractId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to the rental contract'
        },
        // Billing period
        billingMonth: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Month number (1-12)'
        },
        billingYear: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Year (e.g., 2026)'
        },
        billingPeriod: {
            type: DataTypes.STRING(7),
            allowNull: false,
            comment: 'Format: YYYY-MM (e.g., 2026-01)'
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Payment due date'
        },
        // Room rent
        roomRent: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Base room rent (VND)'
        },
        // Electricity
        electricityPreviousReading: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Previous meter reading (kWh)'
        },
        electricityCurrentReading: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Current meter reading (kWh)'
        },
        electricityUsage: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Usage = Current - Previous (kWh)'
        },
        electricityPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 3500,
            comment: 'Price per kWh (VND)'
        },
        electricityAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Total electricity cost (VND)'
        },
        // Water
        waterPreviousReading: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Previous meter reading (m3)'
        },
        waterCurrentReading: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Current meter reading (m3)'
        },
        waterUsage: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Usage = Current - Previous (m3)'
        },
        waterPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 15000,
            comment: 'Price per m3 (VND)'
        },
        waterAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Total water cost (VND)'
        },
        // Additional fees
        internetFee: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Monthly internet fee (VND)'
        },
        garbageFee: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Monthly garbage collection fee (VND)'
        },
        parkingFee: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Monthly parking fee (VND)'
        },
        otherFees: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Other miscellaneous fees (VND)'
        },
        otherFeesDescription: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Description of other fees'
        },
        // Discount
        discount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Discount amount (VND)'
        },
        discountReason: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Reason for discount'
        },
        // Totals
        subtotal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Subtotal before discount (VND)'
        },
        totalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Total amount after discount (VND)'
        },
        // Previous balance
        previousBalance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Previous unpaid balance (VND)'
        },
        grandTotal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Total + Previous Balance (VND)'
        },
        // Payment tracking
        paidAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Amount already paid (VND)'
        },
        remainingBalance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Remaining unpaid amount (VND)'
        },
        // Status
        status: {
            type: DataTypes.ENUM('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled'),
            allowNull: false,
            defaultValue: 'draft',
            comment: 'Billing status'
        },
        paidAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Date when fully paid'
        },
        // Notification tracking
        notificationSent: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether notification was sent to tenant'
        },
        notificationSentAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        reminderCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Number of reminders sent'
        },
        lastReminderAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // Notes
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional notes'
        },
        // Auto-generated or manual
        isAutoGenerated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether bill was auto-generated by cron'
        }
    }, {
        tableName: 'rent_billings',
        timestamps: true,
        indexes: [
            { fields: ['accommodationId'] },
            { fields: ['tenantId'] },
            { fields: ['landlordId'] },
            { fields: ['propertyId'] },
            { fields: ['billingPeriod'] },
            { fields: ['status'] },
            { fields: ['dueDate'] },
            { unique: true, fields: ['accommodationId', 'billingPeriod'] }
        ]
    });

    RentBilling.associate = function (models) {
        RentBilling.belongsTo(models.Accommodation, {
            foreignKey: 'accommodationId',
            as: 'accommodation'
        });
        RentBilling.belongsTo(models.User, {
            foreignKey: 'tenantId',
            as: 'tenant'
        });
        RentBilling.belongsTo(models.User, {
            foreignKey: 'landlordId',
            as: 'landlord'
        });
        RentBilling.belongsTo(models.Property, {
            foreignKey: 'propertyId',
            as: 'property'
        });
        RentBilling.belongsTo(models.RentalContract, {
            foreignKey: 'contractId',
            as: 'contract'
        });
    };

    // Instance method to calculate totals
    RentBilling.prototype.calculateTotals = function () {
        // Calculate utility usages
        this.electricityUsage = (this.electricityCurrentReading || 0) - (this.electricityPreviousReading || 0);
        this.waterUsage = (this.waterCurrentReading || 0) - (this.waterPreviousReading || 0);

        // Calculate utility amounts
        this.electricityAmount = this.electricityUsage * (this.electricityPrice || 0);
        this.waterAmount = this.waterUsage * (this.waterPrice || 0);

        // Calculate subtotal
        this.subtotal = parseFloat(this.roomRent || 0) +
            parseFloat(this.electricityAmount || 0) +
            parseFloat(this.waterAmount || 0) +
            parseFloat(this.internetFee || 0) +
            parseFloat(this.garbageFee || 0) +
            parseFloat(this.parkingFee || 0) +
            parseFloat(this.otherFees || 0);

        // Calculate total after discount
        this.totalAmount = this.subtotal - parseFloat(this.discount || 0);

        // Calculate grand total with previous balance
        this.grandTotal = this.totalAmount + parseFloat(this.previousBalance || 0);

        // Calculate remaining balance
        this.remainingBalance = this.grandTotal - parseFloat(this.paidAmount || 0);

        // Update status based on payment
        if (this.remainingBalance <= 0) {
            this.status = 'paid';
            this.paidAt = new Date();
        } else if (this.paidAmount > 0) {
            this.status = 'partial';
        }

        return this;
    };

    return RentBilling;
};
