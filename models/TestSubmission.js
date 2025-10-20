import { DataTypes } from 'sequelize';
import sequelize from '../DB/sequelize';

const TestSubmission = sequelize.define('test_submissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  testId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'test_id',
    references: {
      model: 'tests',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  answers: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('answers');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('answers', JSON.stringify(value));
    },
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  timeSpent: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: false,
    field: 'time_spent',
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'completed_at',
    defaultValue: DataTypes.NOW,
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
  tableName: 'test_submissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: false,
      fields: ['user_id'],
    },
    {
      unique: false,
      fields: ['test_id'],
    },
    {
      unique: false,
      fields: ['user_id', 'test_id'],
    },
  ],
});

export default TestSubmission;
