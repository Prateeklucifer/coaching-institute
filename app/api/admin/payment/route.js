import ConnectToDB from "@/DB/ConnectToDB";
import sequelize from "@/DB/sequelize";
import { DataTypes } from "sequelize";
import { NextResponse } from "next/server";

// Helper function to ensure Model is defined
const definePaymentModel = () => {
  return sequelize.models.Payment || sequelize.define("Payment", {
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    timestamps: true,
  });
};

// Handle PUT requests to update payment status
export async function PUT(req) {
  try {
    const { id, transactionId, status } = await req.json();

    // 1. Validation
    if ((!id && !transactionId) || !status) {
      return NextResponse.json(
        { error: "Payment ID (or Transaction ID) and new Status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Allowed values: pending, verified, rejected" },
        { status: 400 }
      );
    }

    // 2. Connect to Database
    try {
      await ConnectToDB();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: "Database connection failed." },
        { status: 500 }
      );
    }

    // 3. Define/Retrieve Model
    const Payment = definePaymentModel();

    // 4. Find the Payment
    let payment;
    if (id) {
      payment = await Payment.findByPk(id);
    } else {
      payment = await Payment.findOne({ where: { transactionId } });
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // 5. Update the Status
    payment.status = status;
    await payment.save();

    return NextResponse.json(
      { 
        success: true, 
        message: `Payment status updated to ${status}`,
        data: payment
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { error: "Failed to update payment status." },
      { status: 500 }
    );
  }
}

// GET method to fetch all payments for the admin dashboard
export async function GET(req) {
  try {
    await ConnectToDB();
    
    // FIX: Define the model here too! 
    // Previously, if GET was called first, the model didn't exist yet.
    const Payment = definePaymentModel();

    // Fetch all payments, newest first
    const payments = await Payment.findAll({
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ success: true, data: payments }, { status: 200 });

  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}