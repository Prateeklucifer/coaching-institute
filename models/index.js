import User from './User.js';
import Batch from './Batch.js';
import Test from './Test.js';
import TestSubmission from './TestSubmission.js';

// Define associations
Test.hasMany(TestSubmission, {
  foreignKey: 'testId',
  as: 'submissions'
});

User.hasMany(TestSubmission, {
  foreignKey: 'userId',
  as: 'testSubmissions'
});

TestSubmission.belongsTo(Test, {
  foreignKey: 'testId',
  as: 'test'
});

TestSubmission.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

const models = {
  User,
  Batch,
  Test,
  TestSubmission,
  // Add other models here
};

export default models;

export {
  User,
  Batch,
  Test,
  TestSubmission,
};
