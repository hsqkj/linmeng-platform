<template>
  <div class="activity-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <div class="header-actions">
            <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px">
              <el-option label="待审核" :value="0" />
              <el-option label="招募中" :value="1" />
              <el-option label="进行中" :value="2" />
              <el-option label="已完成" :value="3" />
            </el-select>
            <el-input
              v-model="searchText"
              placeholder="搜索活动名称"
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
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.cover_img || 'https://via.placeholder.com/80'"
              style="width: 80px; height: 60px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="活动名称" min-width="180" />
        <el-table-column prop="community_name" label="发布社区" width="120" />
        <el-table-column prop="start_time" label="开始时间" width="160" />
        <el-table-column prop="location" label="地点" width="120" show-overflow-tooltip />
        <el-table-column prop="expected_count" label="人数" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
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
              v-if="row.status === 1"
              type="warning"
              link
              @click="handleSupplement(row)"
            >
              补充
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
    
    <el-dialog v-model="dialogVisible" title="活动详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="活动名称" :span="2">{{ currentRow.title }}</el-descriptions-item>
        <el-descriptions-item label="发布社区">{{ currentRow.community_name }}</el-descriptions-item>
        <el-descriptions-item label="预计人数">{{ currentRow.expected_count }}人</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRow.start_time }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentRow.end_time }}</el-descriptions-item>
        <el-descriptions-item label="活动地点" :span="2">{{ currentRow.location }}</el-descriptions-item>
        <el-descriptions-item label="面向人群">{{ currentRow.target_crowd }}</el-descriptions-item>
        <el-descriptions-item label="需求赞助">{{ currentRow.sponsor_types }}</el-descriptions-item>
        <el-descriptions-item label="活动简介" :span="2">{{ currentRow.description }}</el-descriptions-item>
        <el-descriptions-item label="商家回报" :span="2">{{ currentRow.returns }}</el-descriptions-item>
        <el-descriptions-item label="活动封面" :span="2">
          <el-image
            v-if="currentRow.cover_img"
            :src="currentRow.cover_img"
            style="width: 200px"
            :preview-src-list="[currentRow.cover_img]"
          />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <el-dialog v-model="supplementDialogVisible" title="补充内容" width="600px">
      <el-form :model="supplementForm" label-width="80px">
        <el-form-item label="补充内容">
          <el-input
            v-model="supplementForm.extra_content"
            type="textarea"
            :rows="4"
            placeholder="请输入补充内容"
          />
        </el-form-item>
        <el-form-item label="补充图片">
          <el-upload
            action="/api/upload"
            :headers="{ Authorization: `Bearer ${localStorage.getItem('admin_token')}` }"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :file-list="fileList"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="supplementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSupplement">确定</el-button>
      </template>
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
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../../api'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')
const filterStatus = ref(null)
const dialogVisible = ref(false)
const currentRow = ref(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const pendingRow = ref(null)
const supplementDialogVisible = ref(false)
const supplementForm = reactive({
  extra_content: '',
  extra_images: []
})
const fileList = ref([])

const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info', 4: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '待审核', 1: '招募中', 2: '进行中', 3: '已完成', 4: '已取消' }
  return texts[status] || '未知'
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await api.activity.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchText.value,
      status: filterStatus.value
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

const handleAudit = (row, status) => {
  if (status === 2) {
    pendingRow.value = row
    rejectReason.value = ''
    rejectDialogVisible.value = true
  } else {
    ElMessageBox.confirm('确定通过该活动的审核吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      const res = await api.activity.audit(row.id, { status: 1 })
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
  
  const res = await api.activity.audit(pendingRow.value.id, {
    status: 2,
    reject_reason: rejectReason.value
  })
  
  if (res.code === 200) {
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    fetchList()
  }
}

const handleSupplement = (row) => {
  pendingRow.value = row
  supplementForm.extra_content = row.extra_content || ''
  supplementForm.extra_images = []
  fileList.value = []
  supplementDialogVisible.value = true
}

const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    supplementForm.extra_images.push(response.data.url)
  }
}

const confirmSupplement = async () => {
  const res = await api.activity.supplement(pendingRow.value.id, {
    extra_content: supplementForm.extra_content,
    extra_images: supplementForm.extra_images.join(',')
  })
  
  if (res.code === 200) {
    ElMessage.success('补充成功')
    supplementDialogVisible.value = false
    fetchList()
  }
}

watch(filterStatus, () => {
  page.value = 1
  fetchList()
})

onMounted(() => {
  if (route.query.status !== undefined) {
    filterStatus.value = Number(route.query.status)
  }
  fetchList()
})
</script>

<style lang="scss" scoped>
.activity-list {
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
