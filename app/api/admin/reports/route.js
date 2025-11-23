import ConnectToDB from "@/DB/ConnectToDB";
import sequelize from "@/DB/sequelize";
import { DataTypes, Op } from "sequelize";
import { NextResponse } from "next/server";

// 1. Define Models locally to ensure they match your SQL 'describe' output exactly
// Using 'underscored: true' ensures mapping like transactionId -> transaction_id

const defineModels = () => {
  // Payment Model
  const Payment = sequelize.models.Payment || sequelize.define("Payment", {
    transactionId: { type: DataTypes.STRING, field: 'transaction_id' },
    senderName: { type: DataTypes.STRING, field: 'sender_name' },
    amount: { type: DataTypes.DECIMAL(10, 2) },
    status: { type: DataTypes.ENUM('pending', 'verified', 'rejected'), defaultValue: 'pending' },
    userId: { type: DataTypes.INTEGER, field: 'user_id' }
  }, { timestamps: true, underscored: true, tableName: 'payments' });

  // User Model
  const User = sequelize.models.User || sequelize.define("User", {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    isAdmin: { type: DataTypes.TINYINT, field: 'is_admin' }
  }, { timestamps: true, underscored: true, tableName: 'users' });

  // Batch Model
  const Batch = sequelize.models.Batch || sequelize.define("Batch", {
    batchName: { type: DataTypes.STRING, field: 'batch_name' },
    batchCode: { type: DataTypes.STRING, field: 'batch_code' },
    subjects: { type: DataTypes.TEXT } // Storing array as text?
  }, { timestamps: true, underscored: true, tableName: 'batches' });

  // Test Model
  const Test = sequelize.models.Test || sequelize.define("Test", {
    title: { type: DataTypes.STRING },
    isActive: { type: DataTypes.TINYINT, field: 'is_active' }
  }, { timestamps: true, underscored: true, tableName: 'tests' });

  return { Payment, User, Batch, Test };
};

export async function GET(req) {
  try {
    await ConnectToDB();
    const { Payment, User, Batch, Test } = defineModels();

    // --- 1. Aggregation Queries ---

    // Calculate Total Revenue (Verified payments only)
    const revenueResult = await Payment.sum('amount', {
      where: { status: 'verified' }
    });

    // Calculate Pending Amount (Potential revenue)
    const pendingResult = await Payment.sum('amount', {
      where: { status: 'pending' }
    });

    // Count statistics
    const totalUsers = await User.count();
    const totalBatches = await Batch.count();
    const totalTests = await Test.count({ where: { isActive: true } });
    
    // Payment Status Counts
    const paymentStats = await Payment.count({
      group: ['status'],
      attributes: ['status']
    });
    
    // Convert Grouped count to object { verified: 10, pending: 2 ... }
    const statusCounts = paymentStats.reduce((acc, curr) => {
      acc[curr.status] = curr.count;
      return acc;
    }, { verified: 0, pending: 0, rejected: 0 });


    // --- 2. Recent Data for Report Tables ---

    // Fetch last 10 payments for the report table
    const recentPayments = await Payment.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['transactionId', 'senderName', 'amount', 'status', 'createdAt']
    });

    // --- 3. Construct Response ---

    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        financials: {
          totalRevenue: revenueResult || 0,
          pendingAmount: pendingResult || 0,
          currency: 'INR' // or USD based on your app
        },
        counts: {
          users: totalUsers,
          batches: totalBatches,
          activeTests: totalTests,
          pendingVerifications: statusCounts.pending || 0
        }
      },
      transactions: recentPayments.map(p => ({
        id: p.transactionId,
        user: p.senderName,
        amount: parseFloat(p.amount), // Ensure number for math on frontend
        status: p.status,
        date: p.createdAt
      }))
    };

    return NextResponse.json({ 
      success: true, 
      data: reportData 
    }, { status: 200 });

  } catch (error) {
    console.error('Report Generation Error:', error);
    return NextResponse.json(
      { error: "Failed to generate report data." }, 
      { status: 500 }
    );
  }
}