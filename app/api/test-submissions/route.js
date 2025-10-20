import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectToDB from "@/DB/ConnectToDB";
import { Test, TestSubmission, User } from "@/models";

// Helper function to handle errors
const handleError = (error, status = 500) => {
  console.error('Error:', error);
  return NextResponse.json(
    { 
      success: false, 
      error: error.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    { status }
  );
};

/**
 * POST /api/test-submissions
 * Submits a test attempt
 */
export async function POST(request) {
  try {
    await ConnectToDB();
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { testId, answers, timeSpent } = requestBody;
    
    // Validate input
    if (!testId || !Array.isArray(answers) || typeof timeSpent !== 'number') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid required fields',
          details: {
            testId: testId ? 'valid' : 'missing',
            answers: Array.isArray(answers) ? `array with ${answers.length} items` : 'invalid or missing',
            timeSpent: typeof timeSpent === 'number' ? 'valid' : 'missing or invalid'
          }
        },
        { status: 400 }
      );
    }
    
    // Get the test with questions
    let test;
    try {
      test = await Test.findByPk(testId);
      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        );
      }
      
      // Ensure questions is always an array
      if (typeof test.questions === 'string') {
        test.questions = JSON.parse(test.questions);
      } else if (!Array.isArray(test.questions)) {
        test.questions = [];
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return handleError(new Error('Failed to fetch test details'));
    }
    
    // Get user
    let user;
    try {
      user = await User.findByPk(session.user.id);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User account not found' },
          { status: 404 }
        );
      }
    } catch (userError) {
      console.error('User lookup error:', userError);
      return handleError(new Error('Failed to verify user account'));
    }
    
    // Check if user has exceeded max attempts
    try {
      const attemptCount = await TestSubmission.count({
        where: {
          userId: user.id,
          testId: test.id
        }
      });
      
      if (attemptCount >= test.maxAttempts) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Maximum attempts (${test.maxAttempts}) exceeded for this test`,
            maxAttempts: test.maxAttempts,
            attemptsUsed: attemptCount
          },
          { status: 400 }
        );
      }
    } catch (countError) {
      console.error('Error checking attempt count:', countError);
      // Continue with submission attempt count check failed
      // This prevents blocking submissions if there's an issue with the count query
    }
    
    // Calculate score
    let evaluatedAnswers = [];
    let correctAnswers = 0;
    let score = 0;
    
    try {
      evaluatedAnswers = answers.map(userAnswer => {
        if (!userAnswer || typeof userAnswer !== 'object') {
          return {
            error: 'Invalid answer format',
            userAnswer
          };
        }
        
        const question = test.questions.find(q => q && q.id === userAnswer.questionId);
        const isCorrect = question && 
                         question.correctOption === userAnswer.selectedOption;
        
        if (isCorrect) correctAnswers++;
        
        return {
          questionId: userAnswer.questionId,
          selectedOption: userAnswer.selectedOption,
          isCorrect,
          correctOption: question ? question.correctOption : null
        };
      });
      
      score = test.questions.length > 0 
        ? Math.round((correctAnswers / test.questions.length) * 100) 
        : 0;
        
    } catch (scoringError) {
      console.error('Error calculating score:', scoringError);
      return handleError(new Error('Failed to calculate test score'));
    }
    
    const passed = score >= test.passingScore;
    
    // Create test submission
    let submission;
    try {
      submission = await TestSubmission.create({
        userId: user.id,
        testId: test.id,
        answers: evaluatedAnswers,
        score,
        passed,
        timeSpent,
        completedAt: new Date()
      });
    } catch (createError) {
      console.error('Error creating submission:', createError);
      return handleError(new Error('Failed to save test submission'));
    }
    
    // Get the submission with user and test data
    try {
      const result = await TestSubmission.findByPk(submission.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: Test, as: 'test', attributes: ['id', 'title', 'passingScore'] }
        ]
      });
      
      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          score: result.score,
          passed: result.passed,
          timeSpent: result.timeSpent,
          completedAt: result.completedAt,
          test: result.test,
          user: result.user
        },
        message: passed ? 'Test passed successfully!' : 'Test completed, but did not pass.'
      });
    } catch (fetchError) {
      // If we can't fetch the full result, return basic success response
      console.error('Error fetching submission details:', fetchError);
      return NextResponse.json({
        success: true,
        data: {
          id: submission.id,
          score: submission.score,
          passed: submission.passed,
          timeSpent: submission.timeSpent,
          completedAt: submission.completedAt
        },
        message: passed ? 'Test passed successfully!' : 'Test completed, but did not pass.',
        warning: 'Could not fetch full submission details'
      });
    }
    
  } catch (error) {
    console.error('Unexpected error in test submission:', error);
    
    // Handle specific error types
    if (error.name === 'SequelizeValidationError' || 
        error.name === 'SequelizeUniqueConstraintError' ||
        error.name === 'SequelizeDatabaseError') {
      const errors = error.errors ? 
        error.errors.map(err => ({
          field: err.path,
          message: err.message,
          type: err.type,
          value: err.value
        })) : 
        [{ message: error.message }];
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Database validation error',
          details: errors
        },
        { status: 400 }
      );
    }
    
    // Handle other types of errors
    return NextResponse.json(
      { 
        success: false,
        error: 'An unexpected error occurred while processing your request',
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            message: error.message,
            name: error.name,
            stack: error.stack
          }
        })
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test-submissions
 * Gets test submissions for the current user
 */
export async function GET(request) {
  try {
    await ConnectToDB();
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    
    // Build query
    const where = { userId: session.user.id };
    if (testId) {
      where.testId = parseInt(testId, 10);
    }
    
    // Get submissions
    const submissions = await TestSubmission.findAll({
      where,
      include: [
        { 
          model: Test, 
          as: 'test', 
          attributes: ['id', 'title', 'passingScore'] 
        }
      ],
      order: [['completedAt', 'DESC']],
      attributes: [
        'id',
        'score',
        'passed',
        'timeSpent',
        'completedAt',
        'createdAt'
      ]
    });
    
    return NextResponse.json({
      success: true,
      data: submissions
    });
    
  } catch (error) {
    console.error('Error fetching test submissions:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch test submissions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
