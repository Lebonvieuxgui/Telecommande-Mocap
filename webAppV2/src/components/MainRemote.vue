<template>
  <el-card shadow="hover" class="MainRemoteCard">
    <div class="card-header">
      Record
    </div>
    <el-form :model="form" label-width="200px">
      <div class="file-info">
        <el-form-item label="File Name" style="margin-top: 30px">null_FILENAME</el-form-item>
        <el-form-item label="Duration">00:00:0</el-form-item>
      </div>
      <div class="sequence-group">
        <el-form-item label="Sequence" style="margin-top: 15px">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Take" style="margin-top: 15px; margin-right: 10px">
          <el-input-number v-model="num" :min="1" :max="10" @change="handleChange" />
        </el-form-item>
      </div>
      <el-form-item style="margin-top: 15px" class="record-button">
        <el-button v-bind:class="record ? 'recording' : 'not-recording'" @click="record = !record, onSubmit">
          <div v-if="record"><el-icon><VideoPause/></el-icon></div>
          <div v-else><el-icon><VideoPlay /></el-icon></div>
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { reactive } from 'vue'
import { ref } from 'vue'

const num = ref(1)
const handleChange = (value: number) => {
  console.log(value)
}

// do not use same name with ref
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const onSubmit = () => {
  console.log('submit!')
}

export default {
  data() {
    return {
      form,
      onSubmit,
      handleChange,
      num,
      record: false
    }
  }
}
</script>
