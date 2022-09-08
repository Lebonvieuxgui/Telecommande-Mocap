<template>
<el-form-item>
    <div class="record-button">
      <a href="#">
        <el-button v-bind:class="record ? 'liquid1::after' : 'liquid1::before'"
          @click="(record = !record), onSubmit">
          <div v-if="record">
            <el-icon>
              <VideoPause />
            </el-icon>
          </div>
          <div v-else>
            <el-icon>
              <VideoPlay />
            </el-icon>
          </div>
        </el-button>
        <div v-bind:class="record ? 'liquid1' : 'liquid2'"></div>
      </a>
    </div>
  </el-form-item>
</template>

<script>
const onSubmit = () => {
    console.log("submit!");
};

export default {
    name: "RecordButton",
    data() {
        return {
            onSubmit,
            record: false,
        }
    }
}
</script>
