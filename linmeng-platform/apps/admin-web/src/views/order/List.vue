<template>
  <div class="order-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div class="header-actions">
            <el-select v-model="filterType" placeholder="订单类型" clearable style="width: 120px; margin-right: 10px">
              <el-option label="会员年费" :value="0" />
              <el-option label="定制服务" :value="1" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="支付状态" clearable style="width: 120px; margin-right: 10px">
              <el-option label="待支付" :value="0" />
              <el-option label="已支付" :value="1" />
              <el-option label="已退款" :value="3" />
            </el-select>
            <el-input
              v-model="searchText"
              placeholder="搜索商家名称"
              style="width: 200px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </div>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="order_code" label="订单编号" width="180" />
        <el-table-column prop="business_name" label="商家名称" min-width="150" />
        <el-table-column label="订单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.order_type === 0 ? 'primary' : 'success'">
              {{ row.order_type === 0 ? '会员年费' : '定制服务' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_name" label="订单名称" width="150" />
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            <span style="color: #f5222d; font-weight: bold">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPayStatusType(row.pay_status)">
              {{ getPayStatusText(row.pay_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_time" label="支付时间" width="160" />
        <el-table-column prop="create_time" label="创建时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
    
    <el-dialog v-model="dialogVisible" title="订单详情" width="500px">
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="订单编号">{{ currentRow.order_code }}</el-descriptions-item>
        <el-descriptions-item label="商家名称">{{ currentRow.business_name }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          {{ currentRow.order_type === 0 ? '会员年费' : '定制服务' }}
        </el-descriptions-item>
        <el-descriptions-item label="订单名称">{{ currentRow.order_name }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span style="color: #f5222d; font-weight: bold">¥{{ currentRow.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="getPayStatusType(currentRow.pay_status)">
            {{ getPayStatusText(currentRow.pay_status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentRow.pay_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow.create_time }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '../../api'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')
const filterType = ref(null)
const filterStatus = ref(null)
const dialogVisible = ref(false)
const currentRow = ref(null)

const getPayStatusType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
  return types[status] || 'info'
}

const getPayStatusText = (status) => {
  const texts = { 0: '待支付', 1: '已支付', 2: '支付失败', 3: '已退款' }
  return texts[status] || '未知'
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await api.order.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchText.value,
      order_type: filterType.value,
      pay_status: filterStatus.value
    })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchList()
}

const handleView = (row) => {
  currentRow.value = row
  dialogVisible.value = true
}

watch([filterType, filterStatus], () => {
  page.value = 1
  fetchList()
})

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.order-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>
