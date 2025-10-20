import ConnectToDB from "@/DB/ConnectToDB";
import { NextResponse } from "next/server";
import { Batch } from "@/models";

/**
 * GET /api/studymaterial
 * Fetches all study materials from the database
 */
export async function GET() {
  try {
    await ConnectToDB();
    
    // Find all batches with their study materials
    const batches = await Batch.findAll({
      attributes: ['id', 'batchName', 'studyMaterial']
    });
    
    // Extract and flatten study materials from all batches
    const allStudyMaterials = batches.flatMap(batch => 
      Array.isArray(batch.studyMaterial) ? batch.studyMaterial : []
    );
    
    return NextResponse.json({ 
      success: true,
      data: allStudyMaterials 
    });
    
  } catch (error) {
    console.error('Error fetching study materials:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch study materials',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/studymaterial
 * Adds a new study material to a batch
 */
export async function POST(request) {
  try {
    await ConnectToDB();
    
    const { batchId, title, mentor, resourceUrl, resourceType } = await request.json();
    
    // Basic validation
    if (!batchId || !title || !resourceUrl || !resourceType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the batch
    const batch = await Batch.findByPk(batchId);
    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }
    
    // Initialize studyMaterial array if it doesn't exist
    const currentStudyMaterials = Array.isArray(batch.studyMaterial) 
      ? [...batch.studyMaterial] 
      : [];
    
    // Add new study material
    const newStudyMaterial = {
      id: Date.now().toString(),
      title,
      mentor: mentor || 'Unknown',
      resourceUrl,
      resourceType,
      createdAt: new Date().toISOString()
    };
    
    currentStudyMaterials.push(newStudyMaterial);
    
    // Update the batch with new study material
    await batch.update({
      studyMaterial: currentStudyMaterials
    });
    
    return NextResponse.json({
      success: true,
      data: newStudyMaterial
    });
    
  } catch (error) {
    console.error('Error adding study material:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add study material',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
