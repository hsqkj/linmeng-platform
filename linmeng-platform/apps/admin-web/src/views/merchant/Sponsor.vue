<template>
  <div class="sponsor-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商家赞助管理</span>
          <div class="header-right">
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
        <el-table-column label="商家" width="150">
          <template #default="{ row }">
            <div>{{ row.business?.business_name || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="赞助标题" min-width="150" />
        <el-table-column label="赞助类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getSponsorTypeText(row.sponsor_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="赞助描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="图片/视频" width="100">
          <template #default="{ row }">
            <el-button 
              v-if="row.images && row.images.length > 0" 
              type="primary" 
              link 
              @click="handleViewMedia(row.images)"
            >
              查看
            </el-button>
            <span v-else style="color: #999">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="浏览次数" width="100" />
        <el-table-column prop="consult_count" label="咨询次数" width="100" />
        <el-table-column prop="create_time" label="发布时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
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
    
    <el-dialog v-model="mediaDialogVisible" title="图片/视频" width="800px">
      <div class="media-list">
        <div v-for="(item, index) in currentMedia" :key="index" class="media-item">
          <el-image
            v-if="isImage(item)"
            :src="item"
            :preview-src-list="currentMedia.filter(m => isImage(m))"
            :initial-index="index"
            fit="cover"
            style="width: 100%; height: 200px"
          />
          <video v-else :src="item" controls style="width: 100%; height: 200px" />
        </div>
      </div>
    </el-dialog>
    
    <el-dialog v-model="viewDialogVisible" title="赞助详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="商家名称">{{ currentRow.merchant?.business_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="赞助标题">{{ currentRow.title }}</el-descriptions-item>
        <el-descriptions-item label="赞助类型">
          <el-tag>{{ getSponsorTypeText(currentRow.sponsor_type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="浏览次数">{{ currentRow.view_count || 0 }}</el-descriptions-item>
        <el-descriptions-item label="咨询次数">{{ currentRow.consult_count || 0 }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentRow.create_time }}</el-descriptions-item>
        <el-descriptions-item label="赞助描述" :span="2">{{ currentRow.description || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="图片/视频" :span="2">
          <div v-if="currentRow.images && currentRow.images.length > 0" class="media-preview">
            <el-image
              v-for="(item, index) in currentRow.images.slice(0, 3)"
              :key="index"
              v-if="isImage(item)"
              :src="item"
              :preview-src-list="currentRow.images.filter(m => isImage(m))"
              :initial-index="index"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px"
            />
            <el-button 
              v-if="currentRow.images.length > 3"
              type="primary" 
              link 
              @click="handleViewMedia(currentRow.images)"
            >
              查看全部
            </el-button>
          </div>
          <span v-else>暂无</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../api/request'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')
const mediaDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const currentMedia = ref([])
const currentRow = ref(null)

const isSuperAdmin = computed(() => {
  const userStr = localStorage.getItem('admin_user')
  const user = userStr ? JSON.parse(userStr) : {}
  return user.role === 'super_admin'
})

const sponsorTypeMap = {
  material: '物资类',
  venue: '场地类',
  service: '服务类',
  manpower: '人力类',
  media: '媒体类',
  other: '其他'
}

const getSponsorTypeText = (type) => {
  return sponsorTypeMap[type] || type
}

const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
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
    
    const res = await request.get('/admin/sponsor/list', { params })
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

const handleViewMedia = (images) => {
  currentMedia.value = images || []
  mediaDialogVisible.value = true
}

const handleView = (row) => {
  currentRow.value = row
  viewDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除赞助信息"${row.title}"吗？此操作不可恢复！`,
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  ).then(async () => {
    try {
      const res = await request.delete(`/admin/sponsor/delete/${row.id}`)
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
        ElMessage.error(error.response?.data?.message || '删除失败')
      }
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.sponsor-list {
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

.media-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  .media-item {
    border-radius: 4px;
    overflow: hidden;
  }
}
</style>
