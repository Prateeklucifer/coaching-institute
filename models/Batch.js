import { DataTypes } from 'sequelize';
import sequelize from '../DB/sequelize';

const Batch = sequelize.define('batches', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  batchName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batchCreatedAt: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'batch_created_at',
  },
  batchCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'batch_code',
    unique: true,
  },
  subjects: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('subjects');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('subjects', JSON.stringify(value));
    },
  },
  tests: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('tests');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tests', JSON.stringify(value));
    },
  },
  studyMaterial: {
    type: DataTypes.TEXT,
    field: 'study_material',
    get() {
      const value = this.getDataValue('studyMaterial');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('studyMaterial', JSON.stringify(value));
    },
  },
  announcements: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('announcements');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('announcements', JSON.stringify(value));
    },
  },
  assignments: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('assignments');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('assignments', JSON.stringify(value));
    },
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
  tableName: 'batches',
  timestamps: true,
  underscored: true,
});

export default Batch;
