<template>
  <div class="community-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>社区管理</span>
          <div class="header-right">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
            <el-input
              v-model="searchText"
              placeholder="搜索社区名称"
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
        <el-table-column prop="community_name" label="社区名称" min-width="150" />
        <el-table-column prop="contact_name" label="负责人" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="street" label="所属街道" width="120" />
        <el-table-column prop="total_households" label="户数" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="注册时间" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
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
    
    <el-dialog v-model="dialogVisible" title="社区详情" width="600px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="社区名称">{{ currentRow.community_name }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentRow.contact_name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentRow.phone }}</el-descriptions-item>
        <el-descriptions-item label="所属街道">{{ currentRow.street }}</el-descriptions-item>
        <el-descriptions-item label="详细地址" :span="2">{{ currentRow.address }}</el-descriptions-item>
        <el-descriptions-item label="居民户数">{{ currentRow.total_households }}</el-descriptions-item>
        <el-descriptions-item label="老年人占比">{{ currentRow.elderly_ratio }}%</el-descriptions-item>
        <el-descriptions-item label="青少年家庭占比">{{ currentRow.youth_family_ratio }}%</el-descriptions-item>
        <el-descriptions-item label="公共空间面积">{{ currentRow.public_space_area }}㎡</el-descriptions-item>
        <el-descriptions-item label="所辖小区" :span="2">{{ currentRow.residential_areas }}</el-descriptions-item>
        <el-descriptions-item label="辖区商户">{{ currentRow.nearby_merchants }}</el-descriptions-item>
        <el-descriptions-item label="资质证明">
          <el-image
            v-if="currentRow.license_img"
            :src="currentRow.license_img"
            style="width: 100px"
            :preview-src-list="[currentRow.license_img]"
          />
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
    const res = await api.community.getList(params)
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

const handleAudit = (row, status) => {
  if (status === 2) {
    pendingRow.value = row
    rejectReason.value = ''
    rejectDialogVisible.value = true
  } else {
    ElMessageBox.confirm('确定通过该社区的审核吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      const res = await api.community.audit(row.id, { status: 1 })
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
  
  const res = await api.community.audit(pendingRow.value.id, {
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
    `确定要删除社区"${row.community_name}"吗？此操作不可恢复！`,
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  ).then(async () => {
    try {
      const res = await api.community.delete(row.id)
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
.community-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
