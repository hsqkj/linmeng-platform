<template>
  <div class="match-score">
    <span class="match-label">匹配度：</span>
    <div class="hearts-container">
      <van-icon
        v-for="i in 5"
        :key="i"
        :name="i <= hearts ? 'like' : 'like-o'"
        :class="['heart', { active: i <= hearts }]"
        :style="{ animationDelay: `${i * 0.1}s` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: Number,
    default: 0
  }
})

const hearts = computed(() => {
  if (props.score >= 80) return 5
  if (props.score >= 60) return 4
  if (props.score >= 40) return 3
  if (props.score >= 20) return 2
  if (props.score >= 5) return 1
  return 0
})
</script>

<style scoped>
.match-score {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.match-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.hearts-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.heart {
  font-size: 16px;
  color: var(--border-base);
  transition: all 0.3s ease;
}

.heart.active {
  color: #ff6b6b;
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>
