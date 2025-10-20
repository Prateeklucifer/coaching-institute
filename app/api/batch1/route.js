import { NextResponse } from "next/server";
import { Batch } from "@/models";
import sequelize from "@/DB/sequelize";

export async function GET() {
  try {
    // Check database connection
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (dbError) {
      console.error('Unable to connect to the database:', dbError);
      return NextResponse.json(
        { error: 'Database connection error', details: dbError.message },
        { status: 500 }
      );
    }
    
    // Check if the batches table exists and is accessible
    try {
      const tableExists = await sequelize.getQueryInterface().showAllTables();
      if (!tableExists.includes('batches')) {
        console.log('Batches table does not exist, attempting to sync...');
        await Batch.sync();
      }
    } catch (tableError) {
      console.error('Error checking/creating batches table:', tableError);
      return NextResponse.json(
        { error: 'Database table error', details: tableError.message },
        { status: 500 }
      );
    }
    
    // Check if any batches exist
    let batchCount;
    try {
      batchCount = await Batch.count();
    } catch (countError) {
      console.error('Error counting batches:', countError);
      return NextResponse.json(
        { error: 'Error counting batches', details: countError.message },
        { status: 500 }
      );
    }
    
    // If no batches exist, create sample data
    if (batchCount === 0) {
      try {
        await Batch.create({
          batchName: "Mastering React In 1 Month",
          batchCreatedAt: new Date().toISOString().split('T')[0],
          batchCode: "#cqhef",
          subjects: ["Programming Fundamentals", "JavaScript", "React JS", "Express JS"],
          studyMaterial: [
            {
              id: 1,
              title: "50+ ReactJS Interview Questions",
              mentor: "Kunal Rajput",
              resourceUrl: "/SM-pdf1.pdf",
              resourceType: "pdf",
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              title: "React interview questions",
              mentor: "Kunal Rajput",
              resourceUrl: "/SM-pdf2.pdf",
              resourceType: "pdf",
              createdAt: new Date().toISOString()
            },
            {
              id: 3,
              title: "Top 70 ReactJS Interview Questions and Answers",
              mentor: "Kunal Rajput",
              resourceUrl: "/SM-pdf3.pdf",
              resourceType: "pdf",
              createdAt: new Date().toISOString()
            }
          ],
          announcements: [
            {
              id: 1,
              title: "Mock Test Updates Now Live!",
              mentor: "Pooja Kanetkar",
              message: "Our mock tests just got better! New exam simulations, improved feedback, and detailed performance analysis are now live. Test your skills and enhance your preparation today.",
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              title: "SkillCrafters Launching Mobile App!",
              mentor: "Pooja Kanetkar",
              message: "Great news! SkillCrafters is now available on mobile. Download our app to study on the go, access mock tests, and track your progress anytime, anywhere.",
              createdAt: new Date().toISOString()
            }
          ],
          assignments: [
            {
              title: "Simple JavaScript Assignments",
              mentor: "Roma Singh",
              resourceUrl: "/A-pdf1.pdf",
              resourceType: "pdf"
            },
            {
              title: "JavaScript Practice PDF",
              mentor: "Roma Singh",
              resourceUrl: "/A-pdf2.pdf",
              resourceType: "pdf"
            },
            {
              title: "React Components Assignment",
              mentor: "Kunal Rajput",
              dueDate: "15/12/24",
              status: "pending"
            }
          ]
        });
      } catch (createError) {
        console.error('Error creating sample batch:', createError);
        return NextResponse.json(
          { error: 'Error creating sample batch', details: createError.message },
          { status: 500 }
        );
      }
    }
    
    // Fetch all batches
    const allBatches = await Batch.findAll();
    return NextResponse.json({ data: allBatches });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { message: "Something went wrong", error: err.message },
      { status: 500 }
    );
  }
}
