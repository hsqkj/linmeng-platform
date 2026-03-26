const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

class CodeGenerator {
  static async generateCode(prefix, tableName, fieldName = 'code') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    const fullPrefix = `${prefix}${dateStr}`;
    
    try {
      const sql = `SELECT ${fieldName} FROM ${tableName} WHERE ${fieldName} LIKE '${fullPrefix}%' ORDER BY ${fieldName} DESC LIMIT 1`;
      const results = await sequelize.query(sql, { type: QueryTypes.SELECT });
      
      let sequence = 1;
      if (results && results.length > 0) {
        const lastCode = results[0][fieldName];
        const lastSequence = parseInt(lastCode.substring(fullPrefix.length));
        sequence = lastSequence + 1;
      }
      
      const sequenceStr = String(sequence).padStart(4, '0');
      return `${fullPrefix}${sequenceStr}`;
    } catch (error) {
      console.error('生成编码错误:', error);
      const sequenceStr = String(1).padStart(4, '0');
      return `${fullPrefix}${sequenceStr}`;
    }
  }

  static async generateOrderNo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `DD${year}${month}${day}${hour}${minute}${second}${random}`;
  }

  static async generateCommunityCode() {
    return await this.generateCode('SQ', 'community_user', 'community_code');
  }

  static async generateMerchantCode() {
    return await this.generateCode('SJ', 'merchant_user', 'merchant_code');
  }

  static async generateDemandCode() {
    return await this.generateCode('XQ', 'activity', 'demand_code');
  }

  static async generateSponsorCode() {
    return await this.generateCode('ZZ', 'sponsor_infos', 'sponsor_code');
  }

  static async generateCooperationCode() {
    return await this.generateCode('HZ', 'cooperation', 'cooperation_code');
  }

  static async generateCommentCode() {
    return await this.generateCode('COMMENT', 'sponsor_comments', 'comment_code');
  }

  static async generateCommissionNo() {
    return await this.generateCode('TC', 'commissions', 'commission_code');
  }
}

module.exports = CodeGenerator;
