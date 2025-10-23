const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      categories: [],
      sources: [],
      keywords: [],
      language: 'en',
      country: 'us'
    }
  },
  profile: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        breaking: true
      },
      privacy: {
        profilePublic: false,
        showReadingHistory: false
      }
    }
  },
  readingHistory: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  bookmarks: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  }
});

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Compare password method
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user preferences for ML
User.prototype.getMLPreferences = function() {
  return {
    categories: this.preferences.categories,
    keywords: this.preferences.keywords,
    readingHistory: this.readingHistory.slice(-50),
    language: this.preferences.language
  };
};

module.exports = User;