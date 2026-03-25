<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper clickable" @click="goTo('/community')">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409EFF">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCommunities }}</div>
              <div class="stat-label">社区用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper clickable" @click="goTo('/merchant')">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67C23A">
              <el-icon><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalMerchants }}</div>
              <div class="stat-label">商家用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper clickable" @click="goTo('/community/demand')">
          <div class="stat-card">
            <div class="stat-icon" style="background: #E6A23C">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalActivities }}</div>
              <div class="stat-label">需求总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper clickable" @click="goTo('/merchant/member/order')">
          <div class="stat-card">
            <div class="stat-icon" style="background: #F56C6C">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalRevenue }}</div>
              <div class="stat-label">总收入(元)</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>待处理事项</span>
          </template>
          <div class="pending-list">
            <div class="pending-item clickable" @click="goTo('/community?status=0')">
              <span>待审核社区</span>
              <el-tag type="warning">{{ statistics.pendingCommunities || 0 }}</el-tag>
            </div>
            <div class="pending-item clickable" @click="goTo('/merchant?status=0')">
              <span>待审核商家</span>
              <el-tag type="warning">{{ statistics.pendingMerchants || 0 }}</el-tag>
            </div>
            <div class="pending-item clickable" @click="goTo('/community/demand?status=0')">
              <span>待审核需求</span>
              <el-tag type="warning">{{ statistics.pendingActivities || 0 }}</el-tag>
            </div>
            <div class="pending-item clickable" @click="goTo('/community/demand?status=1')">
              <span>招募中需求</span>
              <el-tag type="success">{{ statistics.recruitingActivities || 0 }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>平台数据</span>
          </template>
          <div class="pending-list">
            <div class="pending-item clickable" @click="goTo('/community/demand?status=3')">
              <span>已完成合作</span>
              <el-tag type="success">{{ statistics.completedCooperations || 0 }}</el-tag>
            </div>
            <div class="pending-item clickable" @click="goTo('/merchant/member/order')">
              <span>订单总数</span>
              <el-tag>{{ statistics.totalOrders || 0 }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const statistics = ref({
  totalCommunities: 0,
  totalMerchants: 0,
  totalActivities: 0,
  totalRevenue: 0,
  recruitingActivities: 0,
  completedCooperations: 0,
  totalOrders: 0
})

const fetchStatistics = async () => {
  try {
    const res = await api.statistics.get()
    if (res.code === 200) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const goTo = (path) => {
  router.push(path)
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: var(--spacing-lg);
}

.stat-card-wrapper {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  
  &.clickable {
    cursor: pointer;
    transition: var(--transition-base);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 28px;
    box-shadow: var(--shadow-base);
  }
  
  .stat-info {
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: var(--text-primary);
    }
    
    .stat-label {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
    }
  }
}

.pending-list {
  .pending-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--border-lighter);
    
    &:last-child {
      border-bottom: none;
    }
    
    &.clickable {
      cursor: pointer;
      transition: var(--transition-fast);
      
      &:hover {
        background-color: var(--bg-hover);
        margin: 0 calc(var(--spacing-lg) * -1);
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--border-radius-base);
      }
    }
  }
}

:deep(.el-card) {
  border-radius: var(--border-radius-lg);
  border: none;
  box-shadow: var(--shadow-card);
  
  .el-card__header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-lighter);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .el-card__body {
    padding: var(--spacing-lg);
  }
}

:deep(.el-row) {
  margin-left: 0 !important;
  margin-right: 0 !important;
  
  .el-col {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
