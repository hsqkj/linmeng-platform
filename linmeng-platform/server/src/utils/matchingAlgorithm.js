class MatchingAlgorithm {
  static calculateMatchScore(merchant, activity, community = null) {
    const details = {}
    
    let totalScore = 0
    let totalWeight = 0
    
    if (merchant.sponsor_types && activity.sponsor_types) {
      details.sponsorTypeScore = this.matchSponsorTypes(
        merchant.sponsor_types,
        activity.sponsor_types
      )
      totalScore += details.sponsorTypeScore * 30
      totalWeight += 30
    }
    
    if (merchant.target_crowd && activity.target_crowd) {
      details.targetCrowdScore = this.matchTargetCrowd(
        merchant.target_crowd,
        activity.target_crowd
      )
      totalScore += details.targetCrowdScore * 25
      totalWeight += 25
    }
    
    if (merchant.industry) {
      details.industryScore = this.matchIndustry(
        merchant.industry,
        activity.sponsor_types,
        activity.demand_type
      )
      totalScore += details.industryScore * 15
      totalWeight += 15
    }
    
    if (community && merchant.latitude && merchant.longitude && 
        community.latitude && community.longitude) {
      details.locationScore = this.matchLocation(
        parseFloat(merchant.latitude),
        parseFloat(merchant.longitude),
        parseFloat(community.latitude),
        parseFloat(community.longitude)
      )
      totalScore += details.locationScore * 10
      totalWeight += 10
    }
    
    if (community && merchant.target_crowd) {
      details.communityScore = this.matchCommunity(
        community,
        merchant.target_crowd
      )
      totalScore += details.communityScore * 10
      totalWeight += 10
    }
    
    details.reputationScore = this.calculateReputation(merchant)
    totalScore += details.reputationScore * 5
    totalWeight += 5
    
    details.memberScore = this.getMemberScore(merchant.member_level)
    totalScore += details.memberScore * 5
    totalWeight += 5
    
    if (merchant.tags || merchant.custom_tags || activity.tags || activity.custom_tags) {
      details.tagScore = this.matchTags(
        merchant.tags,
        merchant.custom_tags,
        activity.tags,
        activity.custom_tags
      )
      totalScore += details.tagScore * 5
      totalWeight += 5
    }
    
    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
    
    const hearts = this.scoreToHearts(finalScore)
    
    return {
      score: finalScore,
      hearts,
      details
    }
  }
  
  static scoreToHearts(score) {
    if (score >= 80) return 5
    if (score >= 60) return 4
    if (score >= 40) return 3
    if (score >= 20) return 2
    if (score >= 5) return 1
    return 0
  }
  
  static matchSponsorTypes(merchantTypes, activityTypes) {
    if (!merchantTypes || !activityTypes) return 30
    
    const merchant = merchantTypes.split(',').map(t => t.trim())
    const activity = activityTypes.split(',').map(t => t.trim())
    
    const matched = merchant.filter(t => activity.includes(t))
    
    return activity.length > 0 ? (matched.length / activity.length) * 100 : 30
  }
  
  static matchTargetCrowd(merchantCrowd, activityCrowd) {
    if (!merchantCrowd || !activityCrowd) return 30
    
    const merchant = merchantCrowd.split(',').map(t => t.trim())
    const activity = activityCrowd.split(',').map(t => t.trim())
    
    if (merchant.includes('全社区居民')) {
      return 80
    }
    
    const matched = merchant.filter(t => activity.includes(t))
    
    return activity.length > 0 ? (matched.length / activity.length) * 100 : 30
  }
  
  static matchIndustry(merchantIndustry, activityTypes, demandType) {
    if (!merchantIndustry) return 30
    
    const industry = merchantIndustry.split(',').map(t => t.trim())
    const types = activityTypes ? activityTypes.split(',').map(t => t.trim()) : []
    
    const industryMapping = {
      '餐饮美食': ['物资', '场地'],
      '教育培训': ['人力', '专业服务', '场地'],
      '医疗健康': ['人力', '专业服务', '物资'],
      '文化娱乐': ['场地', '物资', '人力'],
      '运动健身': ['场地', '物资', '人力'],
      '生活服务': ['人力', '物资', '专业服务'],
      '零售购物': ['物资', '现金'],
      '美容美发': ['人力', '物资', '专业服务']
    }
    
    let maxScore = 0
    
    for (const ind of industry) {
      if (types.includes(ind)) {
        maxScore = Math.max(maxScore, 100)
        continue
      }
      
      const relatedTypes = industryMapping[ind] || []
      const matchedTypes = relatedTypes.filter(t => types.includes(t))
      if (matchedTypes.length > 0) {
        maxScore = Math.max(maxScore, 60)
      }
    }
    
    return maxScore
  }
  
  static matchLocation(lat1, lon1, lat2, lon2) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2)
    
    if (distance <= 1) return 100
    if (distance <= 3) return 80
    if (distance <= 5) return 60
    if (distance <= 10) return 40
    return 20
  }
  
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  static toRad(deg) {
    return deg * (Math.PI / 180)
  }
  
  static matchCommunity(community, merchantCrowd) {
    if (!community || !merchantCrowd) return 0
    
    let score = 50
    
    const crowd = merchantCrowd.split(',').map(t => t.trim())
    
    if (community.elderly_ratio > 30 && crowd.includes('中老年')) {
      score += 20
    }
    
    if (community.youth_family_ratio > 40 && crowd.includes('亲子/少儿')) {
      score += 20
    }
    
    if (community.total_households > 2000) {
      score += 10
    }
    
    return Math.min(score, 100)
  }
  
  static calculateReputation(merchant) {
    let score = 50
    
    if (merchant.star_rating) {
      score += (merchant.star_rating / 5) * 30
    }
    
    return Math.min(score, 100)
  }
  
  static getMemberScore(memberLevel) {
    const scores = {
      3: 100,
      2: 80,
      1: 60,
      0: 40
    }
    return scores[memberLevel] || 40
  }
  
  static matchTags(merchantTags, merchantCustomTags, activityTags, activityCustomTags) {
    let matchedCount = 0
    
    const mTags = this.parseTags(merchantTags, merchantCustomTags)
    const aTags = this.parseTags(activityTags, activityCustomTags)
    
    for (const tag of mTags) {
      if (aTags.includes(tag)) {
        matchedCount++
      }
    }
    
    return Math.min(matchedCount * 10, 100)
  }
  
  static parseTags(tags, customTags) {
    let result = []
    
    if (tags) {
      try {
        const tagIds = JSON.parse(tags)
        result = result.concat(tagIds.map(id => String(id)))
      } catch (e) {}
    }
    
    if (customTags) {
      try {
        const custom = JSON.parse(customTags)
        result = result.concat(custom.map(t => t.name || t))
      } catch (e) {}
    }
    
    return result
  }
  
  static matchAndSort(merchants, activity, community = null) {
    const results = merchants.map(merchant => {
      const matchResult = this.calculateMatchScore(merchant, activity, community)
      return {
        merchant,
        ...matchResult
      }
    })
    
    results.sort((a, b) => b.score - a.score)
    
    return results
  }
  
  static filterHighMatch(results, threshold = 70) {
    return results.filter(r => r.score >= threshold)
  }
}

module.exports = MatchingAlgorithm
