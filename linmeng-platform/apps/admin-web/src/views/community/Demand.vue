<template>
  <div class="demand-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>社区需求管理</span>
          <div class="header-right">
            <el-select v-model="demandTypeFilter" placeholder="需求类型" clearable style="width: 120px; margin-right: 10px" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="活动需求" value="activity" />
              <el-option label="场地招商" value="space" />
              <el-option label="专家顾问" value="consult" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="待审核" :value="0" />
              <el-option label="招募中" :value="1" />
              <el-option label="已完成" :value="3" />
            </el-select>
            <el-input
              v-model="searchText"
              placeholder="搜索需求标题"
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
        <el-table-column label="社区" width="150">
          <template #default="{ row }">
            <div>{{ row.community?.community_name || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="需求标题" min-width="150" />
        <el-table-column label="需求类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getDemandTypeText(row.demand_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="160" />
        <el-table-column prop="end_time" label="结束时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布时间" width="160" />
        <el-table-column prop="update_time" label="修改时间" width="160" />
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="info" link @click="handleViewRecruit(row)">招募情况</el-button>
            <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
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
    
    <el-dialog v-model="dialogVisible" title="需求详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="需求标题">{{ currentRow.title }}</el-descriptions-item>
        <el-descriptions-item label="需求类型">{{ getDemandTypeText(currentRow.demand_type) }}</el-descriptions-item>
        <el-descriptions-item label="社区">{{ currentRow.community?.community_name }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentRow.contact_name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentRow.contact_phone }}</el-descriptions-item>
        <el-descriptions-item label="活动地点">{{ currentRow.location }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRow.start_time }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentRow.end_time }}</el-descriptions-item>
        <el-descriptions-item label="需求描述" :span="2">{{ currentRow.description }}</el-descriptions-item>
        <el-descriptions-item label="所需资源" :span="2">{{ currentRow.required_resources }}</el-descriptions-item>
        <el-descriptions-item label="可提供回报" :span="2">{{ currentRow.return_offer || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentRow.create_time }}</el-descriptions-item>
        <el-descriptions-item label="修改时间">{{ currentRow.update_time || '未修改' }}</el-descriptions-item>
        <el-descriptions-item label="平台补充内容" :span="2">{{ currentRow.extra_content || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <el-dialog v-model="editDialogVisible" title="编辑需求" width="700px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入需求标题" />
        </el-form-item>
        <el-form-item label="需求类型" prop="demand_type">
          <el-select v-model="editForm.demand_type" placeholder="请选择需求类型" style="width: 100%">
            <el-option label="活动需求" value="activity" />
            <el-option label="场地招商" value="space" />
            <el-option label="专家顾问" value="consult" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动地点">
          <el-input v-model="editForm.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="editForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="editForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="需求描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入需求描述"
          />
        </el-form-item>
        <el-form-item label="平台补充内容">
          <el-input
            v-model="editForm.extra_content"
            type="textarea"
            :rows="3"
            placeholder="平台可补充相关内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit" :loading="editSubmitting">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="recruitDialogVisible" title="招募商家情况" width="900px">
      <div v-if="recruitList.length === 0" style="text-align: center; padding: 40px; color: #999">
        暂无商家报名
      </div>
      <el-table v-else :data="recruitList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="商家名称" width="150">
          <template #default="{ row }">
            {{ row.merchant?.business_name || '-' }}
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
            <el-tag :type="getRecruitStatusType(row.status)">
              {{ getRecruitStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="报名时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              @click="handleRecruitAudit(row, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              @click="handleRecruitAudit(row, 2)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../api/request'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')
const statusFilter = ref('')
const demandTypeFilter = ref('')
const dialogVisible = ref(false)
const currentRow = ref(null)
const editDialogVisible = ref(false)
const editSubmitting = ref(false)
const editFormRef = ref()
const recruitDialogVisible = ref(false)
const recruitList = ref([])

const isSuperAdmin = computed(() => {
  const userStr = localStorage.getItem('admin_user')
  const user = userStr ? JSON.parse(userStr) : {}
  return user.role === 'super_admin'
})

const editForm = reactive({
  id: '',
  title: '',
  demand_type: '',
  location: '',
  start_time: '',
  end_time: '',
  description: '',
  extra_content: ''
})

const editRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  demand_type: [{ required: true, message: '请选择需求类型', trigger: 'change' }]
}

const demandTypeMap = {
  activity: '活动需求',
  space: '场地招商',
  consult: '专家顾问',
  event: '活动需求',
  venue: '场地需求',
  expert: '专家顾问',
  other: '其他需求'
}

const getDemandTypeText = (type) => {
  return demandTypeMap[type] || type || '活动需求'
}

const getStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    0: '待审核',
    1: '招募中',
    2: '已驳回',
    3: '已完成'
  }
  return texts[status] || '未知'
}

const getRecruitStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info'
  }
  return types[status] || 'info'
}

const getRecruitStatusText = (status) => {
  const texts = {
    0: '待确认',
    1: '已通过',
    2: '已拒绝',
    3: '已完成'
  }
  return texts[status] || '未知'
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    if (searchText.value) {
      params.keyword = searchText.value
    }
    
    if (statusFilter.value !== '') {
      params.status = statusFilter.value
    }
    
    if (demandTypeFilter.value !== '') {
      params.type = demandTypeFilter.value
    }
    
    const res = await request.get('/admin/activity/list', { params })
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

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.title = row.title
  editForm.demand_type = row.demand_type
  editForm.location = row.location || ''
  editForm.start_time = row.start_time || ''
  editForm.end_time = row.end_time || ''
  editForm.description = row.description || ''
  editForm.extra_content = row.extra_content || ''
  editDialogVisible.value = true
}

const handleEditSubmit = async () => {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  editSubmitting.value = true
  try {
    const res = await request.put(`/admin/activity/update/${editForm.id}`, {
      title: editForm.title,
      demand_type: editForm.demand_type,
      location: editForm.location,
      start_time: editForm.start_time,
      end_time: editForm.end_time,
      description: editForm.description,
      extra_content: editForm.extra_content
    })
    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      fetchList()
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '更新失败')
  } finally {
    editSubmitting.value = false
  }
}

const handleAudit = (row, status) => {
  const text = status === 1 ? '通过' : '驳回'
  ElMessageBox.confirm(`确定要${text}该需求吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request.put(`/admin/activity/audit/${row.id}`, { status })
      if (res.code === 200) {
        ElMessage.success(`${text}成功`)
        fetchList()
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.message || `${text}失败`)
    }
  }).catch(() => {})
}

const handleViewRecruit = async (row) => {
  try {
    const res = await request.get(`/admin/cooperation/list/${row.id}`)
    if (res.code === 200) {
      recruitList.value = res.data || []
      recruitDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取招募情况失败')
  }
}

const handleRecruitAudit = (row, status) => {
  const text = status === 1 ? '通过' : '拒绝'
  ElMessageBox.confirm(`确定要${text}该商家的报名吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request.put(`/admin/cooperation/audit/${row.id}`, { status })
      if (res.code === 200) {
        ElMessage.success(`${text}成功`)
        handleViewRecruit({ id: row.activity_id })
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.message || `${text}失败`)
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除需求"${row.title}"吗？此操作不可恢复！`,
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  ).then(async () => {
    try {
      const res = await request.delete(`/admin/activity/${row.id}`)
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
    statusFilter.value = parseInt(route.query.status)
  }
  fetchList()
})
</script>

<style lang="scss" scoped>
.demand-list {
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
