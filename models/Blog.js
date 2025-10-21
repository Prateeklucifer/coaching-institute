import { DataTypes } from 'sequelize';
import sequelize from '../DB/sequelize';

const Blog = sequelize.define('blogs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  paragraphOne: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  paragraphTwo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  paragraphThree: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'cover_image',
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
  tableName: 'blogs',
  timestamps: true,
  underscored: true,
});

export default Blog;
