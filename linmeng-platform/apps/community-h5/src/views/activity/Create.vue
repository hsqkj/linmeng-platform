<template>
  <div class="create-page">
    <van-nav-bar title="发布需求" left-arrow @click-left="router.back()" />
    
    <van-form @submit="onSubmit" class="form">
      <van-notice-bar
        left-icon="info-o"
        color="#1989fa"
        background="#ecf9ff"
        style="margin: 12px 0"
      >
        填写的越详细，匹配度越精准，获得商家赞助的机会越大
      </van-notice-bar>
      
      <van-cell-group inset title="需求类型">
        <van-field name="demand_type" label="需求类型" required>
          <template #input>
            <van-radio-group v-model="form.demand_type" direction="horizontal">
              <van-radio name="activity">活动需求</van-radio>
              <van-radio name="space">场地招商</van-radio>
              <van-radio name="consult">专家顾问</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>
      
      <van-cell-group inset title="基本信息" v-if="form.demand_type === 'activity'">
        <van-field
          v-model="form.title"
          name="title"
          label="活动名称"
          placeholder="请输入完整活动名称"
          required
          :rules="[{ required: true, message: '请输入活动名称' }]"
        />
        
        <van-field
          v-model="form.start_time"
          is-link
          readonly
          name="start_time"
          label="开始时间"
          placeholder="请选择开始时间"
          required
          @click="showStartTime = true"
        />
        <van-popup v-model:show="showStartTime" position="bottom">
          <van-date-picker
            v-model="startTimeValue"
            title="选择开始时间"
            @confirm="onStartTimeConfirm"
            @cancel="showStartTime = false"
          />
        </van-popup>
        
        <van-field
          v-model="form.end_time"
          is-link
          readonly
          name="end_time"
          label="结束时间"
          placeholder="请选择结束时间"
          required
          @click="showEndTime = true"
        />
        <van-popup v-model:show="showEndTime" position="bottom">
          <van-date-picker
            v-model="endTimeValue"
            title="选择结束时间"
            @confirm="onEndTimeConfirm"
            @cancel="showEndTime = false"
          />
        </van-popup>
        
        <van-field
          v-model="form.location"
          name="location"
          label="活动地点"
          placeholder="请填写详细活动地点"
          required
          :rules="[{ required: true, message: '请输入活动地点' }]"
        />
        
        <van-field
          v-model="form.expected_count"
          name="expected_count"
          label="预计人数"
          placeholder="请输入预计人数"
          type="digit"
        />
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>准确填写预计人数，有助于商家评估赞助能力</span>
        </div>
        
        <van-field name="target_crowd" label="面向人群" required>
          <template #input>
            <van-radio-group v-model="form.target_crowd" direction="horizontal">
              <van-radio name="亲子/少儿">亲子/少儿</van-radio>
              <van-radio name="中老年">中老年</van-radio>
              <van-radio name="青年白领">青年白领</van-radio>
              <van-radio name="宝妈">宝妈</van-radio>
              <van-radio name="全社区居民">全社区居民</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>选择准确的目标人群，可提高匹配度25%</span>
        </div>
        
        <van-field name="sponsor_types" label="需求赞助类型" required>
          <template #input>
            <van-checkbox-group v-model="form.sponsor_types" direction="horizontal">
              <van-checkbox name="现金">现金赞助</van-checkbox>
              <van-checkbox name="物资">物资赞助</van-checkbox>
              <van-checkbox name="人力">人力支持</van-checkbox>
              <van-checkbox name="场地">场地提供</van-checkbox>
              <van-checkbox name="媒体">媒体宣传</van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>选择准确的赞助类型，可提高匹配度30%</span>
        </div>
        
        <van-field
          v-if="form.sponsor_types.includes('现金')"
          v-model="form.need_detail.现金"
          rows="2"
          autosize
          label="现金需求"
          type="textarea"
          placeholder="请填写所需赞助金额区间、资金用途"
          required
        />
        
        <van-field
          v-if="form.sponsor_types.includes('物资')"
          v-model="form.need_detail.物资"
          rows="2"
          autosize
          label="物资需求"
          type="textarea"
          placeholder="请填写物资名称、规格、数量、交付时间要求"
          required
        />
        
        <van-field
          v-if="form.sponsor_types.includes('人力')"
          v-model="form.need_detail.人力"
          rows="2"
          autosize
          label="人力需求"
          type="textarea"
          placeholder="请填写所需人力数量、专业要求、服务时长"
          required
        />
        
        <van-field
          v-if="form.sponsor_types.includes('场地')"
          v-model="form.need_detail.场地"
          rows="2"
          autosize
          label="场地需求"
          type="textarea"
          placeholder="请填写场地面积、场地要求、使用时段"
          required
        />
        
        <van-field
          v-if="form.sponsor_types.includes('媒体')"
          v-model="form.need_detail.媒体"
          rows="2"
          autosize
          label="媒体需求"
          type="textarea"
          placeholder="请填写媒体宣传形式、报道要求、传播范围"
          required
        />
        
        <van-field
          v-model="form.description"
          rows="4"
          autosize
          label="活动简介"
          type="textarea"
          placeholder="请详细描述活动流程、受众群体、活动规模、预期效果"
        />
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>详细描述活动内容，有助于商家了解需求，提高匹配度</span>
        </div>
        
        <van-field name="returns" label="商家回报">
          <template #input>
            <van-checkbox-group v-model="form.returns" direction="horizontal">
              <van-checkbox name="横幅宣传">现场横幅宣传</van-checkbox>
              <van-checkbox name="群推广">居民/业主群推广</van-checkbox>
              <van-checkbox name="展位">现场展位</van-checkbox>
              <van-checkbox name="证书">荣誉证书</van-checkbox>
              <van-checkbox name="口播">现场口播介绍</van-checkbox>
              <van-checkbox name="感谢">口头感谢</van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>提供合理的商家回报，可提高商家参与意愿</span>
        </div>
        
        <van-field name="tags" label="标签选择">
          <template #input>
            <div class="tag-selector">
              <van-tag
                v-for="tag in demandTags"
                :key="tag.id"
                :type="selectedTags.includes(tag.id) ? 'primary' : 'default'"
                size="medium"
                style="margin: 4px"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </van-tag>
            </div>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>选择相关标签，可提高匹配度5%</span>
        </div>
        
        <van-field
          v-model="customTagInput"
          name="custom_tag"
          label="自定义标签"
          placeholder="输入后点击添加按钮"
        >
          <template #button>
            <van-button size="small" type="primary" @click="addCustomTag">添加</van-button>
          </template>
        </van-field>
        
        <van-field name="custom_tags" label="已添加标签" v-if="customTags.length > 0">
          <template #input>
            <div class="tag-selector">
              <van-tag
                v-for="(tag, index) in customTags"
                :key="index"
                closeable
                type="success"
                size="medium"
                style="margin: 4px"
                @close="removeCustomTag(index)"
              >
                {{ tag }}
              </van-tag>
            </div>
          </template>
        </van-field>
      </van-cell-group>
      
      <van-cell-group inset title="场地招商信息" v-if="form.demand_type === 'space'">
        <van-field
          v-model="form.title"
          name="title"
          label="招商标题"
          placeholder="如：社区活动中心运营招商"
          required
          :rules="[{ required: true, message: '请输入招商标题' }]"
        />
        
        <van-field
          v-model="form.space_location"
          name="space_location"
          label="场地位置"
          placeholder="请填写场地详细地址"
          required
        />
        
        <van-field
          v-model="form.space_area"
          name="space_area"
          label="场地面积"
          placeholder="请填写场地面积（平方米）"
          type="digit"
        />
        
        <van-field
          v-model="form.space_type"
          name="space_type"
          label="场地类型"
          placeholder="如：活动中心、会议室、商铺等"
        />
        
        <van-field
          v-model="form.space_facilities"
          rows="2"
          autosize
          label="配套设施"
          type="textarea"
          placeholder="请描述场地现有设施设备"
        />
        
        <van-field
          v-model="form.space_requirements"
          rows="3"
          autosize
          label="招商要求"
          type="textarea"
          placeholder="请描述对运营方的要求，如经营资质、行业经验、合作模式等"
        />
        
        <van-field
          v-model="form.space_returns"
          rows="2"
          autosize
          label="合作回报"
          type="textarea"
          placeholder="请描述可提供的合作回报，如租金优惠、资源支持等"
        />
        
        <van-field
          v-model="form.description"
          rows="3"
          autosize
          label="补充说明"
          type="textarea"
          placeholder="其他需要说明的信息"
        />
      </van-cell-group>
      
      <van-cell-group inset title="专家顾问需求" v-if="form.demand_type === 'consult'">
        <van-field
          v-model="form.title"
          name="title"
          label="需求标题"
          placeholder="如：社区治理专家顾问咨询"
          required
          :rules="[{ required: true, message: '请输入需求标题' }]"
        />
        
        <van-field
          v-model="form.consult_field"
          name="consult_field"
          label="咨询领域"
          placeholder="如：社区治理、养老服务、物业管理等"
          required
        />
        
        <van-field
          v-model="form.consult_expertise"
          name="consult_expertise"
          label="专业要求"
          placeholder="请描述所需专家的专业背景"
        />
        
        <van-field
          v-model="form.consult_duration"
          name="consult_duration"
          label="咨询周期"
          placeholder="如：长期顾问、项目制、单次咨询"
        />
        
        <van-field
          v-model="form.consult_budget"
          name="consult_budget"
          label="预算范围"
          placeholder="请填写预算范围"
        />
        
        <van-field
          v-model="form.description"
          rows="4"
          autosize
          label="需求详情"
          type="textarea"
          placeholder="请详细描述咨询需求、期望达成的目标"
        />
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button type="primary" block round native-type="submit" :loading="loading">
          提交审核
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import api from '../../api'

