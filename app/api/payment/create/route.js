import ConnectToDB from "@/DB/ConnectToDB";
import sequelize from "@/DB/sequelize"; // Make sure you import your Sequelize instance
import { DataTypes } from "sequelize";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { transactionId, senderName, amount, userId } = await req.json();

    // 1. Basic Validation
    if (!transactionId || !senderName || !amount) {
      return NextResponse.json(
        { error: "Transaction ID, Sender Name, and Amount are required" },
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

    // 3. Define Model (Hardcoded Check)
    // We check `sequelize.models.Payment` first to prevent "Model already defined" errors during hot-reloading
    const Payment = sequelize.models.Payment || sequelize.define("Payment", {
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

    // 4. Sync the model (Create table if it doesn't exist)
    // In production, you usually use migrations, but for this demo, sync() works well.
    await Payment.sync(); 

    // 5. Check for Duplicate Transaction ID
    const existingPayment = await Payment.findOne({ 
      where: { transactionId } 
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "This Transaction ID has already been submitted." },
        { status: 409 } 
      );
    }

    // 6. Save to DB
    const newPayment = await Payment.create({
      transactionId,
      senderName,
      amount,
      status: 'pending',
      userId: userId || null, 
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Payment submitted for verification",
        data: {
            id: newPayment.id,
            status: newPayment.status
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { error: "Submission failed. Please try again." },
      { status: 500 }
    );
  }
}