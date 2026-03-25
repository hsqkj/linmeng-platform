<template>
  <div class="tag-library-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>标签库管理</span>
          <el-button type="primary" @click="handleCreate">新增标签</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable @change="handleSearch">
            <el-option label="需求标签" value="demand" />
            <el-option label="商家标签" value="merchant" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable @change="handleSearch">
            <el-option label="赞助类型" value="sponsor" />
            <el-option label="人群" value="crowd" />
            <el-option label="行业" value="industry" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="请输入标签名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="标签名称" />
        <el-table-column prop="category" label="标签分类">
          <template #default="{ row }">
            <el-tag :type="row.category === 'demand' ? 'primary' : 'success'">
              {{ row.category === 'demand' ? '需求标签' : '商家标签' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="标签类型">
          <template #default="{ row }">
            <el-tag v-if="row.type" type="info">{{ getTypeText(row.type) }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="标签分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择标签分类" style="width: 100%">
            <el-option label="需求标签" value="demand" />
            <el-option label="商家标签" value="merchant" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择标签类型" style="width: 100%" clearable>
            <el-option label="赞助类型" value="sponsor" />
            <el-option label="人群" value="crowd" />
            <el-option label="行业" value="industry" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../api/request'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增标签')
const formRef = ref(null)

const searchForm = reactive({
  category: '',
  type: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  category: '',
  type: '',
  sort_order: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择标签分类', trigger: 'change' }]
}

const getTypeText = (type) => {
  const typeMap = {
    sponsor: '赞助类型',
    crowd: '人群',
    industry: '行业',
    other: '其他'
  }
  return typeMap[type] || type
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/tag/list', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      }
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleReset = () => {
  searchForm.category = ''
  searchForm.type = ''
  searchForm.keyword = ''
  handleSearch()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchList()
}

const handleCurrentChange = () => {
  fetchList()
}

const handleCreate = () => {
  dialogTitle.value = '新增标签'
  form.id = null
  form.name = ''
  form.category = ''
  form.type = ''
  form.sort_order = 0
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑标签'
  form.id = row.id
  form.name = row.name
  form.category = row.category
  form.type = row.type || ''
  form.sort_order = row.sort_order
  form.status = row.status
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(`确定要${action}该标签吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await request.put(`/tag/${row.id}`, { status: newStatus })
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      fetchList()
    } else {
      ElMessage.error(res.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}标签失败:`, error)
      ElMessage.error(`${action}失败`)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该标签吗？删除后无法恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await request.delete(`/tag/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      let res
      if (form.id) {
        res = await request.put(`/tag/${form.id}`, form)
      } else {
        res = await request.post('/tag/create', form)
      }
      
      if (res.code === 200) {
        ElMessage.success(form.id ? '编辑成功' : '创建成功')
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.tag-library-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