const router = useRouter()
const loading = ref(false)
const showStartTime = ref(false)
const showEndTime = ref(false)
const startTimeValue = ref(['2024', '01', '01'])
const endTimeValue = ref(['2024', '01', '01'])
const demandTags = ref([])
const selectedTags = ref([])
const customTagInput = ref('')
const customTags = ref([])

const form = reactive({
  demand_type: 'activity',
  title: '',
  start_time: '',
  end_time: '',
  location: '',
  expected_count: '',
  target_crowd: '',
  sponsor_types: [],
  need_detail: {
    '现金': '',
    '物资': '',
    '人力': '',
    '场地': '',
    '媒体': ''
  },
  description: '',
  returns: [],
  space_location: '',
  space_area: '',
  space_type: '',
  space_facilities: '',
  space_requirements: '',
  space_returns: '',
  consult_field: '',
  consult_expertise: '',
  consult_duration: '',
  consult_budget: ''
})

const onStartTimeConfirm = ({ selectedValues }) => {
  form.start_time = selectedValues.join('-')
  showStartTime.value = false
}

const onEndTimeConfirm = ({ selectedValues }) => {
  form.end_time = selectedValues.join('-')
  showEndTime.value = false
}

const loadTags = async () => {
  try {
    const res = await api.tag.getAll({ category: 'demand' })
    if (res.code === 200) {
      demandTags.value = res.data || []
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const toggleTag = (tagId) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagId)
  }
}

