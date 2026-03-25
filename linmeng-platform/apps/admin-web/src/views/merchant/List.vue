<template>
  <div class="merchant-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商家管理</span>
          <div class="header-right">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
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
        <el-table-column label="Logo" width="80">
          <template #default="{ row }">
            <el-image
              :src="getImageUrl(row.logo)"
              style="width: 40px; height: 40px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="business_name" label="商家名称" min-width="150" />
        <el-table-column prop="contact_name" label="联系人" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column label="会员" width="100">
          <template #default="{ row }">
            <el-tag :type="getMemberType(row.member_level)">
              {{ getMemberText(row.member_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="注册时间" width="160" />
        <el-table-column label="操作" width="310" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="info" link @click="handleViewSponsor(row)">赞助情况</el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              @click="handleAudit(row, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              @click="handleAudit(row, 2)"
            >
              驳回
            </el-button>
            <el-button
              v-if="isSuperAdmin"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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
    
    <el-dialog v-model="dialogVisible" title="商家详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="商家名称">{{ currentRow.business_name }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentRow.contact_name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentRow.phone }}</el-descriptions-item>
        <el-descriptions-item label="所属行业">{{ currentRow.industry }}</el-descriptions-item>
        <el-descriptions-item label="商家地址" :span="2">{{ currentRow.address }}</el-descriptions-item>
        <el-descriptions-item label="商家简介" :span="2">{{ currentRow.description || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="目标人群" :span="2">
          <template v-if="currentRow.target_crowd">
            <el-tag v-for="item in parseJson(currentRow.target_crowd)" :key="item" style="margin-right: 5px">{{ item }}</el-tag>
          </template>
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="可提供赞助" :span="2">
          <template v-if="currentRow.sponsor_types">
            <el-tag v-for="item in parseJson(currentRow.sponsor_types)" :key="item" type="success" style="margin-right: 5px">{{ item }}</el-tag>
          </template>
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="赞助详情" :span="2" v-if="currentRow.sponsor_detail">
          <div v-for="(value, key) in parseJsonObj(currentRow.sponsor_detail)" :key="key" style="margin-bottom: 5px">
            <strong>{{ key }}：</strong>{{ value }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="期望回报" :span="2">
          <template v-if="currentRow.return_expect">
            <el-tag v-for="item in parseJson(currentRow.return_expect)" :key="item" type="warning" style="margin-right: 5px">{{ item }}</el-tag>
          </template>
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="会员等级">{{ getMemberText(currentRow.member_level) }}</el-descriptions-item>
        <el-descriptions-item label="会员到期">{{ currentRow.member_expire || '未开通' }}</el-descriptions-item>
        <el-descriptions-item label="Logo">
          <el-image
            v-if="currentRow.logo"
            :src="getImageUrl(currentRow.logo)"
            style="width: 60px"
            :preview-src-list="[getImageUrl(currentRow.logo)]"
          />
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="营业执照">
          <el-image
            v-if="currentRow.license_img"
            :src="getImageUrl(currentRow.license_img)"
            style="width: 100px"
            :preview-src-list="[getImageUrl(currentRow.license_img)]"
          />
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentRow.create_time }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <el-dialog v-model="rejectDialogVisible" title="驳回原因" width="400px">
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请输入驳回原因"
      />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="sponsorDialogVisible" title="赞助需求情况" width="900px">
      <div v-if="sponsorList.length === 0" style="text-align: center; padding: 40px; color: #999">
        暂无赞助记录
      </div>
      <el-table v-else :data="sponsorList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="需求标题" width="200">
          <template #default="{ row }">
            {{ row.activity?.title || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="需求类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getDemandTypeText(row.activity?.demand_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="赞助类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.sponsor_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sponsor_detail" label="赞助详情" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSponsorStatusType(row.status)">
              {{ getSponsorStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="报名时间" width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const currentRow = ref(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const sponsorDialogVisible = ref(false)
const sponsorList = ref([])
const pendingRow = ref(null)

const isSuperAdmin = computed(() => {
  const userStr = localStorage.getItem('admin_user')
  const user = userStr ? JSON.parse(userStr) : {}
  return user.role === 'super_admin'
})

const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return texts[status] || '未知'
}

const getMemberType = (level) => {
  const types = { 0: 'info', 1: '', 2: 'warning', 3: 'success' }
  return types[level] || 'info'
}

const getMemberText = (level) => {
  const texts = { 0: '免费普通会员', 1: '银卡会员', 2: '金卡会员', 3: '钻石会员' }
  return texts[level] || '免费普通会员'
}

const getImageUrl = (url) => {
  if (!url || url === 'null' || url === 'undefined') {
    return 'https://via.placeholder.com/40'
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace('http://localhost:3000', 'http://localhost:3001')
  }
  return `http://localhost:3001${url}`
}

const getDemandTypeText = (type) => {
  const map = {
    activity: '活动需求',
    space: '场地招商',
    consult: '专家顾问'
  }
  return map[type] || type || '活动需求'
}

const getSponsorStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info'
  }
  return types[status] || 'info'
}

const getSponsorStatusText = (status) => {
  const texts = {
    0: '待确认',
    1: '已通过',
    2: '已拒绝',
    3: '已完成'
  }
  return texts[status] || '未知'
}

const parseJson = (str) => {
  try {
    return JSON.parse(str) || []
  } catch {
    return []
  }
}

const parseJsonObj = (str) => {
  try {
    return JSON.parse(str) || {}
  } catch {
    return {}
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchText.value
    }
    if (statusFilter.value !== '') {
      params.status = statusFilter.value
    }
    const res = await api.merchant.getList(params)
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

const handleViewSponsor = async (row) => {
  try {
    const res = await api.merchant.getSponsorList(row.id)
    if (res.code === 200) {
      sponsorList.value = res.data || []
      sponsorDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取赞助情况失败')
  }
}

const handleAudit = (row, status) => {
  if (status === 2) {
    pendingRow.value = row
    rejectReason.value = ''
    rejectDialogVisible.value = true
  } else {
    ElMessageBox.confirm('确定通过该商家的审核吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      const res = await api.merchant.audit(row.id, { status: 1 })
      if (res.code === 200) {
        ElMessage.success('审核成功')
        fetchList()
      }
    }).catch(() => {})
  }
}

const confirmReject = async () => {
  if (!rejectReason.value) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  
  const res = await api.merchant.audit(pendingRow.value.id, {
    status: 2,
    reject_reason: rejectReason.value
  })
  
  if (res.code === 200) {
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    fetchList()
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商家"${row.business_name}"吗？此操作不可恢复！`,
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  ).then(async () => {
    try {
      const res = await api.merchant.delete(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else if (res.code === 403) {
        ElMessage.error('无权限删除，仅超级管理员可执行此操作')
      }
    } catch (error) {
      if (error.response?.status === 403) {
        ElMessage.error('无权限删除，仅超级管理员可执行此操作')
      } else {
        ElMessage.error('删除失败')
      }
    }
  }).catch(() => {})
}

onMounted(() => {
  if (route.query.status !== undefined) {
    statusFilter.value = Number(route.query.status)
  }
  fetchList()
})
</script>

<style lang="scss" scoped>
.merchant-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}
</style>
