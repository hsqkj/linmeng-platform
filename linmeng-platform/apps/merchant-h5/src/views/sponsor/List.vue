<template>
  <div class="sponsor-list-page">
    <van-nav-bar title="我的赞助信息" left-arrow @click-left="router.back()">
      <template #right>
        <van-icon name="plus" size="20" @click="router.push('/sponsor/create')" />
      </template>
    </van-nav-bar>
    
    <div class="list-content" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="sponsor-item"
        @click="showDetail(item)"
      >
        <div class="item-header">
          <span class="title">{{ item.title }}</span>
          <van-tag :type="item.status === 1 ? 'success' : 'default'">
            {{ item.status === 1 ? '上架中' : '已下架' }}
          </van-tag>
        </div>
        <div class="item-type">
          <van-tag plain>{{ item.sponsor_type }}</van-tag>
        </div>
        <div class="item-detail">{{ item.sponsor_detail }}</div>
        <div class="item-footer">
          <span class="time">{{ formatDateTime(item.create_time) }}</span>
          <div class="actions">
            <van-button size="small" :type="item.status === 1 ? 'default' : 'primary'" @click.stop="toggleStatus(item)">
              {{ item.status === 1 ? '下架' : '上架' }}
            </van-button>
            <van-button size="small" type="danger" @click.stop="handleDelete(item)">删除</van-button>
          </div>
        </div>
      </div>
    </div>
    
    <van-empty v-else description="暂无赞助信息">
      <van-button type="primary" round @click="router.push('/sponsor/create')">发布赞助信息</van-button>
    </van-empty>
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="popup-content" v-if="selectedItem">
        <div class="popup-header">
          <h3>赞助详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        <div class="popup-body">
          <van-cell-group inset>
            <van-cell title="标题" :value="selectedItem.title" />
            <van-cell title="赞助类型" :value="selectedItem.sponsor_type" />
            <van-cell title="赞助详情" :label="selectedItem.sponsor_detail" />
            <van-cell title="联系人" :value="selectedItem.contact_name || '未设置'" />
            <van-cell title="联系电话" :value="selectedItem.contact_phone || '未设置'" />
            <van-cell title="发布时间" :value="formatDateTime(selectedItem.create_time)" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showConfirmDialog } from 'vant'
import api from '../../api'
import { formatDateTime } from '../../utils'

const router = useRouter()
const list = ref([])
const showDetailPopup = ref(false)
const selectedItem = ref(null)

const fetchList = async () => {
  try {
    const res = await api.sponsor.getMy()
    if (res.code === 200) {
      list.value = res.data || []
    }
  } catch (error) {
    console.error('获取列表失败:', error)
  }
}

const showDetail = (item) => {
  selectedItem.value = item
  showDetailPopup.value = true
}

const toggleStatus = async (item) => {
  try {
    const newStatus = item.status === 1 ? 0 : 1
    const res = await api.sponsor.updateStatus(item.id, { status: newStatus })
    if (res.code === 200) {
      showSuccessToast(res.message)
      fetchList()
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleDelete = async (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除这条赞助信息吗？'
  })
    .then(async () => {
      try {
        const res = await api.sponsor.delete(item.id)
        if (res.code === 200) {
          showSuccessToast('删除成功')
          fetchList()
        }
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.sponsor-list-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.list-content {
  padding: 12px;
}

.sponsor-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.item-type {
  margin-bottom: 8px;
}

.item-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-footer .time {
  font-size: 12px;
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}
</style>