const addCustomTag = () => {
  const tag = customTagInput.value.trim()
  if (!tag) {
    showToast('请输入标签名称')
    return
  }
  if (customTags.value.includes(tag)) {
    showToast('该标签已存在')
    return
  }
  if (customTags.value.length >= 10) {
    showToast('最多添加10个自定义标签')
    return
  }
  customTags.value.push(tag)
  customTagInput.value = ''
}

const removeCustomTag = (index) => {
  customTags.value.splice(index, 1)
}

const onSubmit = async () => {
  if (form.demand_type === 'activity') {
    if (!form.target_crowd) {
      showToast('请选择面向人群')
      return
    }
    
    if (form.sponsor_types.length === 0) {
      showToast('请选择需求赞助类型')
      return
    }
  }
  
  loading.value = true
  try {
    let submitData = {
      demand_type: form.demand_type,
      title: form.title,
      description: form.description
    }
    
    if (form.demand_type === 'activity') {
      const needDetailObj = {}
      form.sponsor_types.forEach(type => {
        if (form.need_detail[type]) {
          needDetailObj[type] = form.need_detail[type]
        }
      })
      
      submitData = {
        ...submitData,
        start_time: form.start_time,
        end_time: form.end_time,
        location: form.location,
        expected_count: form.expected_count ? parseInt(form.expected_count) : null,
        target_crowd: form.target_crowd,
        sponsor_types: form.sponsor_types.join(','),
        need_detail: JSON.stringify(needDetailObj),
        returns: form.returns.join(',')
      }
    } else if (form.demand_type === 'space') {
      submitData = {
        ...submitData,
        space_location: form.space_location,
        space_area: form.space_area,
        space_type: form.space_type,
        space_facilities: form.space_facilities,
        space_requirements: form.space_requirements,
        space_returns: form.space_returns
      }
    } else if (form.demand_type === 'consult') {
      submitData = {
        ...submitData,
        consult_field: form.consult_field,
        consult_expertise: form.consult_expertise,
        consult_duration: form.consult_duration,
        consult_budget: form.consult_budget
      }
    }
    
    console.log('提交数据:', submitData)
    
    submitData.tags = JSON.stringify(selectedTags.value)
    submitData.custom_tags = JSON.stringify(customTags.value)
    
    const res = await api.activity.create(submitData)
    console.log('响应:', res)
    if (res.code === 200) {
      showSuccessToast('提交成功，等待审核')
      router.push('/activity/list')
    } else {
      showToast(res.message || '提交失败')
    }
  } catch (error) {
    console.error('提交错误:', error)
    showToast(error.response?.data?.message || '提交失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.create-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.form {
  padding: 12px;
}

.submit-btn {
  margin-top: 24px;
  padding: 0 12px;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  padding: 8px 0;
}

.field-tip {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  color: #1989fa;
  background: #ecf9ff;
  margin: 0 16px;
  border-radius: 4px;
}

.field-tip .van-icon {
  margin-right: 6px;
}
</style>
