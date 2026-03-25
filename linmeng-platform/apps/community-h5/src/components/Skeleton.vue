<template>
  <div class="skeleton">
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-header">
        <van-skeleton-avatar />
        <div class="skeleton-title">
          <van-skeleton-paragraph row-width="60%" />
          <van-skeleton-paragraph row-width="40%" />
        </div>
      </div>
      <van-skeleton-paragraph :row="3" />
    </div>
    
    <div v-else-if="type === 'list'" class="skeleton-list">
      <van-skeleton v-for="i in rows" :key="i" :row="1" class="skeleton-item">
        <template #template>
          <van-skeleton-avatar />
          <van-skeleton-paragraph />
        </template>
      </van-skeleton>
    </div>
    
    <div v-else-if="type === 'stat'" class="skeleton-stat">
      <van-skeleton-avatar size="48" />
      <div class="skeleton-stat-content">
        <van-skeleton-paragraph row-width="50%" />
        <van-skeleton-paragraph row-width="30%" />
      </div>
    </div>
    
    <van-skeleton v-else :row="rows" />
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'list', 'stat'].includes(value)
  },
  rows: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton {
  animation: fadeIn 0.3s ease;
}

.skeleton-card {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  margin: var(--spacing-md);
}

.skeleton-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-title {
  flex: 1;
}

.skeleton-list {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.skeleton-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-lighter);
}

.skeleton-item:last-child {
  border-bottom: none;
}

.skeleton-stat {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
}

.skeleton-stat-content {
  flex: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
