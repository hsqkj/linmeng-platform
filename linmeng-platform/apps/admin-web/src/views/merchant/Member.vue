<template>
  <div class="member-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员管理</span>
          <div class="header-right">
            <el-select v-model="memberLevelFilter" placeholder="会员等级" clearable style="width: 120px; margin-right: 10px" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="免费普通会员" :value="0" />
              <el-option label="银卡会员" :value="1" />
              <el-option label="金卡会员" :value="2" />
              <el-option label="钻石会员" :value="3" />
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
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="会员等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getMemberType(row.member_level)">
              {{ getMemberText(row.member_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报名配额" width="120">
          <template #default="{ row }">
            <div>{{ row.member_level === 3 ? '不限' : (row.monthly_quota || 0) + '次/月' }}</div>
            <div v-if="row.member_level !== 3" style="font-size: 12px; color: #999">已用: {{ row.used_quota || 0 }}次</div>
          </template>
        </el-table-column>
        <el-table-column prop="member_expire_time" label="会员到期时间" width="160" />
        <el-table-column prop="create_time" label="注册时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="success" link @click="handleEdit(row)">调整等级</el-button>
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
    
    <el-dialog v-model="dialogVisible" title="调整会员等级" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商家名称">
          <el-input v-model="form.business_name" disabled />
        </el-form-item>
        <el-form-item label="会员等级" prop="member_level">
          <el-select v-model="form.member_level" placeholder="请选择会员等级" style="width: 100%">
            <el-option label="免费普通会员" :value="0" />
            <el-option label="银卡会员" :value="1" />
            <el-option label="金卡会员" :value="2" />
            <el-option label="钻石会员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间" prop="member_expire_time">
          <el-date-picker
            v-model="form.member_expire_time"
            type="datetime"
            placeholder="选择到期时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="viewDialogVisible" title="会员详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="Logo">
          <el-image
            :src="getImageUrl(currentRow.logo)"
            style="width: 60px"
            :preview-src-list="[getImageUrl(currentRow.logo)]"
          />
        </el-descriptions-item>
        <el-descriptions-item label="商家名称">{{ currentRow.business_name }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentRow.contact_name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentRow.phone }}</el-descriptions-item>
        <el-descriptions-item label="所属行业">{{ currentRow.industry }}</el-descriptions-item>
        <el-descriptions-item label="商家地址" :span="2">{{ currentRow.address }}</el-descriptions-item>
        <el-descriptions-item label="商家简介" :span="2">{{ currentRow.description || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="会员等级">
          <el-tag :type="getMemberType(currentRow.member_level)">
            {{ getMemberText(currentRow.member_level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="会员到期">{{ currentRow.member_expire_time || '未开通' }}</el-descriptions-item>
        <el-descriptions-item label="每月配额">{{ currentRow.member_level === 3 ? '不限' : (currentRow.monthly_quota || 0) + '次' }}</el-descriptions-item>
        <el-descriptions-item label="已使用" v-if="currentRow.member_level !== 3">{{ currentRow.used_quota || 0 }}次</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentRow.create_time }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../api/request'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')
const memberLevelFilter = ref('')
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const currentRow = ref(null)
const formRef = ref()

const form = reactive({
  id: '',
  business_name: '',
  member_level: 1,
  member_expire_time: ''
})

const rules = {
  member_level: [{ required: true, message: '请选择会员等级', trigger: 'change' }],
  member_expire_time: [{ required: true, message: '请选择到期时间', trigger: 'change' }]
}

const getMemberType = (level) => {
  const types = ['', 'info', 'primary', 'warning']
  return types[level] || ''
}

const getMemberText = (level) => {
  const texts = ['免费普通会员', '银卡会员', '金卡会员', '钻石会员']
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

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      status: 1
    }
    
    if (searchText.value) {
      params.keyword = searchText.value
    }
    
    if (memberLevelFilter.value !== '') {
      params.member_level = memberLevelFilter.value
    }
    
    const res = await request.get('/admin/merchant/list', { params })
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

const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return texts[status] || '未知'
}

const handleView = (row) => {
  currentRow.value = row
  viewDialogVisible.value = true
}

const handleEdit = (row) => {
  form.id = row.id
  form.business_name = row.business_name
  form.member_level = row.member_level || 1
  form.member_expire_time = row.member_expire_time || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    const res = await request.put(`/admin/merchant/update/${form.id}`, {
      member_level: form.member_level,
      member_expire_time: form.member_expire_time
    })
    if (res.code === 200) {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      fetchList()
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.member-list {
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
