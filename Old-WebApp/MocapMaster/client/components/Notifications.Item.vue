<template>
  <div class="notification" :class="{success: type === 'success', error: type === 'error', default: type === 'default'}">
    <el-col :span="18" class="content">
      <b>{{title}}</b>{{content}}
    </el-col>
    <el-col :span="6" class="time">
      {{time}}
    </el-col>
  </div>
</template>

<script>
  import { Col } from "element-ui";

  export default {
    components: {
      "el-col": Col
    },
    props: {
      title: {
        type: String,
        default: null
      },
      content: {
        type: String,
        default: null
      },
      type: {
        type: String,
        default: "default"
      },
      time: {
        type: String,
        default: "undefined"
      }
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  .notification {
    margin: 5px 20px 5px 20px;
    padding: 5px 10px 5px 10px;
    color: @default-dark-font-color;
    background-color: white;
    font-size: 15px;
    border-radius: 3px;
    height: 23px;
    line-height: 23px;
    overflow: hidden;

    &.success {
      box-shadow: rgba(78, 147, 160, 1) 0 0 7px 0;
    }

    &.error {
      box-shadow: rgba(245, 108, 108, 1) 0 0 7px 0;
    }

    &.default {
      box-shadow: fadeout(@shadow-color, 70%) 0 0 7px 0;
    }

    .content {
      overflow: hidden;
    }

    .time {
      text-align: right;
    }
  }
</style>
