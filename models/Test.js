import { DataTypes } from 'sequelize';
import sequelize from '../DB/sequelize';

const Test = sequelize.define('tests', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Test title is required',
      },
      len: {
        args: [1, 200],
        msg: 'Title must be between 1 and 200 characters',
      },
    },
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Test description is required',
      },
      len: {
        args: [1, 500],
        msg: 'Description must be between 1 and 500 characters',
      },
    },
  },
  questions: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('questions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('questions', JSON.stringify(value));
    },
    validate: {
      notEmpty: {
        msg: 'Questions are required',
      },
      validateQuestions(value) {
        const questions = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Test must have at least one question');
        }
        
        questions.forEach((q, index) => {
          if (!q.questionText || q.questionText.trim() === '') {
            throw new Error(`Question ${index + 1}: Question text is required`);
          }
          
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Question ${index + 1}: Must have exactly 4 options`);
          }
          
          q.options.forEach((opt, optIndex) => {
            if (!opt.optionText || opt.optionText.trim() === '') {
              throw new Error(`Question ${index + 1}, Option ${optIndex + 1}: Option text is required`);
            }
          });
          
          if (q.correctOption === undefined || q.correctOption === null) {
            throw new Error(`Question ${index + 1}: Correct option is required`);
          }
          
          if (q.correctOption < 0 || q.correctOption > 3) {
            throw new Error(`Question ${index + 1}: Correct option must be between 0 and 3`);
          }
        });
      },
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30, // in minutes
    validate: {
      min: 1,
      max: 300,
    },
    field: 'time_limit',
  },
  passingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50, // percentage
    validate: {
      min: 1,
      max: 100,
    },
    field: 'passing_score',
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      min: 1,
    },
    field: 'max_attempts',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
  },
}, {
  tableName: 'tests',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (test) => {
      // Ensure questions is properly formatted before validation
      if (test.questions && typeof test.questions === 'string') {
        try {
          test.questions = JSON.parse(test.questions);
        } catch (e) {
          // If parsing fails, let the validation handle it
        }
      }
    },
  },
});

export default Test;
