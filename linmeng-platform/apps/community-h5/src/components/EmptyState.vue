<template>
  <div class="empty-state">
    <div class="empty-icon">
      <van-icon :name="icon" :size="iconSize" :color="iconColor" />
    </div>
    <div class="empty-text">{{ text }}</div>
    <div v-if="description" class="empty-description">{{ description }}</div>
    <van-button
      v-if="buttonText"
      type="primary"
      size="small"
      round
      class="empty-button"
      @click="$emit('action')"
    >
      {{ buttonText }}
    </van-button>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'todo-list-o'
  },
  iconSize: {
    type: [Number, String],
    default: 64
  },
  iconColor: {
    type: String,
    default: '#dcdee0'
  },
  text: {
    type: String,
    default: '暂无数据'
  },
  description: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  animation: fadeIn 0.3s ease;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: var(--text-placeholder);
  margin-bottom: 16px;
  text-align: center;
  max-width: 240px;
}

.empty-button {
  margin-top: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
